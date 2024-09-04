// app/api/create-store/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    //const { storeName } = await request.json();

    const response = await fetch('http://localhost:8081/getstores', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache', // Prevent caching on the server side
      },
      cache: 'no-store', // Prevent caching in the fetch API
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.error('stores retrieved: ', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in get-store route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
