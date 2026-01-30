import React, { useState } from "react";
import { getApiUrl } from "../config/api";

export default function CrawlWebsite({ className = "", storeNames, onStoreCreated }) {
  const [selectedStore, setSelectedStore] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [depth, setDepth] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [inputErrors, setInputErrors] = useState({
    websiteUrl: "",
    depth: "",
    selectedStore: "",
  });

  const validateWebsiteUrl = (url) => {
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?" +
        "([\\w\\d-]+\\.)+[\\w\\d]{2,}" +
        "(:\\d+)?(\\/.*)?$"
    );
    if (!urlPattern.test(url)) {
      return "Please enter a valid URL.";
    }
    return "";
  };

  const validateDepth = (value) => {
    if (value < 0) {
      return "Depth cannot be negative.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsCreating(true);

    const websiteUrlError = validateWebsiteUrl(websiteUrl);
    const depthError = validateDepth(depth);
    const selectedStoreError = selectedStore ? "" : "Please select a store.";

    if (websiteUrlError || depthError || selectedStoreError) {
      setInputErrors({
        websiteUrl: websiteUrlError,
        depth: depthError,
        selectedStore: selectedStoreError,
      });
      setIsCreating(false);
      return;
    } else {
      setInputErrors({
        websiteUrl: "",
        depth: "",
        selectedStore: "",
      });
    }

    try {
      const response = await fetch(getApiUrl('crawlWebsite'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          websiteUrl: websiteUrl.trim(),
          depth,
          storeName: selectedStore,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Crawl of ${websiteUrl.trim()} successful.`);
        setWebsiteUrl("");
        setDepth(0);
        setSelectedStore("");
      } else {
        setError(data?.error || "An unknown error occurred.");
      }
    } catch (err) {
      setError(`Error creating store: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={className} data-form-type="other">
      <form onSubmit={handleSubmit} className="space-y-6" data-form-type="other">
        <div>
          <label htmlFor="crawlWebsiteUrl" className="block text-base text-gray-400 mb-2">
            Website URL
          </label>
          <input
            id="crawlWebsiteUrl"
            type="text"
            value={websiteUrl}
            onChange={(e) => {
              setWebsiteUrl(e.target.value);
              setInputErrors((prev) => ({
                ...prev,
                websiteUrl: validateWebsiteUrl(e.target.value),
              }));
            }}
            placeholder="Enter website URL"
            className="w-full px-3 py-2.5 bg-[#1C1F2E] text-gray-100 placeholder-gray-500 text-sm
              border border-gray-700/40 rounded-lg focus:outline-none focus:ring-1 
              focus:ring-blue-500 focus:border-blue-500"
            required
            data-form-type="other"
          />
          {inputErrors.websiteUrl && (
            <p className="text-sm text-red-400 mt-1">{inputErrors.websiteUrl}</p>
          )}
        </div>

        <div className="flex gap-4">
          <div className="w-1/3">
            <label htmlFor="crawlDepth" className="block text-base text-gray-400 mb-2">
              Depth
            </label>
            <input
              id="crawlDepth"
              type="number"
              value={depth}
              onChange={(e) => {
                const value = Number(e.target.value);
                setDepth(value);
                setInputErrors((prev) => ({
                  ...prev,
                  depth: validateDepth(value),
                }));
              }}
              placeholder="0"
              className="w-full px-3 py-2.5 bg-[#1C1F2E] text-gray-100 placeholder-gray-500 text-sm
                border border-gray-700/40 rounded-lg focus:outline-none focus:ring-1 
                focus:ring-blue-500 focus:border-blue-500"
              min="0"
              max="5"
              required
            />
            {inputErrors.depth && (
              <p className="text-sm text-red-400 mt-1">{inputErrors.depth}</p>
            )}
          </div>

          <div className="flex-1">
            <label htmlFor="storeSelect" className="block text-base text-gray-400 mb-2">
              Store
            </label>
            <select
              id="storeSelect"
              value={selectedStore}
              onChange={(e) => {
                setSelectedStore(e.target.value);
                setInputErrors((prev) => ({
                  ...prev,
                  selectedStore: e.target.value ? "" : "Please select a store.",
                }));
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
              <p className="text-sm text-red-400 mt-1">{inputErrors.selectedStore}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isCreating || Object.values(inputErrors).some((err) => err)}
          className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium
              text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 
              focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#151929]
              ${isCreating ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isCreating ? "Crawling..." : "Crawl Website"}
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-green-400">{message}</p>}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  );
}

