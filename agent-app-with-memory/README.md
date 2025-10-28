# AI App with Memory
This is a simple AI App with built-in memory using MuleSoft Object Store. 

## Requirements
- MuleSoft Anypoint Code Builder or Anypoint Studio installation
- MuleSoft Runtime 4.9.10
- Java 17
- MuleSoft Inference Connector
- OpenAI API Key

## Getting started
1. Clone and import the mule application
2. Set the openai.apikey in the `configuration.properties.example` file
3. Rename the `configuration.properties.example` to `configuration.properties`
4. Start the app


## Test the app
Use the following curl to test the app with memory. Change the `memory-id` parameter to your name and adjust the `last-messages` to your preference. 

```
curl --location 'http://localhost:8081/chat' \
--header 'memory-id: amir-khan' \
--header 'last-messages: 10' \
--header 'Content-Type: application/json' \
--data '{
    "messages": [
        {
            "role": "user",
            "content": "what is my name"
        }
    ]
}'
```

**Test 1 - Agent doesn't know your name**
1. Ask `What is my name?`
2. The response should be something like `I'm sorry, but I don't have access to personal information about users unless you've shared it with me in this conversation. If you'd like to tell me your name, feel free!`

**Test 2 - Tell agent your name**
1. Ask `My name is John Doe`
2. The response should be something like `Hi John Doe, nice to meet you. How can I help?`

**Test 3 - Ask for your name**
1. Ask `What is my name`
2. The response should be something like `Your name is John Doe. How can I help?`

**Test 4 - Adjust the last-messages parameter**
Adjust the last messages parameter to your liking and try again. 
- last-messages set to `1` shouldn't remember your name.
- last-messages set to `3` should remember your name.


