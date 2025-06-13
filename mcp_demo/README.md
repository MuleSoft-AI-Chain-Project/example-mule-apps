# Mule MCP Demo

This is an example mule app to demonstrate an agent using MCP servers and the Inference Connector to build the client

The mule flow uses the following connectors:
- MuleSoft AI Chain Inference connector v0.5.004
- MCP Connector v0.1.0 (BETA)


## Systems involved
- The LLM configuration used is **OpenAI**, model gpt-4o-mini.
- The MCP server is created with MuleSoft MCP Connector over HTTP and SSE


## Instructions

This app is already deployed and can be used from the following URL:

http://mcp-native-inf-ch1-100-mule-application.us-e2.cloudhub.io/web/index.html

❗️ Use HTTP, not HTTPS


### Run locally

Import as Mule Project or import the `jar` file.

There are a few things to have in mind:
- Runtime version: minimum 4.9.3
- Add `-Dmule.http.service.implementation=NETTY` to the run configuration (_Run As -> Run configurations -> Arguments_)
- Add your own API Key in the Inference Connector Configuration


### How to demo


You can ask general questions:

- What is the capital of Switzerland?
- What is the population of London?

Or dedicated tool specific questions, where MCP plays a role:

- Check Inventory for MULETEST0
- Get CRM accounts for InnovateX

Or even chaining of calls (with Inference + MCP in action).  i.e.

- Check Inventory for MULETEST0 and if available quantity is more than 10000 units only then create a Sales order (order creation)
- Check Inventory for 400-110 and if available quantity is more than 10000 units only then create a Sales order (no order)


