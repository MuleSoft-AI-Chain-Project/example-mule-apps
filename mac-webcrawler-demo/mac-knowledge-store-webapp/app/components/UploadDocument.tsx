"use client";

import React, { useState, useRef, useCallback } from "react";

interface UploadDocumentProps {
  className?: string;
  storeNames: string[];
}

export default function UploadDocument({
  className = "",
  storeNames,
}: UploadDocumentProps) {
  const [selectedStore, setSelectedStore] = useState("");
  const [fileType, setFileType] = useState("text");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation state
  const [inputErrors, setInputErrors] = useState({
    selectedStore: "",
    fileType: "",
    file: "",
  });

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const validateForm = () => {
    let hasError = false;
    const errors = {
      selectedStore: "",
      fileType: "",
      file: "",
    };

    if (!selectedStore) {
      errors.selectedStore = "Please select a store.";
      hasError = true;
    }

    if (!file) {
      errors.file = "Please select a file to upload.";
      hasError = true;
    }

    setInputErrors(errors);
    return !hasError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsUploading(true);

    try {
      const fileContent = await readFileAsBase64(file!);

      const response = await fetch("/api/upload-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: selectedStore,
          fileName: file!.name,
          fileContent,
          fileType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Document uploaded successfully to "${selectedStore}".`);
        setSelectedStore("");
        setFileType("text");
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setError(`Error: ${data.error || "An unknown error occurred."}`);
      }
    } catch (err: any) {
      setError(`Error uploading document: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Store Selection */}
          <div>
            <label
              htmlFor="storeSelect"
              className="block text-base text-gray-400 mb-2"
            >
              Store
            </label>
            <select
              id="storeSelect"
              value={selectedStore}
              onChange={(e) => {
                setSelectedStore(e.target.value);
                setInputErrors((prev) => ({ ...prev, selectedStore: "" }));
              }}
              className="w-full px-3 py-2.5 bg-[#1C1F2E] text-gray-100 text-sm
                border border-gray-700/40 rounded-lg focus:outline-none focus:ring-1 
                focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select store</option>
              {storeNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            {inputErrors.selectedStore && (
              <p className="text-sm text-red-400 mt-1">
                {inputErrors.selectedStore}
              </p>
            )}
          </div>

          {/* File Type Selection */}
          <div>
            <label
              htmlFor="fileType"
              className="block text-base text-gray-400 mb-2"
            >
              File Type
            </label>
            <select
              id="fileType"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#1C1F2E] text-gray-100 text-sm
                border border-gray-700/40 rounded-lg focus:outline-none focus:ring-1 
                focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="text">Text</option>
              <option value="PDF">PDF</option>
            </select>
          </div>
        </div>

        {/* File Drop Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer 
            ${
              isDragging ? "border-blue-500 bg-[#1C1F2E]" : "border-gray-700/40"
            }`}
        >
          {file ? (
            <p className="text-sm text-gray-300">File: {file.name}</p>
          ) : (
            <p className="text-sm text-gray-500">
              Drag & drop a file here or click to select
            </p>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            className="hidden"
            accept=".txt,.pdf"
          />
        </div>
        {inputErrors.file && (
          <p className="text-sm text-red-400 mt-1">{inputErrors.file}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading || !file}
          className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium
              text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 
              focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#151929]
              ${isUploading || !file ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isUploading ? "Uploading..." : "Upload Document"}
        </button>
      </form>

      {/* Success and Error Messages */}
      {message && <p className="mt-4 text-sm text-green-400">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  );
}
