# MuleSoft MAC Frontend

This frontend application allows users to interact with a MuleSoft application. Built with Next.js and TypeScript, it enables users to chat with an AI agent and upload documents to a vector database.

## Prerequisites

Before starting, ensure you have the following:

- Node.js (version 18 or higher)
- npm (usually comes with Node.js)
- SFTP credentials from SE Platform

### Obtaining SFTP Credentials

1. Log into [SE Platform](https://se-platform.tools.mulesoft.com/)
2. Navigate to Cloud Services
3. Click "Add Service"
4. Select SFTP 1.0
5. Save your credentials for later use

## Setup

### Supabase Setup

#### Creating a Supabase Account

1. Visit [Supabase](https://supabase.com)
2. Click "Start your project" or "Sign up"
3. Sign up using your email or GitHub account
4. If using email, confirm your email address after registration

#### Creating a New Project

1. Log in to your Supabase account
2. Click "New Project"
3. Fill in the project details:
   - **Project Name**: Choose a name for your project
   - **Database Password**: Set a strong password
   - **Region**: Select the closest region for better performance
4. Click "Create new project"

#### Enabling pgvector

1. Navigate to the "Database" section in the left sidebar
2. In database settings, find the extensions list
3. Search for `pgvector` and enable it

#### Retrieving Connection Settings

1. Go to "Settings" in the left sidebar, then "Database"
2. Find the following connection settings:

   | Setting           | Value       |
   | ----------------- | ----------- |
   | POSTGRES_HOST     | `REPLACEME` |
   | POSTGRES_PORT     | `REPLACEME` |
   | POSTGRES_DATABASE | `REPLACEME` |
   | POSTGRES_USER     | `REPLACEME` |
   | POSTGRES_PASSWORD | `REPLACEME` |

3. Copy the provided connection string for easy reference

### Project Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/dcampuzano101/mulesoft-mac-frontend.git
   cd mulesoft-mac-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your SFTP credentials:

   ```
   SFTP_HOST=your_sftp_host
   SFTP_PORT=your_sftp_port
   SFTP_USERNAME=your_sftp_username
   SFTP_PASSWORD=your_sftp_password
   ```

   Update other variables as needed.

4. **Run the project locally**

   ```bash
   npm run dev
   ```

   The application should now be running on `http://localhost:3000` (or another port if specified).

## MuleSoft Application Setup

### Creating an OpenAI API Key

1. Visit [OpenAI](https://platform.openai.com)
2. Log in or sign up for an account
3. Navigate to the API Keys section in your dashboard
4. Click "Create new secret key"
5. Copy and securely store your API key

### Importing the MuleSoft Project

1. Download the "mulesoft-ai-chain-demo.jar" file (located in the root of this repo)
2. Open Anypoint Studio
3. Go to File > Import... > Mule > Packaged mule application (.jar)
4. Select the downloaded JAR file and click "Finish"

### Configuring the MuleSoft Application

1. In Anypoint Studio, locate `src/main/resources/envVars.json`
2. Replace placeholder values with your actual connection settings (These are the values you got from the Supabase setup):

   ```json
   {
     "OPENAI": {
       "OPENAI_API_KEY": "YOUR_OPENAI_API_KEY"
     },
     "PGVECTOR": {
       "POSTGRES_HOST": "REPLACEME",
       "POSTGRES_PORT": "REPLACEME",
       "POSTGRES_DATABASE": "REPLACEME",
       "POSTGRES_USER": "REPLACEME",
       "POSTGRES_PASSWORD": "REPLACEME"
     }
   }
   ```

3. In the `sftpNewFile` flow, update the `localPath` variable with your desired local folder path

### Running the MuleSoft Application

1. Right-click on your project in Anypoint Studio
2. Select Run As > Mule Application

## Support

For questions or assistance, contact dcampuzano@salesforce.com or reach out via Slack.
