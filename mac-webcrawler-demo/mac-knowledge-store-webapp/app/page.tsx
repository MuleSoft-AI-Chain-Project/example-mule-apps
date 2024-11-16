"use client";

import { useState, useEffect, useCallback } from "react";
import CreateStore from "./components/CreateStore";
import QueryStore from "./components/QueryStore";
import TabsCard from "./components/TabsCard";
import LLMSettingsPanel from "./components/LLMSettingsPanel";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import Image from "next/image";

export default function Home() {
  const [storeNames, setStoreNames] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const fetchStoreNames = async () => {
      try {
        const response = await fetch("/api/get-store");
        if (!response.ok) {
          throw new Error("Failed to fetch store names");
        }
        const data = (await response.json()) as string[];
        setStoreNames(data);
      } catch (error) {
        console.error("Error fetching store names:", error);
      }
    };

    fetchStoreNames();
  }, []);

  const addStoreName = useCallback((name: string) => {
    setStoreNames((prev) => [...prev, name]);
  }, []);

  const handlePanelExpand = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  return (
    <div className="flex min-h-screen relative bg-[#0B0E17]">
      {/* Collapsible Left Panel */}
      <div
        className={`fixed left-0 top-0 h-full transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-[60px]" : "w-80"
        } bg-[#151929]`}
      >
        {/* Logo Section */}
        <div className="flex items-center p-4 border-b border-gray-800 bg-[#1A1E2A] shadow-md">
          <div className="flex items-center">
            <div className="text-indigo-400">
              <Image
                src="/mac-logo.png"
                alt="Logo"
                width={35}
                height={35}
                className="rounded-full border border-blue-300 p-1"
                priority
              />
            </div>
            {!isCollapsed && (
              <span className="text-white font-semibold text-xl tracking-wide ml-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-500">
                Agent Settings
              </span>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        <LLMSettingsPanel
          isCollapsed={isCollapsed}
          onExpand={handlePanelExpand}
        />

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-4 bg-blue-500 rounded-full p-1 border border-gray-800 hover:bg-blue-600"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-4 w-4 text-white" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4 text-white" />
          )}
        </button>
      </div>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? "ml-[60px]" : "ml-80"
        } flex-1 p-6 bg-[#0B0E17] h-screen overflow-hidden`}
      >
        <div className="h-full">
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Left Column - Store Management */}
            <div className="col-span-4 flex flex-col gap-6 h-full overflow-hidden">
              {/* Wrap CreateStore in a div with hover effect */}
              <div className="flex-none hover:border hover:border-blue-500 rounded-md transition duration-200">
                <CreateStore onStoreCreated={addStoreName} />
              </div>

              {/* Wrap TabsCard in a div with hover effect */}
              <div className="flex-1 overflow-hidden hover:border hover:border-blue-500 rounded-md transition duration-200">
                <TabsCard
                  storeNames={storeNames}
                  onStoreCreated={addStoreName}
                  className="h-full"
                />
              </div>
            </div>

            {/* Right Column - Query Interface */}
            {/* Wrap QueryStore in a div with hover effect */}
            <div className="col-span-8 h-full overflow-hidden hover:border hover:border-blue-500 rounded-md transition duration-200">
              <QueryStore className="h-full" storeNames={storeNames} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
