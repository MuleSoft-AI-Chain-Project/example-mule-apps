# Jira Bug Agent

This is an example mule app to demonstrate a jira bug agent built with MuleChain Connector. 

The mule flow uses the following connectors:
- MuleChain Connector v0.1.54
- Jira Connector v1.2.11
- ObjectStore v1.2.2


## Systems involved
- The LLM configuration used in this mule flow is **OpenAI**.
- **Jira Cloud** was used to build this mule flow. You can register for the Jira Free Plan for this demo: https://www.atlassian.com/try/cloud/signup?bundle=jira-software&edition=free

## Jira Mule Flow 

![App Screenshot](src/main/resources/jira_bug_agent.png)

This mule flows is tracking each new and/or updated bug in Jira to start the assessment with MuleChain using a defined Prompt Template and Sentiment Analyzer. 


## Configuration
The configuration contains 2 files to be populated:
- connections.yaml
- envVars.json

### connections.yaml
The mule apps maintains a connections.yaml file under ``/jira_bug_agent/src/main/resources/connections.yaml``, which contains all required parameters to establish the connection. Fill out the following configuration to use this Jira agent. 

```yaml
jira:
  url: "{your-jira-baseurl}"
  user: "{your-jira-user}"
  api-token: "{your-api-token}"
```

The connections.yaml is mapped to the dedicated connectors in the mule flow. 

### envVars.json
All LLM configuration properties are under ``/jira_bug_agent/src/main/resources/envVars.json``, which contains all required parameters for the LLM. Fill out the following configuration for the LLM of your need. Note, that only the six LLMs are currently supported.


```json
{
    "OPENAI": {
        "OPENAI_API_KEY": "YOUR_OPENAI_API_KEY"
    },
    "MISTRAL_AI": {
        "MISTRAL_AI_API_KEY": "YOUR_MISTRAL_AI_API_KEY"
    },
    "OLLAMA": {
        "OLLAMA_BASE_URL": "http://baseurl.ollama.com"
    },
    "ANTHROPIC": {
        "ANTHROPIC_API_KEY": "YOUR_ANTHROPIC_API_KEY"
    },
    "AZURE_OPENAI": {
        "AZURE_OPENAI_KEY": "YOUR_AZURE_OPENAI_KEY",
        "AZURE_OPENAI_ENDPOINT": "http://endpoint.azure.com",
        "AZURE_OPENAI_DEPLOYMENT_NAME": "YOUR_DEPLOYMENT_NAME"
    }
}
```

### MuleChain configuration
In the MuleChain LLM Configuraiton, you have to select the LLM type from the dropdown, the configuraiton type must be set to *Configuration Json* and the *File path* must set to the path of the ``/jira_bug_agent/src/main/resources/envVars.json``. To make it dynamically linked to the resources, you can use the dataweave statement ```mule.home ++ "/apps/" ++ app.name ++ "/envVars.json"```. All relevant informations are extracted from the **envVars.json** during runtime. 

<img src="src/main/resources/mulechain-configuration.png" width="50%" height="50%" />

### Jira configuration
The configuration property `user`, `api-token`, and `url` are linked to the *Jira Connection Config*. 

<img src="src/main/resources/Jira-config.png" width="50%" height="50%" />


#### API Token
- The api token for Jira Cloud can be generated using the following link: https://id.atlassian.com/manage-profile/security/api-tokens

#### Custom Fields (*AI Summary* and *Sentiment*)
2 custom fields need to be created for this mule flow in Jira. 
- *AI Summary* - field where the flow will write suggestion based on AI
- *Sentiment* - field to highlight the sentiment of the bug
- After creating the 2 fields, the technical name need to be replaced in the Transform Message before Editing the Jira issue in the mule flow.


<img src="src/main/resources/jira-custom-fields.png" width="50%" height="50%" />

#### Modify Jira Trigger
Modify the trigger to change the start date and the jira project Id with your jira project Id as highlighted below. 

<img src="src/main/resources/JIRA source.png" width="100%" height="100%" />

#### Start your app
After configuring the Jira bug agent, let it run and test it out! 

![App Screenshot](src/main/resources/RunAgent.png)


## Watch the demo of the Jira Bug Agent
A demo video to show case the ability of the Jira Bug Agent once deployed in Anypoint Platform. 

[![Watch the video](https://i.ytimg.com/vi/2Bg8-lAFUxo/hqdefault.jpg?sqp=-oaymwE2CNACELwBSFXyq4qpAygIARUAAIhCGAFwAcABBvABAfgB_gmAAswFigIMCAAQARhhIGEoYTAP&rs=AOn4CLDGYnqID77C7TZJGVPoXp-Cces4rA)](https://www.youtube.com/watch?v=2Bg8-lAFUxo)


## Author

- [@amirkhan-ak-sf](https://github.com/amirkhan-ak-sf)