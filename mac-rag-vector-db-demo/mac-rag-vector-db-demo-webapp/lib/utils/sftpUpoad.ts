// utils/sftpUpload.ts
"use server";
import SftpClient from "ssh2-sftp-client";

export const uploadToSFTP = async (file: File) => {
  const sftp = new SftpClient();
  const remotePath = `/upload/${file.name}`; // Define your remote path on the SFTP server

  try {
    // Connect to the SFTP server
    await sftp.connect({
      host: "cloud-services.demos.mulesoft.com",
      port: 30910, // or your custom port
      username: "dcampuzano",
      password: "Zeu$1987-m3rky0ass",
    });

    // Create a Blob URL for the file
    const fileBlob = new Blob([file]);
    const fileBuffer = await fileBlob.arrayBuffer(); // Convert Blob to ArrayBuffer
    const buffer = Buffer.from(fileBuffer); // Convert ArrayBuffer to Buffer

    // Upload the file
    await sftp.put(buffer, remotePath);
    console.log(`File uploaded successfully to ${remotePath}`);
  } catch (err) {
    console.error("Error uploading file:", err);
  } finally {
    // Close the connection
    sftp.end();
  }
};
