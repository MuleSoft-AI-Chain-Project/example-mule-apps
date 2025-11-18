package com.mulesoft.imageanalyzer.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Application-specific configuration properties
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "image-analyzer")
public class ApplicationConfig {

    /**
     * Directory where uploaded files are temporarily stored
     */
    private String uploadDir;

    /**
     * List of allowed MIME types for upload
     */
    private List<String> allowedMimeTypes;
}
