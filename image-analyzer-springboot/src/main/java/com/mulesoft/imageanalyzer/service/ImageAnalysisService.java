package com.mulesoft.imageanalyzer.service;

import com.mulesoft.imageanalyzer.dto.AnalysisResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.model.Media;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeTypeUtils;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

/**
 * Service for analyzing images and PDFs using OpenAI Vision API
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ImageAnalysisService {

    private final ChatModel chatModel;

    /**
     * Analyzes a PDF file using OpenAI Vision API
     *
     * @param pdfPath Path to the PDF file
     * @param prompt Optional prompt to guide the analysis
     * @return Analysis response with AI-generated description and token usage
     */
    public AnalysisResponse analyzePdf(Path pdfPath, String prompt) throws IOException {
        log.info("Analyzing PDF: {} with prompt: {}", pdfPath, prompt);

        // Use default prompt if not provided
        String analysisPrompt = (prompt == null || prompt.isBlank()) ? "What do you see?" : prompt;

        // Convert PDF pages to images
        List<byte[]> pageImages = convertPdfToImages(pdfPath);

        if (pageImages.isEmpty()) {
            throw new IllegalArgumentException("PDF has no pages or could not be rendered");
        }

        // Create media objects for each page
        List<Media> mediaList = new ArrayList<>();
        for (byte[] imageBytes : pageImages) {
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            Media media = new Media(MimeTypeUtils.IMAGE_PNG, base64Image);
            mediaList.add(media);
        }

        // Create user message with images
        UserMessage userMessage = new UserMessage(analysisPrompt, mediaList);

        // Create prompt and call OpenAI
        Prompt chatPrompt = new Prompt(List.of(userMessage));

        var response = chatModel.call(chatPrompt);

        // Extract token usage
        var metadata = response.getMetadata();
        var usage = metadata.getUsage();

        AnalysisResponse.TokenUsage tokenUsage = AnalysisResponse.TokenUsage.builder()
                .inputCount(usage != null ? (int) usage.getPromptTokens() : 0)
                .outputCount(usage != null ? (int) usage.getGenerationTokens() : 0)
                .totalCount(usage != null ? (int) usage.getTotalTokens() : 0)
                .build();

        String aiResponse = response.getResult().getOutput().getContent();

        log.info("Analysis completed. Tokens used: {}", tokenUsage.getTotalCount());

        return AnalysisResponse.builder()
                .response(aiResponse)
                .tokenUsage(tokenUsage)
                .build();
    }

    /**
     * Converts PDF pages to PNG images
     *
     * @param pdfPath Path to the PDF file
     * @return List of byte arrays, each representing a PNG image
     */
    private List<byte[]> convertPdfToImages(Path pdfPath) throws IOException {
        List<byte[]> images = new ArrayList<>();

        try (PDDocument document = Loader.loadPDF(pdfPath.toFile())) {
            PDFRenderer renderer = new PDFRenderer(document);

            for (int page = 0; page < document.getNumberOfPages(); page++) {
                // Render at 2x resolution for better quality
                BufferedImage bufferedImage = renderer.renderImageWithDPI(page, 150);

                // Convert to PNG bytes
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(bufferedImage, "PNG", baos);
                images.add(baos.toByteArray());

                log.debug("Rendered page {} of {}", page + 1, document.getNumberOfPages());
            }
        }

        return images;
    }

    /**
     * Saves base64 encoded PDF content to a file
     *
     * @param base64Content Base64 encoded PDF content
     * @param uploadDir Directory to save the file
     * @return Path to the saved file
     */
    public Path saveBase64ToFile(String base64Content, Path uploadDir) throws IOException {
        byte[] decodedBytes = Base64.getDecoder().decode(base64Content);

        // Create upload directory if it doesn't exist
        Files.createDirectories(uploadDir);

        // Generate unique filename
        String filename = "upload_" + System.currentTimeMillis() + ".pdf";
        Path filePath = uploadDir.resolve(filename);

        // Write file
        Files.write(filePath, decodedBytes);

        log.info("Saved uploaded file to: {}", filePath);

        return filePath;
    }

    /**
     * Deletes a temporary file
     *
     * @param filePath Path to the file to delete
     */
    public void deleteFile(Path filePath) {
        try {
            Files.deleteIfExists(filePath);
            log.debug("Deleted temporary file: {}", filePath);
        } catch (IOException e) {
            log.warn("Failed to delete temporary file: {}", filePath, e);
        }
    }
}
