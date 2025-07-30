"use client";

import React, { useState } from "react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

interface CreateStoreProps {
  className?: string;
  onStoreCreated: (name: string) => void;
}

export default function CreateStore({
  className = "",
  onStoreCreated,
}: CreateStoreProps) {
  const [storeName, setStoreName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [inputError, setInputError] = useState("");

  // Validation logic for store names
  const validateStoreName = (name: string): string => {
    if (name.trim().length < 3) {
      return "Store name must be at least 3 characters long.";
    }
    if (name.trim().length > 15) {
      return "Store name must not exceed 50 characters.";
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
      return "Store name can only contain letters, numbers, and spaces.";
    }
    return ""; // No error
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset messages
    setMessage("");
    setError("");
    setInputError("");

    // Validate the input
    const validationError = validateStoreName(storeName);
    if (validationError) {
      setInputError(validationError);
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch("/api/create-store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ storeName: storeName.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Store "${storeName.trim()}" successfully created.`);
        onStoreCreated(storeName.trim());
        setStoreName(""); // Reset input
      } else {
        setError(data?.error || "An unknown error occurred.");
      }
    } catch (err: any) {
      setError(`Error creating store: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      className={`bg-[#151929] p-6 rounded-xl border border-gray-800/40 shadow-lg ${className}`}
    >
      <h2 className="text-xl text-white font-medium flex items-center gap-3 mb-4">
        <PlusCircleIcon className="h-5 w-5 text-gray-400" />
        Create Knowledge Base
      </h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        data-form-type="other"
      >
        <input
          id="createStoreName"
          type="text"
          value={storeName}
          onChange={(e) => {
            setStoreName(e.target.value);
            setInputError(validateStoreName(e.target.value)); // Validate in real-time
          }}
          placeholder="Enter store name"
          className="w-full px-3 py-2.5 bg-[#1C1F2E] text-gray-100 placeholder-gray-500 text-sm
            border border-gray-700/40 rounded-lg focus:outline-none focus:ring-1 
            focus:ring-blue-500 focus:border-blue-500"
          required
        />
        {inputError && <p className="text-sm text-red-400">{inputError}</p>}
        <button
          type="submit"
          disabled={isCreating || !!inputError}
          className={`w-full py-2.5 px-4 border border-gray-200/20 rounded-lg shadow-sm text-sm font-medium 
            text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 
            focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#151929]
            ${isCreating || inputError ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isCreating ? "Creating..." : "Create Store"}
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-green-400">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  );
}
