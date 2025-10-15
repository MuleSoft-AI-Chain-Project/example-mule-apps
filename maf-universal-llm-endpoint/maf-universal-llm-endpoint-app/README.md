# OpenAI Responses API to Chat Completions API Adapter

A MuleSoft application that exposes the OpenAI Responses API and translates requests to a Chat Completions compatible API format.

## Overview

This adapter serves as a temporary workaround to enable MuleSoft Agent Fabric demos without requiring an actual OpenAI account. It translates between:

- **OpenAI Responses API** (expected by MuleSoft Agent Fabric)
- **Chat Completions API** (supported by compatible LLM providers)

## Features

- Converts API request/response formats between the two APIs
- Maintains conversation history using Object Store
- Handles authentication via API keys (extracts the bearer token from the Authorization header)
- Provides memory retrieval for multi-turn conversations
- Tracks token usage statistics

## Technical Details

### Endpoints

- **POST /responses**: Creates a new completion from user input

### Configuration

The application uses the following configuration properties:

```properties
openai.model=<model-name>
openai.url=<chat-completions-api-url>
openai.max_tokens=<max-tokens-value>
openai.temperature=<temperature-value>
os.max_entries=<max-entries-value>
```

### Dependencies

- Mule Runtime: 4.9.9
- HTTP Connector: 1.10.5
- Sockets Connector: 1.2.6
- Inference Connector: 1.2.0
- ObjectStore Connector: 1.2.3

## How It Works

1. **Request Transformation**: Converts incoming OpenAI Responses API requests to the Chat Completions API format
2. **Memory Management**: Retrieves conversation history from Object Store when a `previous_response_id` is provided
3. **API Call**: Makes the call to the Chat Completions API using the MuleSoft Inference connector
4. **Response Transformation**: Converts the Chat Completions response back to the OpenAI Responses format for Agent Fabric
5. **Memory Storage**: Stores conversation history in Object Store for future reference

## Usage Example

### Request

```
POST /responses
Authorization: Bearer your-api-key-here
Content-Type: application/json

{
  "input": "Tell me a three sentence bedtime story about a unicorn.",
  "previous_response_id": "resp_67ccd2bed1ec8190b14f964abc0542670bb6a6b452d3795b"
}
```

### Response

```json
{
  "id": "resp_67ccd2bed1ec8190b14f964abc0542670bb6a6b452d3795b",
  "object": "response",
  "status": "completed",
  "model": "gpt-4.1-2025-04-14",
  "output": [
    {
      "type": "message",
      "id": "msg_67ccd2bf17f0819081ff3bb2cf6508e60bb6a6b452d3795b",
      "status": "completed",
      "role": "assistant",
      "content": [
        {
          "type": "output_text",
          "text": "In a peaceful grove beneath a silver moon, a unicorn named Lumina discovered a hidden pool that reflected the stars. As she dipped her horn into the water, the pool began to shimmer, revealing a pathway to a magical realm of endless night skies. Filled with wonder, Lumina whispered a wish for all who dream to find their own hidden magic, and as she glanced back, her hoofprints sparkled like stardust.",
          "annotations": []
        }
      ]
    }
  ],
  "usage": {
    "input_tokens": 36,
    "output_tokens": 87,
    "total_tokens": 123
  }
}
```

## Deployment

This application can be deployed to CloudHub or as a standalone Mule application. Make sure to:

1. Configure the appropriate API key for the Chat Completions provider (this will be passed as a Bearer token in the Authorization header)
2. Set the correct Chat Completions API URL in the properties configuration
3. Adjust memory settings based on expected usage

## Important Notes

- This adapter is a **temporary solution** intended for demonstration purposes only
- The Object Store implementation uses in-memory storage with a 60-minute TTL

## Requirements

- Java 17
- Mule Runtime 4.9.0 or later
