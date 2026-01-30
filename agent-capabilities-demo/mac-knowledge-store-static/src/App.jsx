import React, { useState, useEffect, useCallback } from "react";
import CreateStore from "./components/CreateStore";
import QueryStore from "./components/QueryStore";
import TabsCard from "./components/TabsCard";
import LLMSettingsPanel from "./components/LLMSettingsPanel";
import EnvironmentIndicator from "./components/EnvironmentIndicator";
import { ChevronLeftIcon, ChevronRightIcon } from "./components/icons/Icons";
import { LLMType } from "./types/types";
import { getApiUrl } from "./config/api";
import macLogo from "/mac-logo.png";

export default function App() {
  const [storeNames, setStoreNames] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [llmSettings, setLLMSettings] = useState({
    llmType: LLMType.OPENAI,
    modelName: "gpt-4o",
    temperature: 0.7,
    inputLimit: 100,
    maxToken: 1000,
    chatMemory: false,
    maxMessages: 10,
    tokenUsageData: [],
    preDecoration: "",
    postDecoration: "",
    toxicityDetection: false,
    grounded: false,
    enableMcpServers: false,
  });

  const updateLLMSettings = useCallback((updatedValues) => {
    setLLMSettings((prev) => ({ ...prev, ...updatedValues }));
  }, []);

  const fetchStoreNames = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('getStore'));
      if (!response.ok) {
        throw new Error("Failed to fetch store names");
      }
      const data = await response.json();
      // Sort alphabetically (case-insensitive)
      const sortedData = data.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      setStoreNames(sortedData);
    } catch (error) {
      console.error("[Store API] Error fetching store names:", error);
    }
  }, []);

  useEffect(() => {
    fetchStoreNames();
  }, [fetchStoreNames]);

  const addStoreName = useCallback((name) => {
    setStoreNames((prev) => {
      const updated = [...prev, name];
      // Sort alphabetically (case-insensitive)
      return updated.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    });
  }, []);

  const handlePanelExpand = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  const togglePanelCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  return (
    <div className="flex min-h-screen relative bg-[#0B0E17]">
      {/* Collapsible Left Panel */}
      <div
        className={`fixed left-0 top-0 h-full transition-all duration-300 ease-in-out flex flex-col ${
          isCollapsed ? "w-[60px]" : "w-80"
        } bg-[#151929]`}
      >
        {/* Logo Section */}
        <div className="flex items-center p-4 border-b border-gray-800 bg-[#1A1E2A] shadow-md">
          <div className="flex items-center">
            <div className="text-indigo-400">
              <img
                src={macLogo}
                alt="Logo"
                width="35"
                height="35"
                className="rounded-full border border-blue-300 p-1"
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
        <div className="flex-1 overflow-hidden">
          <LLMSettingsPanel
            isCollapsed={isCollapsed}
            onExpand={handlePanelExpand}
            settings={llmSettings}
            onSettingsChange={updateLLMSettings}
          />
        </div>

        {/* Environment Indicator at bottom */}
        <EnvironmentIndicator isCollapsed={isCollapsed} />

        {/* Collapse Toggle Button */}
        <button
          onClick={togglePanelCollapse}
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
            <div
              className="col-span-4 flex flex-col gap-6 h-full overflow-hidden"
              data-form-type="other"
            >
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
            <div
              className="col-span-8 h-full overflow-hidden hover:border hover:border-blue-500 rounded-md transition duration-200"
              data-form-type="other"
            >
              <QueryStore
                className="h-full"
                storeNames={storeNames}
                llmSettings={llmSettings}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

