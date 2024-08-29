export const runtime = "edge";

export async function POST(req: Request) {
  console.log("API route called");

  try {
    const { data } = await req.json();
    console.log("Received request data:", data);

    const apiEndpoint = process.env.MULE_API_ENDPOINT;
    console.log("Sending request to:", apiEndpoint);

    if (!apiEndpoint) {
      throw new Error(
        "MULE_API_ENDPOINT is not defined in the environment variables.",
      );
    }

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

      const jsonResponse = await response.json();
      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers));

      // Log the token counts for debugging
      console.log("Token counts:", jsonResponse.attributes);

      // Restructure the response to include token info separately
      const restructuredResponse = {
        reply: jsonResponse.response,
        tokenInfo: jsonResponse.attributes,
      };

      return new Response(JSON.stringify(restructuredResponse), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error during fetch:", error);
      return new Response(
        JSON.stringify({ error: error.message, tokenInfo: null }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
  } catch (error) {
    console.error("Error parsing request:", error);
    return new Response(
      JSON.stringify({ error: error.message, tokenInfo: null }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
