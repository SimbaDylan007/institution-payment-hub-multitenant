
package com.payments.service;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import com.payments.model.Book;
import com.payments.model.BookTransaction;
import com.payments.model.Student;
import com.payments.repository.BookRepository;
import com.payments.repository.BookTransactionRepository;
import com.payments.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class LibraryService {

    @Autowired private BookRepository bookRepository;
    @Autowired private BookTransactionRepository transactionRepository;
    @Autowired private StudentRepository studentRepository;

    // --- Book Inventory Management ---
    public Page<Book> getAllBooks(String searchTerm, Pageable pageable) {
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

    @Transactional
    public List<Book> bulkAddBooks(MultipartFile file) throws IOException, CsvValidationException {
        List<Book> processedBooks = new ArrayList<>();
        try (Reader reader = new InputStreamReader(file.getInputStream());
             CSVReader csvReader = new CSVReader(reader)) {
            csvReader.skip(1); // Skip header
            String[] line;
            while ((line = csvReader.readNext()) != null) {
                String isbn = line[2];
                Optional<Book> existingBook = bookRepository.findByIsbn(isbn).stream().findFirst();
                Book book = existingBook.orElse(new Book());
                book.setTitle(line[0]);
                book.setAuthor(line[1]);
                book.setIsbn(isbn);
                book.setCategory(line[3]);
                book.setTotalCopies(Integer.parseInt(line[4]));
                if (!existingBook.isPresent()) {
                    book.setAvailableCopies(book.getTotalCopies());
                    book.setStatus("AVAILABLE");
                }
                processedBooks.add(book);
            }
        }
        return bookRepository.saveAll(processedBooks);
    }

    // --- Book Transaction Management ---
    @Transactional
    public BookTransaction issueBook(Long bookId, String studentId) {
        Book book = bookRepository.findById(bookId).orElseThrow(() -> new RuntimeException("Book not found."));
        Student student = studentRepository.findByStudentId(studentId).orElseThrow(() -> new RuntimeException("Student not found."));

        if (book.getAvailableCopies() <= 0) {
            throw new IllegalStateException("No available copies of this book to issue.");
        }

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        book.setStatus(book.getAvailableCopies() > 0 ? "AVAILABLE" : "ISSUED");
        bookRepository.save(book);

        BookTransaction transaction = new BookTransaction();
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
        Book book = bookRepository.findById(bookId).orElseThrow(() -> new RuntimeException("Book not found."));

        BookTransaction transaction = transactionRepository.findFirstByBookIdAndStudentStudentIdAndStatusOrderByIssueDateDesc(book.getId(), studentId, "ISSUED")
                .orElseThrow(() -> new IllegalStateException("No active loan found for this book and student."));

        book.setAvailableCopies(book.getAvailableCopies() + 1);
        book.setStatus("AVAILABLE");
        bookRepository.save(book);

        transaction.setReturnDate(LocalDate.now());
        transaction.setStatus("RETURNED");
        return transactionRepository.save(transaction);
    }

    public Page<BookTransaction> getLoanHistory(String studentId, Pageable pageable) {
        // If the studentId string is empty or null, we pass null to the repository
        // which will then fetch all transactions.
        String searchId = (studentId != null && !studentId.trim().isEmpty()) ? studentId.trim() : null;
        return transactionRepository.findWithFilters(searchId, pageable);
    }
}
