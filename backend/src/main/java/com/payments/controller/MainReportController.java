package com.payments.controller;

import com.payments.service.MainReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/main-reports")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class MainReportController {

    @Autowired
    private MainReportService mainReportService;

    @PostMapping("/export")
    public ResponseEntity<InputStreamResource> generateReport(@RequestBody Map<String, Object> request) {
        try {
            String reportType = (String) request.get("reportType");
            String format = (String) request.get("format");
            Map<String, String> filters = (Map<String, String>) request.get("filters");

            ByteArrayInputStream bis = mainReportService.generateReport(reportType, format, filters);

            HttpHeaders headers = new HttpHeaders();
            String filename = reportType.toLowerCase() + "_" + LocalDate.now() + "." + format.toLowerCase();
            headers.add("Content-Disposition", "attachment; filename=" + filename);

            MediaType mediaType;
            switch (format.toLowerCase()) {
                case "pdf":
                    mediaType = MediaType.APPLICATION_PDF;
                    break;
                case "xlsx":
                    mediaType = MediaType.valueOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                    break;
                case "csv":
                    mediaType = MediaType.TEXT_PLAIN;
                    break;
                default:
                    mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .contentType(mediaType)
                    .body(new InputStreamResource(bis));
        } catch (IOException | IllegalArgumentException e) {
            // It's better to return a structured error response
            return ResponseEntity.badRequest().body(null);
        }
    }

    // --- NEW ENDPOINT FOR PREVIEWING DATA ---
    @PostMapping("/preview")
    public ResponseEntity<?> previewReport(@RequestBody Map<String, Object> request) {
        try {
            String reportType = (String) request.get("reportType");
            Map<String, String> filters = (Map<String, String>) request.get("filters");

            Map<String, Object> previewData = mainReportService.generatePreview(reportType, filters);
            return ResponseEntity.ok(previewData);
        } catch (Exception e) {
            // Provide a meaningful error response
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to generate preview: " + e.getMessage()));
        }
    }
}