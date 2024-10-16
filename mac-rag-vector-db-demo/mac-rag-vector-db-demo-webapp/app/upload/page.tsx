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
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { DropzoneOptions } from "react-dropzone";

const FileUploadDropzone = () => {
  const [files, setFiles] = useState<File[] | null>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = async (formData: FormData) => {
    console.log("IN uploadFiles");
    try {
      const response = await fetch("http://localhost:8081/api/upload", {
        method: "POST",
        body: formData,
      });
      console.log("response");
      console.log(response);
      const data = await response.json();
      console.log("data await");
      console.log(data);

      if (!response.ok) {
        throw new Error("Failed to upload files");
      }

      // console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpload = async () => {
    // console.log("IN handleUpload");
    setIsUploading(true);
    // upload files
    const formData = new FormData();

    files?.forEach((file) => {
      formData.append("file", file);
    });

    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    await uploadFiles(formData);

    // reset files

    setIsUploading(false);
  };
  const dropzone = {
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
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
        <FileUploaderContent className="flex flex-col flex-row gap-2">
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

              <Card className="mb-5">
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
      <div className="flex">
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
