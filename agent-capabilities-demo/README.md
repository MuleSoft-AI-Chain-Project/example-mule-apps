# Agent Capabilities Demo

[**Demo video ▶️**](https://www.youtube.com/watch?v=4kb-0mjzpZ0). Note that this video is for a previous version. Most functionality stayed the same though. Adding and using tools has been replaced by "MCP Tools". The functionality you can demo with the tools is similar.

This is an app to demonstrate the base capabilities of MuleSoft AI Chain, without having to install anything.

This app will allow you to use the following functionality:
- Chat completions
- Prompt decoration
- RAG
- Switching LLM models
- Toxicity detection
- MCP tooling
- Token Governance
- Token usage
- Building knowledge


## Connectors

This app uses the following AI connectors:
- MuleSoft Inference Connector v1.2.0
- MuleSoft Vectors Connector v1.0.0
- MuleSoft WebCrawler Connector v0.4.0
- MuleSoft Whisperer Connector 0.2.80
- JTokkit Connector v0.0.8-snapshot


## Configuration

In the directory `/src/main/resources/` make sure you update the following configurations:

Update the database settings in following files, depending on your deployment target:
- `dev-properties.properties`
- `prd-properties.properties`

Update the API Keys in the following files:
- `dev-properties.properties`
- `prd-properties.properties`

## UI Setup

The UI is now bundled with the Mule application. It can be reached at:
<your-url>/web/index.html

## UI Maintenance

The directory `mac-knowledge-store-static` contains the React 18.3.1 UI project. It also contains some shell scripts that "publish" the static web-site to the Mule application. Note that you will need to change the paths in these scripts to align with your setup.