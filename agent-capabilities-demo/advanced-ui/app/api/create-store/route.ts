// app/api/create-store/route.ts
import { NextResponse } from "next/server";

const createStoreUrl = process.env.CREATE_STORE_URL!;
if (!createStoreUrl) {
  throw new Error("CREATE_STORE_URL environment variable is not set");
}

export async function POST(request: Request) {
  try {
    const { storeName } = await request.json();

    if (!storeName || typeof storeName !== "string") {
      return NextResponse.json(
        { error: "Invalid input: 'storeName' is required and must be a string." },
        { status: 400 }
      );
    }

    const apiResponse = await fetch(createStoreUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ storeName }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text(); // Read response body for error details
      throw new Error(`Upstream API error: ${errorText || apiResponse.status}`);
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in create-store route:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
