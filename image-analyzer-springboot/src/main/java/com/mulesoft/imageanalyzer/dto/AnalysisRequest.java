package com.mulesoft.imageanalyzer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for image/PDF analysis
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisRequest {

    /**
     * Base64 encoded PDF or image content
     */
    @NotBlank(message = "PDF content is required")
    @JsonProperty("pdf")
    private String pdf;

    /**
     * Optional prompt to guide the analysis
     * If not provided, defaults to "What do you see?"
     */
    @JsonProperty("prompt")
    private String prompt;
}
