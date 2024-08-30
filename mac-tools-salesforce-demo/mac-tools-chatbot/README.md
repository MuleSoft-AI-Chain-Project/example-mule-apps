# MAC PROJECT - Tools Chatbot with TokenUsage Informationo

## Introduction

The Demo is demonstrating how to retrieve information from internal system using the `Tools Use AI` operation. You can ask the chatbot a question that it can answer from public knowledge or a question related to Salesforce data that it can retrieve.

## How to Run the Web Application

### Prerequisites

Ensure the following are installed on your machine:

- **Node.js**: Make sure Node.js is installed. You can download it from [nodejs.org](https://nodejs.org/).
- **PNPM**: Install the PNPM package manager globally using the following command:

```bash
npm install -g pnpm
```

### Installation

1. Clone the repository and navigate into the project directory:

```bash
cd mac-tools-chatbot
```

2. Install the project dependencies using PNPM:

```bash
pnpm install
```

### Running the Development Server

Before running the application, make sure you have included a `.env` file in the root folder that contains the Mule API endpoint as follows:

```
MULE_API_ENDPOINT=<https://mac-tools-api-1xuw84.gjmsqx.deu-c1.cloudhub.io/prompt
```

Start the development server using:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
