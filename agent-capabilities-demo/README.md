# Agent Capabilities Demo

[**Demo video ▶️**](https://www.youtube.com/watch?v=4kb-0mjzpZ0)

This is an app to demonstrate the base capabilities of MuleSoft AI Chain, without having to install anything.

This app will allow you to use the following funcionality:
- Chat completions
- Prompt decoration
- RAG
- Switching LLM models
- Toxicity detection
- Dynamic tooling
- Token Governance
- Token usage
- Building knowledge


## Connectors

This app uses the following connectors:
- MuleSoft AI Connector v1.2.0
- MuleSoft WebCrawler Connector v0.35.0
- MuleSoft Whisperer Connector 0.2.0
- JTokkit Connector v0.8.0


## Configuration

In the directory `/src/main/resources/` make sure you update the following configurations:

Update the store location in following files, depending on your deployment target:
- `dev-properties.properties`
- `prd-properties.properties`

Update the API Keys in the following files:
- `dev-properties.properties`
- `prd-properties.properties`
- `config.json`
