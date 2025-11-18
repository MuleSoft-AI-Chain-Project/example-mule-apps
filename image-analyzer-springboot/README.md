# Image Analyzer - Spring Boot

A Spring Boot application that analyzes PDF documents and images using OpenAI's Vision API (GPT-4 Vision).

This is a conversion of the MuleSoft image-analyzer-app to Spring Boot.

## Features

- REST API for PDF and image analysis
- OpenAI GPT-4 Vision integration
- PDF to image conversion
- Multi-page PDF support
- Token usage tracking
- CORS support
- Static web interface

## Requirements

- Java 17 or higher
- Maven 3.6+
- OpenAI API key

## Quick Start

### 1. Clone and Setup

```bash
cd image-analyzer-springboot
```

### 2. Configure OpenAI API Key

Create a `.env` file or set environment variable:

```bash
export OPENAI_API_KEY=sk-your-openai-api-key-here
```

Or edit `src/main/resources/application.yml`:

```yaml
spring:
  ai:
    openai:
      api-key: sk-your-actual-api-key
```

### 3. Build the Application

```bash
mvn clean install
```

### 4. Run the Application

```bash
mvn spring-boot:run
```

Or run the JAR:

```bash
java -jar target/image-analyzer-springboot-1.0.0.jar
```

The application will start on `http://localhost:8081`

## API Endpoints

### POST /upload

Analyzes a PDF or image file.

**Request:**
```json
{
  "pdf": "base64-encoded-pdf-content",
  "prompt": "What do you see in this document?"
}
```

**Response:**
```json
{
  "response": "The document shows...",
  "tokenUsage": {
    "inputCount": 1250,
    "outputCount": 150,
    "totalCount": 1400
  }
}
```

**Example with curl:**

```bash
# Convert PDF to base64
base64_content=$(base64 -w 0 document.pdf)

# Send request
curl -X POST http://localhost:8081/upload \
  -H "Content-Type: application/json" \
  -d "{\"pdf\": \"$base64_content\", \"prompt\": \"Describe this document\"}"
```

### GET /health

Health check endpoint.

**Response:** `200 OK` with message "Image Analyzer is running"

### GET /web/*

Static resources served from `src/main/resources/static/`

## Configuration

Edit `src/main/resources/application.yml`:

```yaml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      chat:
        options:
          model: gpt-4o              # OpenAI model to use
          max-tokens: 1400            # Maximum tokens in response
          temperature: 0.7            # Creativity (0.0-1.0)

server:
  port: 8081                          # Server port

image-analyzer:
  upload-dir: ${user.home}/image-analyzer/uploads  # Upload directory
  allowed-mime-types:
    - application/pdf
    - image/png
    - image/jpeg
```

## Comparison with MuleSoft Version

### MuleSoft Flow (Original)
```xml
<http:listener path="/upload"/>
<ee:transform> <!-- Base64 decode -->
<file:write path="recording.pdf"/>
<ms-aichain:image-read-scanned-documents/>
<ee:transform> <!-- Format response -->
```

### Spring Boot (Converted)
```java
@PostMapping("/upload")
public ResponseEntity<AnalysisResponse> uploadAndAnalyze(@RequestBody AnalysisRequest request) {
    Path tempFile = analysisService.saveBase64ToFile(request.getPdf(), uploadDir);
    AnalysisResponse response = analysisService.analyzePdf(tempFile, request.getPrompt());
    return ResponseEntity.ok(response);
}
```

## Key Differences from MuleSoft

| Feature | MuleSoft | Spring Boot |
|---------|----------|-------------|
| **Configuration** | XML-based flows | Java annotations |
| **AI Integration** | MuleChain connector | Spring AI |
| **Deployment** | Anypoint Platform | Standalone JAR |
| **File Handling** | Mule home directory | Configurable directory |
| **CORS** | XML interceptor | WebMvcConfigurer |
| **Dependencies** | Mule connectors | Maven dependencies |

## Project Structure

```
image-analyzer-springboot/
├── src/
│   ├── main/
│   │   ├── java/com/mulesoft/imageanalyzer/
│   │   │   ├── ImageAnalyzerApplication.java    # Main class
│   │   │   ├── config/
│   │   │   │   ├── ApplicationConfig.java       # App properties
│   │   │   │   └── WebConfig.java               # Web/CORS config
│   │   │   ├── controller/
│   │   │   │   └── ImageAnalyzerController.java # REST endpoints
│   │   │   ├── dto/
│   │   │   │   ├── AnalysisRequest.java         # Request DTO
│   │   │   │   └── AnalysisResponse.java        # Response DTO
│   │   │   └── service/
│   │   │       └── ImageAnalysisService.java    # Business logic
│   │   └── resources/
│   │       ├── application.yml                  # Configuration
│   │       └── static/                          # Web assets
│   └── test/
├── pom.xml                                      # Maven config
└── README.md
```

## Dependencies

- **Spring Boot 3.2.0** - Application framework
- **Spring AI 1.0.0-M4** - OpenAI integration
- **Apache PDFBox 3.0.1** - PDF processing
- **Lombok** - Reduce boilerplate code

## Troubleshooting

### "API key not found" error
Make sure you've set the `OPENAI_API_KEY` environment variable or configured it in `application.yml`

### PDF conversion fails
Ensure the uploaded content is valid base64-encoded PDF

### High token usage
Reduce the number of PDF pages or decrease image resolution in `ImageAnalysisService.java` (line: `renderImageWithDPI(page, 150)`)

## Testing

Run tests with:
```bash
mvn test
```

## Building for Production

```bash
mvn clean package -DskipTests
java -jar target/image-analyzer-springboot-1.0.0.jar
```

## License

Same as the original MuleSoft example apps.
