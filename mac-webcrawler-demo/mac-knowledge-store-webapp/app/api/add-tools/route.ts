import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const toolData = await request.json();
    const toolsEndpoint = process.env.ADD_TOOL_URL;
    
    console.log('[Tools API] Environment variable ADD_TOOL_URL:', toolsEndpoint);
    if (!toolsEndpoint) {
      console.error('[Tools API] ADD_TOOL_URL environment variable is not set');
      throw new Error('ADD_TOOL_URL environment variable is not set');
    }
    
    console.log(`[Tools API] Making POST request to: ${toolsEndpoint}`, toolData);
    
    const response = await fetch(toolsEndpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toolData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Tools API] Add tool request failed with status ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log(`[Tools API] Successfully added tool:`, result);
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('[Tools API] Error details:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    return NextResponse.json(
      { error: 'Failed to add tool', details: error.message },
      { status: 500 }
    );
  }
}