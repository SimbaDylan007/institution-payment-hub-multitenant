package com.payments.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthCheckController {

    @GetMapping("/health") // Or use a different path like "/health"
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Application is healthy");
    }
}