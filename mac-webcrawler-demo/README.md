# MAC Project - Local Knowledge Store Demo

## Introduction

The **MAC Project - Local Knowledge Store Demo** is a demonstration application that integrates MuleSoft with a web-based interface to create, manage, and query a local knowledge store. This knowledge store is designed to store and retrieve information efficiently, leveraging MuleSoft for backend processes and OpenAI for advanced data processing.

### Key Features

- **Store Creation:** Users can create a new knowledge store where documents and data can be stored.
- **Document Upload:** Users can upload documents to the knowledge store, which will be processed and stored for future retrieval.
- **Querying the Knowledge Store:** Users can perform queries on the stored data, retrieving information based on specific prompts.

This project is particularly useful for scenarios where you need a localized storage solution for document management and retrieval, combined with the power of AI for data processing. The integration with MuleSoft ensures robust backend handling, while the web interface provides a user-friendly way to interact with the system.

## Prepare the MuleSoft Application

### MuleSoft Endpoints

The MuleSoft application contains 3 flows that expose the following endpoints:

- **Creating a store**: `http://localhost:8081/store`
- **Upload Document**: `http://localhost:8081/doc`
- **Query Data**: `http://localhost:8081/query`

### Store Path Configuration

You need to adjust the `storeName` path to specify where you want the store to be located, which will allow you to observe the file for debugging purposes. Alternatively, you can provide only `payload.storeName` without the prefix path.

- **Embedding New Store**

```xml
<ms-aichain:embedding-new-store
    doc:name="mac-create-new-store"
    doc:id="f5011c99-2a6e-405c-8ec0-13959cbd0f86"
    storeName='#["/Users/mbosnjak/Desktop/mac-demo/Stores/" ++ payload.storeName]' 
/>
```

- **Embedding Add Document to Store**

```xml
<ms-aichain:embedding-add-document-to-store
    doc:name="Embedding add document to store"
    doc:id="e8b73dbe-c897-4f77-85d0-aaf59476c408"
    storeName='#["/Users/mbosnjak/Desktop/mac-demo/Stores/" ++ payload.storeName]'
    contextPath="#[payload.filePath]" 
    fileType="#[payload.fileType]"
    maxSegmentSizeInChars="1500" 
    maxOverlapSizeInChars="150" 
/>
```

- **Embedding Get Info from Store**

```xml
<ms-aichain:embedding-get-info-from-store
    doc:name="Embedding get info from store"
    doc:id="913ed660-0b4a-488a-8931-26c599e859b5"
    config-ref="MuleSoft_AI_Chain_Config"
    storeName='#["/Users/mbosnjak/Desktop/mac-demo/Stores/" ++ payload.storeName]'
    getLatest="true">
    <ms-aichain:data><![CDATA[#[payload.prompt]]]></ms-aichain:data>
</ms-aichain:embedding-get-info-from-store>
```

### OpenAI API Key

Make sure to add a valid OpenAI API Key in the `config.json` file located under `src/main/resources`:

```json
{
    "OPENAI": {
        "OPENAI_API_KEY": ""
    }
}
```

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
cd mac-knowledge-store-webapp
```

2. Install the project dependencies using PNPM:

```bash
pnpm install
```

### Running the Development Server

Start the development server using:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.