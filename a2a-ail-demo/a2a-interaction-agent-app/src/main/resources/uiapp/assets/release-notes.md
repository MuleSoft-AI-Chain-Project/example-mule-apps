# A2A AIL Demo - Release Notes

## Release 2.0 - Enterprise Security Enhancement
**Release Date**: August 2025

### 🚀 Major Security Features Added
- **Flex Gateway Integration**: All components now deployed behind Flex Gateway
- **CloudHub 2.0 Private Space**: All applications deployed in private space on CloudHub 2.0
- **OAuth 2.0 Authentication**: A2A agents now use OAuth 2.0 Token Introspection with KeyCloak as external IDP
- **Client ID Enforcement**: MCP servers protected with Client ID Enforcement Policy
- **MCP Security Policies**: Added MCP Attribute-Based Access Control and MCP Schema Validation policies
- **A2A Security Policies**: Comprehensive A2A policies including Agent Card, PII Detector, Prompt Decorator, and Schema Validation

### 🔧 Technical Improvements
- **Enhanced Configuration**: Updated apps to support security requirements
- **Connector Updates**: Upgraded A2A Connector to 0.3.0-BETA, MCP Connector to 1.2.0, Einstein AI Connector to 1.2.1, and Inference Connector to 1.0.0 for enhanced functionality and stability

### 📋 Migration Notes
- **Breaking Changes**: Configuration files updated to include security properties
- **Authentication Changes**: A2A agents now require OAuth 2.0 tokens
- **Deployment Changes**: All applications must be deployed to CloudHub 2.0 private spaces
- **Gateway Requirements**: Flex Gateway required to deploy demo in your own environment

### 🔒 Security Architecture

#### MCP Server Security
- **Deployment**: MCP servers are deployed in CloudHub 2.0 private space
- **Gateway Protection**: All MCP servers are secured behind Flex Gateway with:
  - **Client ID Enforcement Policy**: Restricts access to registered client applications only
  - **MCP Attribute-Based Access Control Policy**: Controls access based on MCP attributes and user context
  - **MCP Schema Validation Policy**: Validates MCP requests and responses against defined schemas

#### A2A Agent Security
- **Deployment**: All specialized A2A agents are deployed in CloudHub 2.0 private space
- **Gateway Protection**: All A2A agents are secured behind Flex Gateway with:
    - **Core Security Policies:**
        - **OAuth 2.0 Token Introspection Policy**: Validates OAuth tokens for each request
    - **A2A-Specific Policies:**
        - **A2A Agent Card**: Validates agent identity and capabilities
        - **A2A PII Detector**: Automatically detects and protects Personally Identifiable Information
        - **A2A Prompt Decorator**: Enhances prompts with security context and validation
        - **A2A Schema Validation**: Validates all incoming and outgoing messages against defined schemas

---

## Release 1.0 - Initial Release
**Release Date**: June 2025

### 🎯 Core Features
- **Multi-Agent Architecture**: Specialized agents for CRM, ERP, Einstein AI, and Agentforce
- **A2A Communication**: Agent-to-Agent communication using MuleSoft A2A connector
- **MCP Integration**: Model Context Protocol servers for standardized tool access
- **Web UI**: Interactive web interface for agent conversations
- **Audit Logging**: Comprehensive audit trail for all agent interactions
- **Multi-Modal AI**: Support for OpenAI, Salesforce Einstein AI, and Agentforce

### 🔧 Technical Foundation
- **MuleSoft Runtime 4.9.x+**: Core integration platform
- **A2A Connector 0.1.0-BETA**: Agent-to-Agent communication
- **MCP Connector 1.0.0**: Model Context Protocol support
- **Local Development**: Support for local development and testing
