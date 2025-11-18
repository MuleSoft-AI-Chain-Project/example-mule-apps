package com.mulesoft.imageanalyzer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for image/PDF analysis
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResponse {

    /**
     * The AI-generated response describing the image/PDF content
     */
    @JsonProperty("response")
    private String response;

    /**
     * Token usage information
     */
    @JsonProperty("tokenUsage")
    private TokenUsage tokenUsage;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TokenUsage {
        @JsonProperty("inputCount")
        private Integer inputCount;

        @JsonProperty("outputCount")
        private Integer outputCount;

        @JsonProperty("totalCount")
        private Integer totalCount;
    }
}
