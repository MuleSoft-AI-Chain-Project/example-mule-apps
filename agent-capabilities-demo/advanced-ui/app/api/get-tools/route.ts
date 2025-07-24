import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const toolsEndpoint = process.env.RETRIEVE_TOOLS_URL;
    if (!toolsEndpoint) {
      console.error(`[Tools API] RETRIEVE_TOOLS_URL environment variable is not set`);
      return NextResponse.json(
        { error: 'Configuration error: RETRIEVE_TOOLS_URL is not set' },
        { status: 500 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

    const response = await fetch(toolsEndpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`[Tools API] Failed request with status ${response.status}`);
      return NextResponse.json(
        { error: `Failed to retrieve tools`, status: response.status },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: unknown) {
    if ((error as { name?: string }).name === 'AbortError') {
      console.error(`[Tools API] Request timeout after 30 seconds`);
    } else {
      console.error(`[Tools API] Unexpected error: ${(error as Error).message}`);
    }
    return NextResponse.json(
      { error: 'Failed to retrieve tools due to server error' },
      { status: 500 }
    );
  }
}
