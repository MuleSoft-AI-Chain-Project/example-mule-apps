import { NextResponse } from "next/server";

const queryStoreUrl = process.env.QUERY_STORE_URL!;

export async function POST(request: Request) {
  try {
    const headers = request.headers;
    const body = await request.json();

    console.log("[Prompt] Incoming Request:", {
      headers: {
        "X-LLM-Type": headers.get("X-LLM-Type"),
        "X-LLM-Model": headers.get("X-LLM-Model"),
        "X-Max-Tokens": headers.get("X-Max-Tokens"),
        "X-Input-Limit": headers.get("X-Input-Limit"),
        "X-Temperature": headers.get("X-Temperature"),
        "X-Chat-Memory": headers.get("X-Chat-Memory"),
        "X-Max-Messages": headers.get("X-Max-Messages"),
        "X-Pre-Decoration": headers.get("X-Pre-Decoration"),
        "X-Post-Decoration": headers.get("X-Post-Decoration"),
        "X-Toxicity-Detection": headers.get("X-Toxicity-Detection"),
        "X-Grounded": headers.get("X-Grounded"),
        "X-RAG": headers.get("X-RAG"),
      },
      body,
    });

    const outgoingHeaders = {
      "Content-Type": "application/json",
      llmType: headers.get("X-LLM-Type") || "OPENAI",
      modelName: headers.get("X-LLM-Model") || "gpt-4o",
      maxToken: headers.get("X-Max-Tokens") || "100",
      inputLimit: headers.get("X-Input-Limit") || "20",
      temperature: headers.get("X-Temperature") || "0.7",
      chatMemory: headers.get("X-Chat-Memory") || "false",
      maxMessages: headers.get("X-Max-Messages") || "10",
      preDecoration: headers.get("X-Pre-Decoration") || "",
      postDecoration: headers.get("X-Post-Decoration") || "",
      toxicityDetection: headers.get("X-Toxicity-Detection") || "false",
      grounded: headers.get("X-Grounded") || "false",
      rag: headers.get("X-RAG") || "false",
    };

    console.log("[Prompt] Outgoing Request:", {
      url: queryStoreUrl,
      headers: outgoingHeaders,
      body: { storeName: body.storeName, prompt: body.prompt },
    });

    const response = await fetch(queryStoreUrl, {
      method: "POST",
      headers: outgoingHeaders,
      body: JSON.stringify({
        storeName: body.storeName,
        prompt: body.prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `HTTP error! Query Store responded with status ${response.status}`
      );
    }

    const data = await response.json();
    console.log("[Prompt] Response Received:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[QueryStore API] Error:", (error as Error).message);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
