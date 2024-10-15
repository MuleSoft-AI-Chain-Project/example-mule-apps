/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  FileUploader,
  FileInput,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/extension/file-upload";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { uploadToSFTP } from "@/lib/utils/sftpUpoad";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DropzoneOptions } from "react-dropzone";

const FileUploadDropzone = () => {
  const [files, setFiles] = useState<File[] | null>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    // setIsUploading(true);

    // if (files) {
    //   for (const file of files) {
    //     await uploadToSFTP(file); // Call the SFTP upload function for each file
    //   }
    // }

    // setIsUploading(false);
    setIsUploading(true);
    const formData = new FormData();

    // Append each file to the FormData object
    files?.forEach((file) => {
      formData.append("files", file); // Use 'files' as key for multiple files
    });
    console.log("files:");
    console.log(files);
    console.log(formData);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      console.log("Upload successful");
      // Reset the files state after upload
      setFiles([]);
    } catch (error) {
      console.error("Error during upload:", error);
      // setErrorMessage(error.message); // Set error message to display
    } finally {
      setIsUploading(false);
    }
  };
  const dropzone = {
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    multiple: true,
    maxFiles: 4,
    maxSize: 20000000,
  } satisfies DropzoneOptions;
  // console.log(files);
  return (
    <>
      <FileUploader
        value={files}
        onValueChange={setFiles}
        dropzoneOptions={dropzone}
      >
        <FileInput>
          <div className="flex items-center justify-center h-32 w-full border bg-background rounded-md">
            <p className="text-gray-400">Drop files here</p>
          </div>
        </FileInput>
        <FileUploaderContent className="flex flex-col">
          {files?.map((file, i) => (
            <FileUploaderItem
              key={i}
              index={i}
              className="m-5 rounded-md"
              aria-roledescription={`file ${i + 1} containing ${file.name}`}
            >
              {/* <Image
              src={URL.createObjectURL(file)}
              alt={file.name}
              height={80}
              width={80}
              className="size-20 p-0"
            />
             */}

              <Card className="">
                {/* <CardHeader className="text-2xl text-mulesoft">
                Our Services
              </CardHeader> */}
                <CardContent className="text-mulesoftLight">
                  {file.name}
                </CardContent>
              </Card>
            </FileUploaderItem>
          ))}
        </FileUploaderContent>
      </FileUploader>
      <div className="flex justify-center mt-1">
        <Button
          onClick={handleUpload}
          className={`${buttonVariants({ variant: "mule" })}`}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </>
  );
};

export default FileUploadDropzone;
