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
