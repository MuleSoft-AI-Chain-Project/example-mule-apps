import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("file") as File;
    const storeName = formData.get("storeName") as string;
    const llmSettings = JSON.parse(request.headers.get("X-LLM-Settings") || "{}");

    console.log("[Voice] Incoming Request:", {
      headers: {
        "X-LLM-Settings": llmSettings
      },
      body: {
        fileName: audioFile?.name,
        fileType: audioFile?.type,
        storeName
      }
    });

    if (!audioFile || !(audioFile instanceof File)) {
      throw new Error("Invalid audio file");
    }

    // Convert audio to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    // Prepare request to Query Store
    const queryStoreUrl = process.env.QUERY_STORE_URL!;

    const requestBody = {
      audio: base64Audio,
      mimeType: audioFile.type,
      fileName: audioFile.name,
      storeName: storeName || undefined,
    };

    const outgoingHeaders = {
      "Content-Type": "application/json",
      "llmType": llmSettings.llmType || "OPENAI",
      "modelName": llmSettings.modelName || "gpt-4o",
      "maxToken": llmSettings.maxTokens?.toString() || "100",
      "inputLimit": llmSettings.inputLimit?.toString() || "20",
      "temperature": llmSettings.temperature?.toString() || "0.7",
      "chatMemory": llmSettings.chatMemory?.toString() || "false",
      "maxMessages": llmSettings.maxMessages?.toString() || "10",
      "preDecoration": llmSettings.preDecoration || "",
      "postDecoration": llmSettings.postDecoration || "",
      "toxicityDetection": llmSettings.toxicityDetection?.toString() || "false",
      "grounded": llmSettings.grounded?.toString() || "false",
      "rag": Boolean(storeName).toString(),
      "voice": "true",
    };

    console.log("[UploadAudio] Outgoing Request:", {
      url: queryStoreUrl,
      headers: outgoingHeaders,
      body: {
        ...requestBody,
        audio: "base64_audio_content..." // Abbreviated for logging
      }
    });

    const response = await fetch(queryStoreUrl, {
      method: "POST",
      headers: outgoingHeaders,
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    console.log("[Voice] Response Received:", result);

    return NextResponse.json({
      success: true,
      queryStoreResponse: result,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to process the request: ${error.message}` },
      { status: 500 }
    );
  }
}
