export const runtime = "edge";

export async function POST(req: Request) {
  console.log("API route called");

  try {
    const { data } = await req.json();
    console.log("Received request data:", data);

    // Update the API endpoint to include the protocol
    const apiEndpoint = process.env.MULE_API_ENDPOINT;
    console.log("Sending request to:", apiEndpoint);

    const requestBody = JSON.stringify({ prompt: data });
    console.log("Request body:", requestBody);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: requestBody,
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers));

      const text = await response.text();
      console.log("Raw response text:", text);

      let responseData;

      try {
        if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
          responseData = JSON.parse(text);
          console.log("Parsed JSON response:", responseData);
        } else {
          responseData = { message: text };
          console.log("Non-JSON response wrapped:", responseData);
        }
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        console.log("Failed to parse response:", text);
        return new Response(
          JSON.stringify({
            error: "Invalid JSON response from AI endpoint",
            rawResponse: text,
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }

      console.log("Final response data:", { reply: responseData });

      return new Response(JSON.stringify({ reply: responseData }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      return new Response(
        JSON.stringify({
          error: "Error communicating with AI endpoint",
          details: fetchError.message,
          cause: fetchError.cause ? fetchError.cause.message : "Unknown",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
  } catch (error) {
    console.error("Error in API route:", error);
    return new Response(
      JSON.stringify({
        error: "Error in API route",
        details: error.message,
        cause: error.cause ? error.cause.message : "Unknown",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
