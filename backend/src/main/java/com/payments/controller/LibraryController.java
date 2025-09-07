package com.payments.controller;

import com.opencsv.exceptions.CsvValidationException;
import com.payments.model.Book;
import com.payments.model.BookTransaction;
import com.payments.service.LibraryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/library")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'ADMINISTRATOR')")
public class LibraryController {

    @Autowired private LibraryService libraryService;

    @GetMapping("/books")
    public ResponseEntity<Page<Book>> getAllBooks(@RequestParam(defaultValue = "") String searchTerm, Pageable pageable) {
        return ResponseEntity.ok(libraryService.getAllBooks(searchTerm, pageable));
    }

    @PostMapping("/books/bulk-upload")
    public ResponseEntity<?> bulkAddBooks(@RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(libraryService.bulkAddBooks(file));
        } catch (IOException | CsvValidationException | RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/books")
    public ResponseEntity<Book> addBook(@RequestBody Book book) { return ResponseEntity.ok(libraryService.addBook(book)); }

    @PutMapping("/books/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book bookDetails) { return ResponseEntity.ok(libraryService.updateBook(id, bookDetails)); }

    @DeleteMapping("/books/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        try { libraryService.deleteBook(id); return ResponseEntity.noContent().build(); }
        catch (Exception e) { return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST); }
    }

    @PostMapping("/books/issue")
    public ResponseEntity<?> issueBook(@RequestParam Long bookId, @RequestParam String studentId) {
        try { return ResponseEntity.ok(libraryService.issueBook(bookId, studentId)); }
        catch (Exception e) { return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST); }
    }

    @PostMapping("/books/return")
    public ResponseEntity<?> returnBook(@RequestParam Long bookId, @RequestParam String studentId) {
        try { return ResponseEntity.ok(libraryService.returnBook(bookId, studentId)); }
        catch (Exception e) { return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST); }
    }

    @GetMapping("/transactions")
    public ResponseEntity<Page<BookTransaction>> getLoanHistory(
            @RequestParam(required = false) String studentId,
            Pageable pageable) {
        return ResponseEntity.ok(libraryService.getLoanHistory(studentId, pageable));
    }
}