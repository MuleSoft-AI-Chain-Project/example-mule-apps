# ServiceNow Incident Agent

This is an example mule app to demonstrate a servicenow incident agent built with MuleChain Connector. 

The mule flow uses the following connectors:
- MuleChain Connector v0.1.54
- ServiceNow Connector v6.16
- ObjectStore v1.2.2


## Systems involved
- The LLM configuration used in this mule flow is **OpenAI**.
- **ServiceNow Free Instance** was used to build this mule flow. You can register for the ServiceNow Free Instance for this demo: https://developer.servicenow.com/

## ServiceNow Mule Flow 

![App Screenshot](src/main/resources/service_now_incident_agent.png)

This mule flows is tracking each new and/or updated incident in ServiceNow to start the assessment with MuleChain using a defined Prompt Template. 


## Configuration
The mule apps maintains a connections.yaml file under ``/Service_Now_incident_agent/src/main/resources/connections.yaml``, which contains all required parameters to establish the connection. Fill out the following configuration to use this ServiceNow agent. 

```yaml
servicenow:
  url: "https://{your-servicenow-instance}.service-now.com/"
  user: "{your-servicenow-password}"
  password: "{your-servicenow-password}"
  
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

<img src="src/main/resources/llm Config.png" width="50%" height="50%" />

### ServiceNow configuration
The configuration property `user`, `password`, and `url` are linked to the *ServiceNow Connection Config*. 

<img src="src/main/resources/ServiceNowConnection.png" width="50%" height="50%" />

#### Custom Field (*AI Summary*)
1 custom fields need to be created for this mule flow in ServiceNow. 
- *AI Summary* - field where the flow will write suggestion based on AI
- After creating the field, the technical name need to be replaced in the Transform Message before Editing the ServiceNow incident in the mule flow.


<img src="src/main/resources/customfield.png" width="50%" height="50%" />

#### Modify ServiceNow Trigger
Make sure the trigger to shows ALL in the *System Reference* field. This is important to get the comments and notes in the flow.

<img src="src/main/resources/snowtrigger.png" width="70%" height="70%" />

#### Start your app
After configuring the ServiceNow incident agent, let it run and test it out! 

![App Screenshot](src/main/resources/ServiceNowRun.png)


## Watch the demo of the ServiceNow Incident Agent
A demo video to show case the ability of the ServiceNow Incident Agent once deployed in Anypoint Platform. 

[![Watch the video](https://i.ytimg.com/vi/Af1Abxp-zZ8/hqdefault.jpg?sqp=-oaymwE2CPYBEIoBSFXyq4qpAygIARUAAIhCGAFwAcABBvABAfgB_gmAAtAFigIMCAAQARhbIFsoWzAP&rs=AOn4CLCNbU2LxLkh4jhRMMANEt4YEdZf_A)](https://youtu.be/Af1Abxp-zZ8?feature=shared)


## Author

- [@amirkhan-ak-sf](https://github.com/amirkhan-ak-sf)