package com.mulesoft.imageanalyzer.controller;

import com.mulesoft.imageanalyzer.config.ApplicationConfig;
import com.mulesoft.imageanalyzer.dto.AnalysisRequest;
import com.mulesoft.imageanalyzer.dto.AnalysisResponse;
import com.mulesoft.imageanalyzer.service.ImageAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * REST Controller for PDF/Image analysis endpoints
 */
@Slf4j
@RestController
@RequestMapping
@RequiredArgsConstructor
@Validated
public class ImageAnalyzerController {

    private final ImageAnalysisService analysisService;
    private final ApplicationConfig appConfig;

    /**
     * Analyzes a PDF or image file
     *
     * POST /upload
     * Body: {
     *   "pdf": "base64-encoded-content",
     *   "prompt": "optional prompt"
     * }
     *
     * @param request Analysis request containing base64 PDF and optional prompt
     * @return Analysis response with AI description and token usage
     */
    @PostMapping("/upload")
    public ResponseEntity<AnalysisResponse> uploadAndAnalyze(@Valid @RequestBody AnalysisRequest request) {
        log.info("Received upload request");

        Path tempFile = null;
        try {
            // Save base64 content to temporary file
            Path uploadDir = Paths.get(appConfig.getUploadDir());
            tempFile = analysisService.saveBase64ToFile(request.getPdf(), uploadDir);

            // Analyze the PDF
            AnalysisResponse response = analysisService.analyzePdf(tempFile, request.getPrompt());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.error("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();

        } catch (Exception e) {
            log.error("Error analyzing PDF", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();

        } finally {
            // Clean up temporary file
            if (tempFile != null) {
                analysisService.deleteFile(tempFile);
            }
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Image Analyzer is running");
    }
}
