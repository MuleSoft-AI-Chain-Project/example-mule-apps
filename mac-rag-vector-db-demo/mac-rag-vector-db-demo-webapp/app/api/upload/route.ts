/* eslint-disable @typescript-eslint/no-explicit-any */

import SftpClient from "ssh2-sftp-client";

export async function POST(request: { formData: () => any }) {
  const sftp = new SftpClient();
  const formData = await request.formData();

  try {
    console.log("Attempting to connect to SFTP server...");
    await sftp.connect({
      host: process.env.SFTP_HOST,
      port: parseInt(process.env.SFTP_PORT || "22", 10),
      username: process.env.SFTP_USERNAME,
      password: process.env.SFTP_PASSWORD,
    });
    console.log("SFTP connection established successfully");

    // Iterate over each file in the FormData
    for (const entry of formData.entries()) {
      const [key, value] = entry;

      if (key === "files") {
        // Convert File object to a readable stream
        const fileStream = value.stream();
        const buffer = await streamToBuffer(fileStream);
        await sftp.put(buffer, `/upload/${value.name}`);
        console.log(`Uploaded ${value.name}`);
      }
    }

    return new Response(
      JSON.stringify({ message: "Files uploaded successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in SFTP operation:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to upload files",
        details: (err as Error).message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    if (sftp) {
      console.log("Closing SFTP connection");
      await sftp.end();
    }
  }
}

async function streamToBuffer(stream: { getReader: () => any }) {
  const chunks = [];
  const reader = stream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return Buffer.concat(chunks);
}
