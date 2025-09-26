# MCP Catalog & Playground Demo

## Overview

The **MCP Catalog & Playground** enables Mule MCP Developers to quickly test out the semantics of MCP Servers deployed to Cloudhub. Currently this demo playground doesn't support MCP Server Authentication, the purpose (for now) is to import freshly deployed MCP Servers into the playground catalog and test out the semantics in different modes. 

### Pre-requisites
In order to use this demo, make sure to:
- MuleSoft Runtime Version 4.9.9 EE
- Java Version 17
- MuleSoft Anypoint Studio
- Minimum 1 API credentials for
    - OpenAI
    - Mistral
    - XAI
    - Salesforce Einstein
- Add MCP servers which are support HTTP Streamable Connections with `/mcp` as path
- MCP Server should not be secured with Authentication


### Experimental Modes

This playground provides different experimental modes for MCP Servers from low level function callings to fully fledge agent mode.

#### Function Calling 
Use this mode, when you are in the early design of your MCP Servers and Semantics. Very good for testing MCP Server Mocks. 

#### Augmented Tooling
Use this mode to understand the LLMs rational behind choosing a tool. 

#### MCP Tooling 
Use this mode when you deployed MCP Servers with real system access to validate if the correct tools are being used by the reasoning.

#### Augmented MCP 
Use this mode to see how an agent would reply when using a MCP Tool with an augmented answer.

#### Agent Mode
Use this mode to multiple MCP Servers and tools for a certain user query to understand the semantic and  its potential misconfigurations.


[Demo Video](https://www.youtube.com/watch?v=AkHblt2g99Q)

[Tutorial Video - coming soon]

### Getting started!

### Configuration Steps

1. **Clone and Import**
   ```bash
   # This app need to be imported separately into Anypoint Studio
   ```

2. **Configure Properties**
   
   Rename or copy the `config.properties.example` to `config.properties` and configure:

   **Common Properties:**
   ```properties
    http.port=8081
    general.maxToken=5000
    openai.apikey=<YOUR-OPENAI-APIKEY>
    mistral.apikey=<YOUR-MISTRAL-APIKEY>
    xai.apikey=<YOUR-XAI-APIKEY>

    salesforce.tokenUrl=<YOUR_SALESFORCE_ORG_TOKEN_URL>
    salesforce.clientId=<YOUR_SALESFORCE_CLIENT_ID>
    salesforce.clientSecret=<YOUR_SALESFORCE_CLIENT_SECRET>

    einstein.queryAssessmentModel=sfdc_ai__DefaultGPT41
    einstein.agentReasoningModel=sfdc_ai__DefaultGPT41
   ```
3. **Test Application Locally**

Enter minimum 1 LLM Configuration (Salesforce, OpenAI, Mistral or XAI) to test the application locally. Deploy the application from Studio and test it in your browser using `http://localhost:8081/ui/index.html`   

During the test add deployed MCP Servers to the MCP tab and test out in different modes. 

4. **Deploy Application to Cloudhub**

After you are satisfied with the local test, deploy the application to Cloudhub
   
## 💡 Usage Examples

### Web UI Interaction
1. Navigate to `https://your-gateway-url/ui/index.html`
2. Add one or more MCP Servers in to your MCP catalog
3. Start a conversation with natural language queries in different experiment modes.

### Sample Conversations

**ERP Focused:**
- "Check inventory for material MULETEST0"
- "Create a sales order for 5 units of MULETEST0"  
- "Process delivery for order 12345"

**CRM Focused:**  
- "Show me all accounts containing 'MuleSoft'"
- "Create a new account for Acme Corp"
- "Update account ABC123 with new billing address"


