import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("[QueryStore API] Received POST request");

    // Get settings from headers
    const headers = request.headers;

    // Extracting JSON body
    const { storeName, prompt, tools } = await request.json();
    console.log("[QueryStore API] Extracted body: ", {
      storeName,
      prompt,
      tools,
    });

    // Log headers for debugging purposes
    console.log("[QueryStore API] Headers received: ", {
      "X-Pre-Decoration": headers.get("X-Pre-Decoration"),
      "X-Post-Decoration": headers.get("X-Post-Decoration"),
      "X-LLM-Type": headers.get("X-LLM-Type"),
      "X-LLM-Model": headers.get("X-LLM-Model"),
      "X-Temperature": headers.get("X-Temperature"),
      "X-Max-Tokens": headers.get("X-Max-Tokens"),
      "X-Input-Limit": headers.get("X-Input-Limit"),
      "X-Chat-Memory": headers.get("X-Chat-Memory"),
      "X-Max-Messages": headers.get("X-Max-Messages"),
      "X-Toxicity-Detection": headers.get("X-Toxicity-Detection"),
    });

    // Send only the prompt without concatenation
    const response = await fetch("http://localhost:8081/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        llmType: headers.get("X-LLM-Type") || "OPENAI",
        modelName: headers.get("X-LLM-Model") || "gpt-4o",
        maxToken: headers.get("X-Max-Tokens") || "100",
        inputLimit: headers.get("X-Input-Limit") || "20",
        toxicityDetection: headers.get("X-Toxicity-Detection") || "true",
        temperature: headers.get("X-Temperature") || "0.7",
        chatMemory: headers.get("X-Chat-Memory") || "false",
        maxMessages: headers.get("X-Max-Messages") || "10",
        preDecoration: headers.get("X-Pre-Decoration") || "", // Forward preDecoration header directly
        postDecoration: headers.get("X-Post-Decoration") || "", // Forward postDecoration header directly
      },
      body: JSON.stringify({
        storeName,
        prompt, // Send the prompt directly
        tools,
      }),
    });

    console.log("[QueryStore API] Request sent to LLM API");

    // Check response from LLM API
    if (!response.ok) {
      throw new Error(
        `HTTP error! LLM API responded with status ${response.status}`
      );
    }

    const data = await response.json();
    console.log("[QueryStore API] Received response from LLM API: ", data);

    // Return the response to the frontend
    return NextResponse.json(data);
  } catch (error) {
    console.error("[QueryStore API] Error in query-store route:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
