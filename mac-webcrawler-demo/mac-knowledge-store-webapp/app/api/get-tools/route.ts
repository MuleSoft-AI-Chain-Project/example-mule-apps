import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const toolsEndpoint = process.env.RETRIEVE_TOOLS_URL;
    
    if (!toolsEndpoint) {
      console.error(`[${new Date().toISOString()}] [Tools API] RETRIEVE_TOOLS_URL environment variable is not set`);
      throw new Error('RETRIEVE_TOOLS_URL environment variable is not set');
    }

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 30000); // 30 seconds timeout

    const response = await fetch(toolsEndpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    // Clear the timeout after the fetch completes
    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[${new Date().toISOString()}] [Tools API] Request failed (${response.status}): ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log(`[${new Date().toISOString()}] [Tools API] Tools retrieved successfully`);
    
    return NextResponse.json(result, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
      },
    });
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [Tools API] Error: ${error.message || error}`);
    return NextResponse.json(
      { error: 'Failed to retrieve tools', details: error.message || String(error) },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
        },
      }
    );
  }
}
