package com.mulesoft.imageanalyzer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

/**
 * Main Spring Boot Application for Image Analyzer
 *
 * This application provides a REST API for analyzing PDF documents and images
 * using OpenAI's Vision API (GPT-4 Vision).
 */
@SpringBootApplication
@EnableConfigurationProperties
public class ImageAnalyzerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ImageAnalyzerApplication.class, args);
    }
}
