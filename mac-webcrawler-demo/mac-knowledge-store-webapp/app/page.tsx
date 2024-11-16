// app/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import CreateStore from "./components/CreateStore";
import QueryStore from "./components/QueryStore";
import TabsCard from "./components/TabsCard";
import LLMSettingsPanel from "./components/LLMSettingsPanel";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import {
  HomeIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

export default function Home() {
  const [storeNames, setStoreNames] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Fetch store names from the server-side API
    const fetchStoreNames = async () => {
      try {
        const response = await fetch("/api/get-store");
        if (!response.ok) {
          throw new Error("Failed to fetch store names");
        }
        const data: string[] = await response.json();
        setStoreNames(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStoreNames();
  }, []);

  const addStoreName = (name: string) => {
    setStoreNames((prev) => [...prev, name]);
  };

  // Add this handler to expand the panel
  const handlePanelExpand = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  return (
    <div className="flex min-h-screen relative bg-[#0B0E17]">
      {/* Collapsible Left Panel */}
      <div
        className={`fixed left-0 top-0 h-full transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-[60px]" : "w-80"} bg-[#151929]`}
      >
        {/* Logo Section */}
        <div className="flex items-center p-4 border-b border-gray-800 bg-[#1A1E2A] shadow-md">
          <div className="flex items-center">
            <div className="text-indigo-400">
              <Image
                src="/mac-logo.png" // Ensure your logo file is in the public directory
                alt="Logo"
                width={35} // Increased logo size for better visibility
                height={35}
                className="rounded-full border border-blue-300 p-1" // Added border and padding for emphasis
              />
            </div>
            {!isCollapsed && (
              <span className="text-white font-semibold text-xl tracking-wide ml-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-500">
                Agent Settings
              </span>
            )}
          </div>
        </div>
        {/* Settings Panel - Add onExpand prop */}
        <LLMSettingsPanel
          isCollapsed={isCollapsed}
          onExpand={handlePanelExpand}
        />
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-4 bg-[#0B0E17] rounded-full p-1 border border-gray-800 hover:bg-[#1C1F2E]"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Main Content - adjust the height and overflow handling */}
      <main
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? "ml-[60px]" : "ml-80"
        } flex-1 p-6 bg-[#0B0E17] h-screen overflow-hidden`}
      >
        <div className="h-full">
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Left Column - Store Management */}
            <div className="col-span-4 flex flex-col gap-6 h-full overflow-hidden">
              <div className="flex-none">
                <CreateStore onStoreCreated={addStoreName} />
              </div>

              <div className="flex-1 overflow-hidden">
                <TabsCard
                  storeNames={storeNames}
                  onStoreCreated={addStoreName}
                  className="h-full"
                />
              </div>
            </div>

            {/* Right Column - Query Interface */}
            <div className="col-span-8 h-full overflow-hidden">
              <QueryStore className="h-full" storeNames={storeNames} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
