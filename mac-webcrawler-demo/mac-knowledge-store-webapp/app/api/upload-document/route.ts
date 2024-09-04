// app/api/upload-document/route.ts
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import os from 'os';

export async function POST(request: Request) {
  console.log('Received document upload request');

  try {
    const { storeName, fileName, fileContent, fileType } = await request.json();
    console.log(
      `Received request: storeName=${storeName}, fileName=${fileName}, fileType=${fileType}, fileContent length=${fileContent.length}`
    );

    // Decode base64 content
    const fileBuffer = Buffer.from(fileContent.split(',')[1], 'base64');

    // Create a temporary file
    const tempDir = os.tmpdir();
    const filePath = join(tempDir, fileName);
    await writeFile(filePath, fileBuffer);
    console.log(`Temporary file created at: ${filePath}`);

    const response = await fetch('http://localhost:8081/doc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ storeName, filePath, fileType }),
    });

    console.log(`Backend response status: ${response.status}`);

    const contentType = response.headers.get('content-type');
    console.log(`Response content type: ${contentType}`);

    if (contentType && contentType.indexOf('application/json') !== -1) {
      const data = await response.json();
      console.log('Received JSON response:', data);
      return NextResponse.json(data);
    } else {
      const text = await response.text();
      console.log('Received non-JSON response:', text);
      return NextResponse.json(
        { error: 'Unexpected response', details: text },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in upload-document route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
