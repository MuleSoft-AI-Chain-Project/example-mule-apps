// app/api/upload-document/route.ts
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import os from 'os';

// Using environment variables for the backend endpoint
// const BACKEND_DOC_ENDPOINT = process.env.BACKEND_DOC_ENDPOINT || 'http://localhost:8081/doc';
const UPLOAD_DOCS_URL = process.env.UPLOAD_DOCS_URL!;

export async function POST(request: Request) {
  console.log('Received document upload request');

  try {
    // Parse incoming request data
    const { storeName, fileName, fileContent, fileType } = await request.json();
    console.log(`Received upload request for store: ${storeName}, fileName: ${fileName}, fileType: ${fileType}`);

    const parts = fileName.split('.');
    const fileExt = parts.length > 1 ? parts.pop().toLowerCase() : '';
  
    // Decode base64 content (assuming the content is in "data:;base64," format)
    const base64Data = fileContent.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid file content: Missing base64 encoded data');
    }
    const fileBuffer = Buffer.from(base64Data, 'base64');

    // Create a temporary file
    const tempDir = os.tmpdir();
    const filePath = join(tempDir, fileName);
    await writeFile(filePath, fileBuffer);
    console.log(`Temporary file created at: ${filePath}`);

    // Set up a timeout of 30 seconds
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 30000); // 30 seconds

    // Send the file details to the backend service
    try {
      const response = await fetch(UPLOAD_DOCS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        //body: JSON.stringify({ storeName, filePath, fileType }),
        body: JSON.stringify({ storeName, base64Data, fileExt, fileName }),
        signal: controller.signal,
      });

      // Clear the timeout once the response is received
      clearTimeout(timeout);

      // Handle backend response
      console.log(`Backend response status: ${response.status}`);
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Received JSON response from backend:', data);
        return NextResponse.json(data);
      } else {
        const text = await response.text();
        console.log('Received non-JSON response from backend:', text);
        return NextResponse.json(
          { error: 'Unexpected response from backend', details: text },
          { status: 500 }
        );
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Error: The request to the backend timed out.');
        return NextResponse.json(
          { error: 'Backend request timed out', details: 'The request took longer than 30 seconds to complete.' },
          { status: 504 }
        );
      } else {
        throw error; // Re-throw other errors to be handled in the catch block below
      }
    }
  } catch (error) {
    console.error('Error handling upload-document request:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
