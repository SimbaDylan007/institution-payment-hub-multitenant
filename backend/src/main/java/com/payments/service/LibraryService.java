package com.payments.service;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import com.payments.model.*;
import com.payments.repository.*;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class LibraryService {

    @Autowired private BookRepository bookRepository;
    @Autowired private BookTransactionRepository transactionRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private UserRepository userRepository;
    @PersistenceContext private EntityManager entityManager;

    // --- Book Inventory Management ---
    public Page<Book> getAllBooks(String searchTerm, Pageable pageable, Long institutionId) {
        if (isSuperAdmin(getCurrentUser()) && institutionId != null) {
            Session session = entityManager.unwrap(Session.class);
            session.disableFilter("institutionFilter");
            return bookRepository.findAllByInstitutionIdAndSearch(institutionId, searchTerm, pageable);
        }
        return bookRepository.findAllWithSearch(searchTerm, pageable);
    }

    
    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }
    
    public List<Book> searchBooksByTitle(String title) {
        return bookRepository.findByTitleContainingIgnoreCase(title);
    }
    
    public List<Book> searchBooksByAuthor(String author) {
        return bookRepository.findByAuthorContainingIgnoreCase(author);
    }
    
    public List<Book> getBooksByCategory(String category) {
        return bookRepository.findByCategory(category);
    }
    
    public List<Book> getAvailableBooks() {
        return bookRepository.findAvailableBooks();
    }
    
    @Transactional
    public Book addBook(Book book) {
        // --- TENANCY ENFORCEMENT ---
        User currentUser = getCurrentUser();
        book.setInstitution(currentUser.getInstitution());
        book.setAvailableCopies(book.getTotalCopies());
        book.setStatus("AVAILABLE");
        return bookRepository.save(book);
    }
    
    @Transactional
    public Book updateBook(Long id, Book bookDetails) {
        Optional<Book> optionalBook = bookRepository.findById(id);
        if (optionalBook.isPresent()) {
            Book book = optionalBook.get();
            book.setTitle(bookDetails.getTitle());
            book.setAuthor(bookDetails.getAuthor());
            book.setIsbn(bookDetails.getIsbn());
            book.setPublisher(bookDetails.getPublisher());
            book.setPublishedDate(bookDetails.getPublishedDate());
            book.setCategory(bookDetails.getCategory());
            book.setTotalCopies(bookDetails.getTotalCopies());
            book.setLocation(bookDetails.getLocation());
            return bookRepository.save(book);
        }
        return null;
    }

    @Transactional
    public void deleteBook(Long id) {
        if (transactionRepository.findByBookIdAndStatus(id, "ISSUED").size() > 0) {
            throw new IllegalStateException("Cannot delete book: One or more copies are currently issued to students.");
        }
        bookRepository.deleteById(id);
    }

//    @Transactional
//    public List<Book> bulkAddBooks(MultipartFile file) throws IOException, CsvValidationException {
//        List<Book> processedBooks = new ArrayList<>();
//        try (Reader reader = new InputStreamReader(file.getInputStream());
//             CSVReader csvReader = new CSVReader(reader)) {
//            csvReader.skip(1); // Skip header
//            String[] line;
//            while ((line = csvReader.readNext()) != null) {
//                String isbn = line[2];
//                Optional<Book> existingBook = bookRepository.findByIsbn(isbn).stream().findFirst();
//                Book book = existingBook.orElse(new Book());
//                book.setTitle(line[0]);
//                book.setAuthor(line[1]);
//                book.setIsbn(isbn);
//                book.setCategory(line[3]);
//                book.setTotalCopies(Integer.parseInt(line[4]));
//                if (!existingBook.isPresent()) {
//                    book.setAvailableCopies(book.getTotalCopies());
//                    book.setStatus("AVAILABLE");
//                }
//                processedBooks.add(book);
//            }
//        }
//        return bookRepository.saveAll(processedBooks);
//    }

    @Transactional
    public List<Book> bulkAddBooks(MultipartFile file, Long institutionIdOverride) throws IOException, CsvValidationException {
        // 1. Determine the target institution for the import
        User currentUser = getCurrentUser();
        Institution targetInstitution = determineTargetInstitution(currentUser, institutionIdOverride);

        List<Book> processedBooks = new ArrayList<>();
        try (Reader reader = new InputStreamReader(file.getInputStream());
             CSVReader csvReader = new CSVReader(reader)) {
            csvReader.skip(1); // Skip header
            String[] line;
            while ((line = csvReader.readNext()) != null) {
                String isbn = line[2];
                // 2. When searching for existing books, it's now crucial to also check the institution
                // This requires a new repository method: findByIsbnAndInstitution
                Optional<Book> existingBook = bookRepository.findByIsbnAndInstitution(isbn, targetInstitution);

                Book book = existingBook.orElse(new Book());

                // 3. Stamp the institution on every record, new or existing
                book.setInstitution(targetInstitution);

                book.setTitle(line[0]);
                book.setAuthor(line[1]);
                book.setIsbn(isbn);
                book.setCategory(line[3]);
                book.setTotalCopies(Integer.parseInt(line[4]));

                if (existingBook.isEmpty()) { // Use isEmpty() for modern Java
                    book.setAvailableCopies(book.getTotalCopies());
                    book.setStatus("AVAILABLE");
                }
                // If the book exists, we're just updating its details, not availableCopies

                processedBooks.add(book);
            }
        }
        return bookRepository.saveAll(processedBooks);
    }


    private Institution determineTargetInstitution(User currentUser, Long institutionIdOverride) {
        if (isSuperAdmin(currentUser) && institutionIdOverride != null) {
            Institution institution = entityManager.find(Institution.class, institutionIdOverride);
            if (institution == null) throw new IllegalArgumentException("Invalid institution ID for bulk import.");
            return institution;
        }
        Institution target = currentUser.getInstitution();
        if (target == null) throw new IllegalStateException("You must belong to an institution to perform this action.");
        return target;
    }

    // --- Book Transaction Management ---
//    @Transactional
//    public BookTransaction issueBook(Long bookId, String studentId) {
//        Book book = bookRepository.findById(bookId).orElseThrow(() -> new RuntimeException("Book not found."));
//        Student student = studentRepository.findByStudentId(studentId).orElseThrow(() -> new RuntimeException("Student not found."));
//
//        if (!Objects.equals(book.getInstitution().getId(), student.getInstitution().getId())) {
//            throw new SecurityException("Cannot issue a book to a student from a different institution.");
//        }
//
//        if (book.getAvailableCopies() <= 0) {
//            throw new IllegalStateException("No available copies of this book to issue.");
//        }
//
//        book.setStatus(book.getAvailableCopies() > 0 ? "AVAILABLE" : "ISSUED");
//        bookRepository.save(book);
//
//        BookTransaction transaction = new BookTransaction();
//        transaction.setInstitution(student.getInstitution());
//        transaction.setBook(book);
//        transaction.setStudent(student);
//        transaction.setIssueDate(LocalDate.now());
//        transaction.setDueDate(LocalDate.now().plusWeeks(2)); // Default 2-week loan period
//        transaction.setStatus("ISSUED");
//        return transactionRepository.save(transaction);
//    }

    @Transactional
    public BookTransaction issueBook(Long bookId, String studentId) {
        // 1. Fetch the book and student. The Hibernate Filter ensures they are within the user's institution.
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));
        Student student = studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));

        // 2. Explicit cross-tenancy check for added security.
        if (!Objects.equals(book.getInstitution().getId(), student.getInstitution().getId())) {
            throw new SecurityException("Cannot issue a book to a student from a different institution.");
        }

        // 3. Check for availability.
        if (book.getAvailableCopies() <= 0) {
            throw new IllegalStateException("No available copies of this book to issue. All copies are currently on loan.");
        }

        // --- THIS IS THE FIX ---
        // 4. Decrement the available copy count.
        book.setAvailableCopies(book.getAvailableCopies() - 1);

        // 5. Update the book's overall status based on the NEW count.
        if (book.getAvailableCopies() == 0) {
            book.setStatus("ISSUED"); // All copies are now out on loan
        } else {
            book.setStatus("AVAILABLE"); // Some copies are still available
        }
        bookRepository.save(book);
        // --- END OF FIX ---

        // 6. Create the new transaction record.
        BookTransaction transaction = new BookTransaction();
        transaction.setInstitution(student.getInstitution()); // Stamp the institution
        transaction.setBook(book);
        transaction.setStudent(student);
        transaction.setIssueDate(LocalDate.now());
        transaction.setDueDate(LocalDate.now().plusWeeks(2)); // Default 2-week loan period
        transaction.setStatus("ISSUED");

        return transactionRepository.save(transaction);
    }

    
    public Long getBookCountByStatus(String status) {
        return bookRepository.countByStatus(status);
    }

    @Transactional
    public BookTransaction returnBook(Long bookId, String studentId) {
        Student student = studentRepository.findByStudentId(studentId).orElseThrow(() -> new RuntimeException("Student not found."));
        Book book = bookRepository.findById(bookId).orElseThrow(() -> new RuntimeException("Book not found."));

        BookTransaction transaction = transactionRepository
                .findFirstByBookAndStudentAndStatusOrderByIssueDateDesc(book, student, "ISSUED")
                .orElseThrow(() -> new IllegalStateException("No active loan found for this book and student."));

        User currentUser = getCurrentUser();
        if (currentUser.getInstitution() != null && !currentUser.getInstitution().getId().equals(transaction.getInstitution().getId())) {
            throw new SecurityException("You do not have permission to return this book.");
        }

        // --- FIX: The book object was already fetched. Use it. ---
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        transaction.setReturnDate(java.time.LocalDate.now());
        transaction.setStatus("RETURNED");
        return transactionRepository.save(transaction);
    }

    public Page<BookTransaction> getLoanHistory(String studentId, Pageable pageable, Long institutionId) {
        if (isSuperAdmin(getCurrentUser()) && institutionId != null) {
            Session session = entityManager.unwrap(Session.class);
            session.disableFilter("institutionFilter");
            return transactionRepository.findByInstitutionIdWithFilters(institutionId, studentId, pageable);
        }
        String searchId = (studentId != null && !studentId.trim().isEmpty()) ? studentId.trim() : null;
        return transactionRepository.findWithFilters(searchId, pageable);
    }

    private boolean isSuperAdmin(User user) {
        return user.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_SUPER_ADMIN"));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((org.springframework.security.core.userdetails.User) authentication.getPrincipal()).getUsername();
        return userRepository.findByUsername(username).orElseThrow(() -> new IllegalStateException("Authenticated user not found."));
    }
}
