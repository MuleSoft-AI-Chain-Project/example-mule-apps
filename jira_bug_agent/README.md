# Jira Bug Agent

This is an example mule app to demonstrate a jira bug agent built with MuleChain Connector. 

The mule flow uses the following connectors:
- MuleChain Connector v0.1.54
- Jira Connector v1.2.11
- ObjectStore v1.2.2


## Systems involved
- The LLM configuration used in this mule flow is **OpenAI**.
- **Jira Cloud** was used to build this mule flow. You can register for the Jira Free Plan for this demo: https://www.atlassian.com/try/cloud/signup?bundle=jira-software&edition=free

## Configuration
The mule apps maintains a connections.yaml file under ``/jira_bug_agent/src/main/resources/connections.yaml``, which contains all required parameters to establish the connection. Fill out the following configuration to use this Jira agent. 


```yaml
jira:
  url: "{your-jira-baseurl}"
  user: "{your-jira-user}"
  api-token: "{your-api-token}"
  
mulechain:
  api-key-openai: "{your-open-ai-api-key}"
  api-key-openai-demo: "demo"
  api-key-mistralai: "{your-mistral-ai-api-key}"
  base-url-ollama: "{your-base-url-ollama}"
  api-key-anthropic: "{your-anthropic-api-key}"
```

The connections.yaml is mapped to the dedicated connectors in the mule flow. 

### MuleChain configuration
The configuration property `api-key-openai-demo`is linked to the *Llm api key* field in the MuleChain configuration.

![App Screenshot](src/main/resources/mule-chain-config.png)

### Jira configuration
The configuration property `user`, `api-token`, and `url` are linked to the *Jira Connection Config*. The api token for Jira Cloud can be generated using the following link: https://id.atlassian.com/manage-profile/security/api-tokens

![App Screenshot](src/main/resources/Jira-config.png)

## Jira Mule Flow 

![App Screenshot](src/main/resources/jira_bug_agent.png)

This mule flows is tracking each new and/or updated bug in Jira to start the assessment with MuleChain using a defined Prompt Template and Sentiment Analyzer. 

## Author

- [@amirkhan-ak-sf](https://github.com/amirkhan-ak-sf)