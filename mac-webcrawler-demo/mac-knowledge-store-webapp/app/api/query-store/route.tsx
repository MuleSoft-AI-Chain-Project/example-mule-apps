// app/api/query-store/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Get settings from headers
    const headers = request.headers;
    const { storeName, prompt, tools } = await request.json();

    const response = await fetch("http://localhost:8081/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        llmType: headers.get("X-LLM-Type") || "OPENAI",
        modelName: headers.get("X-LLM-Model") || "gpt-4o",
        preDecoration: headers.get("X-Pre-Decoration") || "",
        postDecoration: headers.get("X-Post-Decoration") || "",
        maxToken: headers.get("X-Max-Tokens") || "100",
        inputLimit: headers.get("X-Input-Limit") || "20",
        toxicityDetection: headers.get("X-Toxicity-Detection") || "true",
        temperature: headers.get("X-Temperature") || "0.7",
        chatMemory: headers.get("X-Chat-Memory") || "false",
        maxMessages: headers.get("X-Max-Messages") || "10",
      },
      body: JSON.stringify({
        storeName,
        prompt,
        tools,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in query-store route:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
