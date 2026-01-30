import React, { useState, useRef, useCallback } from "react";
import { getApiUrl } from "../config/api";

export default function UploadDocument({ className = "", storeNames }) {
  const [selectedStore, setSelectedStore] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [inputErrors, setInputErrors] = useState({
    selectedStore: "",
    file: "",
  });

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const validateForm = () => {
    let hasError = false;
    const errors = {
      selectedStore: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsUploading(true);

    try {
      const fileContent = await readFileAsBase64(file);
      
      // Extract base64 data (remove data URL prefix if present)
      const base64Data = fileContent.includes(',') 
        ? fileContent.split(',')[1] 
        : fileContent;
      
      // Extract file extension
      const parts = file.name.split('.');
      const fileExt = parts.length > 1 ? parts.pop().toLowerCase() : '';

      const response = await fetch(getApiUrl('uploadDocument'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: selectedStore,
          fileName: file.name,
          base64Data,
          fileExt,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Document uploaded successfully to "${selectedStore}".`);
        setSelectedStore("");
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setError(`Error: ${data.error || "An unknown error occurred."}`);
      }
    } catch (err) {
      setError(`Error uploading document: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#151929] p-6 rounded-3xl border border-gray-800/40 shadow-lg ${className}`} data-form-type="other">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-6" data-form-type="other">
        <div className="flex items-center space-x-4">
          <label htmlFor="store-select" className="text-sm font-medium text-white flex-none">
            Knowledge Store
          </label>
          <select
            id="store-select"
            value={selectedStore}
            onChange={(e) => {
              setSelectedStore(e.target.value);
              setInputErrors((prev) => ({ ...prev, selectedStore: "" }));
            }}
            className="flex-grow px-4 py-2 bg-[#1C1F2E] text-gray-100 text-sm border border-gray-700/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            required
            data-form-type="other"
          >
            <option value="">Select a store</option>
            {storeNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          {inputErrors.selectedStore && (
            <p className="text-sm text-red-400 ml-3">{inputErrors.selectedStore}</p>
          )}
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${isDragging ? "border-blue-500 bg-[#1C1F2E]" : "border-gray-700/40"} ${isDragging ? "shadow-lg" : ""}`}
          data-form-type="other"
        >
          {file ? (
            <p className="text-sm text-gray-300">Selected File: {file.name}</p>
          ) : (
            <p className="text-sm text-gray-500">Drag & drop a file here or click to select</p>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            className="hidden"
            accept=".txt,.pdf"
            data-form-type="other"
          />
        </div>
        {inputErrors.file && (
          <p className="text-sm text-red-400 mt-1">{inputErrors.file}</p>
        )}

        <button
          type="submit"
          disabled={isUploading || !file}
          className={`w-full py-3 px-4 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#151929] transition ${isUploading || !file ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isUploading ? "Uploading..." : "Upload Document"}
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-green-400">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  );
}

