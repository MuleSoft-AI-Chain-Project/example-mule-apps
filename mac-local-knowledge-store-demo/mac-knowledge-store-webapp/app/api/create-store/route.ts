// app/api/create-store/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { storeName } = await request.json();

    const response = await fetch('http://localhost:8081/store', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ storeName }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in create-store route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
