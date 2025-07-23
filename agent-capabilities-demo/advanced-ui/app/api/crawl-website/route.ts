// app/api/crawl-website/route.ts
import { NextResponse } from 'next/server';

// Define the timeout duration in milliseconds
const TIMEOUT_DURATION = 60000; // 30 seconds

export async function POST(request: Request) {
  try {
    // Extract data from incoming request body
    const { websiteUrl, depth, storeName } = await request.json();

    // Retrieve the API endpoint from environment variables
    const crawlApiEndpoint = process.env.CRAWL_WEBSITE_URL;

    if (!crawlApiEndpoint) {
      throw new Error('CRAWL_WEBSITE_URL is not defined');
    }

    // Set up a timeout of 30 seconds using AbortController
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, TIMEOUT_DURATION);

    try {
      // Make the request to the external crawling API
      const response = await fetch(crawlApiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteUrl, depth, storeName }),
        signal: controller.signal, // Add the signal for the timeout
      });

      // Clear the timeout once the response is received
      clearTimeout(timeout);

      // Handle response status errors
      if (!response.ok) {
        throw new Error(`HTTP error! Status code: ${response.status}`);
      }

      // Parse and return the response data
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('Error: The request to the crawl API timed out.');
        return NextResponse.json(
          { error: 'Crawling request timed out', details: 'The request took longer than 30 seconds to complete.' },
          { status: 504 }
        );
      } else {
        throw error; // Re-throw other errors to be handled in the outer catch block
      }
    }
  } catch (error: any) {
    console.error('Error in crawl-website route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
