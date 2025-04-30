# ServiceNow Incident Agent

This is an example mule app to demonstrate a servicenow incident agent built with MuleChain Connector. 

The mule flow uses the following connectors:
- MuleSoft AI Chain Connector v1.0.0
- ServiceNow Connector v6.17.1
- ObjectStore v1.2.2
- HTTP Connector v1.10.3
- Sockets v1.2.5


## Systems involved
- The LLM configuration used in this mule flow is **OpenAI**. Configuration file can support others if needed.
- **ServiceNow Free Instance** was used to build this mule flow. You can register for the ServiceNow Free Instance for this demo: https://developer.servicenow.com/

## ServiceNow Mule Flow 

![App Screenshot](src/main/resources/service_now_incident_agent.png)

This mule flows is tracking each new and/or updated incident in ServiceNow to start the assessment with MuleSoft AI Chain using an Agent defined Prompt Template. 


## Configuration
The configuration contains 2 files to be populated:
- connections.yaml
- envVars.json

### connections.yaml
The mule apps maintains a connections.yaml file under ``/service_now_incident_agent/src/main/resources/connections.yaml``, which contains all required parameters to establish the connection. Fill out the following configuration to use this ServiceNow agent. 

```yaml
servicenow:
  url: "https://{your-servicenow-instance}.service-now.com/"
  user: "{your-servicenow-username}"
  password: "{your-servicenow-password}"
```

The connections.yaml is mapped to the dedicated connectors in the mule flow. 

### envVars.json
All LLM configuration properties are under ``/service_now_incident_agent/src/main/resources/envVars.json``, which contains all required parameters for the LLM. Fill out the following configuration for the LLM of your need. Note, that only the six LLMs are currently supported.


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

### MuleSoft AI Chain configuration
In the MuleSoft AI Chain LLM Configuration, you have to select the LLM type from the dropdown, the configuraiton type must be set to *Configuration Json* and the *File path* must set to the path of the ``/service_now_incident_agent/src/main/resources/envVars.json``. To make it dynamically linked to the resources, you can use the dataweave statement ```mule.home ++ "/apps/" ++ app.name ++ "/envVars.json"```. All relevant informations are extracted from the **envVars.json** during runtime. 

<img src="src/main/resources/llm Config.png" width="50%" height="50%" />

### ServiceNow configuration
The configuration property `user`, `password`, and `url` are linked to the *ServiceNow Connection Config*. 

<img src="src/main/resources/ServiceNowConnection.png" width="50%" height="50%" />

#### Custom Field (*AI Summary*)
1 custom field will need to be created for this mule flow in ServiceNow. 
- *AI Summary* - field where the flow will write suggestion based on AI
- After creating the field, the technical name need to be replaced in the Transform Message before Editing the ServiceNow incident in the mule flow.
- There is also a post to the field *description* in case you are not able to create the custom *AI Summary* field.


<img src="src/main/resources/customfield1.png" width="50%" height="50%" />
<img src="src/main/resources/customfield2.png" width="50%" height="50%" />

#### Modify ServiceNow Trigger
Make sure the trigger to shows ALL in the *System Reference* field. This is important to get the comments and notes in the flow.

<img src="src/main/resources/snowtrigger.png" width="70%" height="70%" />

#### JRE System Library -> Java 17
Before starting the Mule App, make sure the check that Java 17 is set in the **JRE System Library**. You can check this by the project context menu > Mule > Open Mule Project Properties **Build Path > Configure Build Path > Libraries (Tab)**. 

![App Screenshot](src/main/resources/java17.png)

#### Start your app
After configuring the ServiceNow incident agent, let it run and test it out! 

![App Screenshot](src/main/resources/ServiceNowRun.png)


## Watch the demo of the ServiceNow Incident Agent
A demo video to show case the ability of the ServiceNow Incident Agent once deployed in Anypoint Platform. 

[![Watch the video](https://i.ytimg.com/vi/iEl5HeHC_Go/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDjBH-KxvEDNF0dyK5p4OUQ3b1FRA)](https://youtu.be/iEl5HeHC_Go?si=8Iejp-GtBKf9XK-v)


## Author

- [@amirkhan-ak-sf](https://github.com/amirkhan-ak-sf)

### Updates

- [@mrrontam](https://github.com/mrrontam) 04-30-2025