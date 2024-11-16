// app/api/crawl-website/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Extract data from incoming request body
    const { websiteUrl, depth, storeName } = await request.json();

    // Retrieve the API endpoint from environment variables
    const crawlApiEndpoint = process.env.CRAWL_WEBSITE_URL;

    if (!crawlApiEndpoint) {
      throw new Error('CRAWL_WEBSITE_URL is not defined');
    }

    // Make the request to the external crawling API
    const response = await fetch(crawlApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ websiteUrl, depth, storeName }),
    });

    // Handle response status errors
    if (!response.ok) {
      throw new Error(`HTTP error! Status code: ${response.status}`);
    }

    // Parse and return the response data
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error in crawl-website route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
