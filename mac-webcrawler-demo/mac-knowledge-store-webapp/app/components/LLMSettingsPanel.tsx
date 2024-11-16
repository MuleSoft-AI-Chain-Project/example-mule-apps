// LLMSettingsPanel.tsx
"use client";

import React, { useState, useMemo, Suspense, lazy } from "react";
import {
  Cog6ToothIcon,
  AdjustmentsHorizontalIcon,
  BoltIcon,
  ChartBarIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  ArrowDownTrayIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import Accordion from "./ui/Accordion";
import Modal from "./ui/Modal";
import {
  LLMSettings,
  SettingsPanelProps,
  LLMType,
  ProviderModels,
} from "../types/types";

const LineChart = lazy(() =>
  import("recharts").then((module) => ({ default: module.LineChart }))
);
const Line = lazy(() =>
  import("recharts").then((module) => ({ default: module.Line }))
);
const XAxis = lazy(() =>
  import("recharts").then((module) => ({ default: module.XAxis }))
);
const YAxis = lazy(() =>
  import("recharts").then((module) => ({ default: module.YAxis }))
);
const CartesianGrid = lazy(() =>
  import("recharts").then((module) => ({ default: module.CartesianGrid }))
);
const Tooltip = lazy(() =>
  import("recharts").then((module) => ({ default: module.Tooltip }))
);
const Legend = lazy(() =>
  import("recharts").then((module) => ({ default: module.Legend }))
);
const ResponsiveContainer = lazy(() =>
  import("recharts").then((module) => ({ default: module.ResponsiveContainer }))
);

const LLMSettingsPanel: React.FC<SettingsPanelProps> = ({
  isCollapsed,
  onExpand,
  settings,
  onSettingsChange,
}) => {
  const {
    llmType,
    modelName,
    temperature,
    inputLimit,
    maxToken,
    chatMemory,
    maxMessages,
    tokenUsageData,
    preDecoration,
    postDecoration,
    isRetrieveModalOpen,
    isAddToolModalOpen,
    tools,
    newToolJson,
    toxicityDetection,
  } = settings;

  const [loading, setLoading] = useState(false);

  const providerModels: ProviderModels = {
    [LLMType.OPENAI]: [
      "gpt-4",
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4o-turbo-preview",
    ],
    [LLMType.MISTRAL]: ["mistral-small", "mistral-large-latest"],
  };

  const filteredModels = useMemo(
    () => (llmType ? providerModels[llmType] : []),
    [llmType]
  );

  const estimateTokens = (text: string) => Math.ceil(text.length / 4);

  const totalPromptTokens =
    estimateTokens(preDecoration) + estimateTokens(postDecoration);

  const handleRetrieveTools = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onSettingsChange({
        ...settings,
        isRetrieveModalOpen: true,
        tools: [
          { name: "Tool 1", description: "Description of Tool 1" },
          { name: "Tool 2", description: "Description of Tool 2" },
        ],
      });
    } catch (error) {
      console.error(error);
      alert("Failed to retrieve tools.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTool = () => {
    onSettingsChange({
      ...settings,
      isAddToolModalOpen: true,
    });
  };

  const handleCloseRetrieveModal = () => {
    onSettingsChange({
      ...settings,
      isRetrieveModalOpen: false,
      tools: [],
    });
  };

  const handleCloseAddToolModal = () => {
    onSettingsChange({
      ...settings,
      isAddToolModalOpen: false,
      newToolJson: "",
    });
  };

  const handleSaveTool = () => {
    try {
      const tool = JSON.parse(newToolJson);
      if (tool.name && tool.description) {
        onSettingsChange({
          ...settings,
          tools: [...tools, tool],
          isAddToolModalOpen: false,
          newToolJson: "",
        });
        alert("Tool added successfully.");
      } else {
        alert("Invalid tool JSON: Missing name or description.");
      }
    } catch (error) {
      alert("Invalid JSON format.");
    }
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden`}>
      <div className={`overflow-y-auto space-y-2`}>
        {/* LLM Configuration */}
        <Accordion
          title="LLM Configuration"
          icon={Cog6ToothIcon}
          isCollapsed={isCollapsed}
          onCollapsedClick={onExpand}
        >
          <div className="space-y-4">
            {/* LLM Provider Dropdown */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                LLM Provider
              </label>
              <select
                value={llmType}
                onChange={(e) => {
                  onSettingsChange({
                    ...settings,
                    llmType: e.target.value as LLMType,
                    modelName: "",
                  });
                }}
                className="w-full bg-gray-800/50 text-gray-300 text-sm px-3 py-2 rounded-md border border-gray-700/50"
              >
                <option value="" className="text-sm">
                  Select provider
                </option>
                {Object.values(LLMType).map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>
            </div>
            {/* LLM Model Dropdown */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                LLM Model
              </label>
              <select
                value={modelName}
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    modelName: e.target.value,
                  })
                }
                disabled={!llmType}
                className={`w-full bg-gray-800/50 text-gray-300 text-sm px-3 py-2 rounded-md border border-gray-700/50 ${
                  !llmType ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <option value="" className="text-sm">
                  Select model
                </option>
                {filteredModels.map((modelOption) => (
                  <option key={modelOption} value={modelOption}>
                    {modelOption}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Accordion>

        {/* Generation Settings */}
        <Accordion
          title="Generation Settings"
          icon={AdjustmentsHorizontalIcon}
          isCollapsed={isCollapsed}
          onCollapsedClick={onExpand}
        >
          <div className="space-y-4">
            {/* Max Output Tokens */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Max Output Tokens
              </label>
              <input
                type="number"
                value={maxToken}
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    maxToken: Number(e.target.value),
                  })
                }
                min="1"
                max="2000"
                className="w-full bg-gray-800/50 text-gray-300 text-sm px-3 py-2 rounded-md border border-gray-700/50"
              />
              <small className="text-xs text-gray-500">
                Max. number of tokens the model can generate
              </small>
            </div>

            {/* Max Input Tokens */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Max Input Tokens
              </label>
              <input
                type="number"
                value={inputLimit}
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    inputLimit: Number(e.target.value),
                  })
                }
                min="1"
                max="6000"
                className="w-full bg-gray-800/50 text-gray-300 text-sm px-3 py-2 rounded-md border border-gray-700/50"
              />
              <small className="text-xs text-gray-500">
                Max. number of tokens allowed in the input prompt (1-6000).
              </small>
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Temperature
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={temperature}
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    temperature: Number(e.target.value),
                  })
                }
                className="w-full"
              />
              <div className="text-sm text-gray-400 text-right">
                {temperature.toFixed(2)}
              </div>
              <small className="text-xs text-gray-500">
                Controls the randomness of the output. Higher values (e.g., 1.5)
                produce more random results.
              </small>
            </div>
          </div>
        </Accordion>

        {/* Chat Memory */}
        <Accordion
          title="Chat Memory"
          icon={BoltIcon}
          isCollapsed={isCollapsed}
          onCollapsedClick={onExpand}
        >
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={chatMemory}
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    chatMemory: e.target.checked,
                  })
                }
                className="h-5 w-5 text-indigo-600 bg-gray-800 border-gray-700 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-400">Enable Chat Memory</span>
            </label>

            {chatMemory && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Max Messages
                </label>
                <input
                  type="number"
                  value={maxMessages}
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      maxMessages: Number(e.target.value),
                    })
                  }
                  min="0"
                  max="100"
                  className="w-full bg-gray-800/50 text-gray-300 px-3 py-2 rounded-md border border-gray-700/50"
                />
                <small className="text-xs text-gray-500">
                  Specifies the maximum number of messages to remember (0-100).
                </small>
              </div>
            )}
          </div>
        </Accordion>

        {/* Prompt Decoration */}
        <Accordion
          title="Prompt Decoration"
          icon={DocumentTextIcon}
          isCollapsed={isCollapsed}
          onCollapsedClick={onExpand}
        >
          <div className="space-y-4">
            {/* Pre-Prompt */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Pre-Prompt
                <span
                  className="ml-1 text-gray-500 cursor-pointer"
                  title="Text added before the user's input in the prompt."
                >
                  ℹ️
                </span>
              </label>
              <textarea
                aria-label="Pre-Prompt"
                value={preDecoration}
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    preDecoration: e.target.value,
                  })
                }
                placeholder="Text to add before the prompt..."
                rows={3}
                maxLength={1000}
                className="w-full px-3 py-2 bg-gray-800/50 text-gray-300 placeholder-gray-500 text-sm
                  border border-gray-700/50 rounded-md resize-y focus:outline-none focus:ring-1
                  focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="text-xs text-gray-500 text-right">
                {preDecoration.length} characters (~
                {estimateTokens(preDecoration)} tokens)
              </div>
            </div>

            {/* Post-Prompt */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Post-Prompt
                <span
                  className="ml-1 text-gray-500 cursor-pointer"
                  title="Text added after the user's input in the prompt."
                >
                  ℹ️
                </span>
              </label>
              <textarea
                aria-label="Post-Prompt"
                value={postDecoration}
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    postDecoration: e.target.value,
                  })
                }
                placeholder="Text to add after the prompt..."
                rows={3}
                maxLength={1000}
                className="w-full px-3 py-2 bg-gray-800/50 text-gray-300 placeholder-gray-500 text-sm
                  border border-gray-700/50 rounded-md resize-y focus:outline-none focus:ring-1
                  focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="text-xs text-gray-500 text-right">
                {postDecoration.length} characters (~
                {estimateTokens(postDecoration)} tokens)
              </div>
            </div>

            {/* Combined Length Warning */}
            {totalPromptTokens > inputLimit && (
              <p className="text-sm text-red-500">
                The combined length of your pre-prompt and post-prompt exceeds
                the maximum input limit of {inputLimit} tokens.
              </p>
            )}

            {/* Prompt Preview */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Prompt Preview
              </label>
              <div
                className="p-3 bg-gray-800/50 text-gray-300 rounded-md border border-gray-700/50
                  max-h-48 overflow-auto whitespace-pre-wrap break-words text-sm"
              >
                {preDecoration}
                <span className="text-blue-400"> [User Input] </span>
                {postDecoration}
              </div>
            </div>
          </div>
        </Accordion>

        {/* Tools Endpoints */}
        <Accordion
          title="Tools Endpoints"
          icon={WrenchScrewdriverIcon}
          isCollapsed={isCollapsed}
          onCollapsedClick={onExpand}
        >
          <div className="flex gap-2 w-full">
            <button
              onClick={handleRetrieveTools}
              disabled={loading}
              className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 
                rounded-md text-white text-xs flex items-center justify-center gap-1"
            >
              {loading ? (
                "Loading..."
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Retrieve Tools
                </>
              )}
            </button>
            <button
              onClick={handleAddTool}
              className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 
                rounded-md text-white text-xs flex items-center justify-center gap-1"
            >
              <PlusCircleIcon className="h-4 w-4" />
              Add Tool
            </button>
          </div>
        </Accordion>

        {/* Usage Statistics */}
        <Accordion
          title="Usage Statistics"
          icon={ChartBarIcon}
          isCollapsed={isCollapsed}
          onCollapsedClick={onExpand}
        >
          <div className="w-full h-64">
            <Suspense fallback={<div>Loading Chart...</div>}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={tokenUsageData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="session" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="inputTokens"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    name="Input Tokens"
                  />
                  <Line
                    type="monotone"
                    dataKey="outputTokens"
                    stroke="#82ca9d"
                    name="Output Tokens"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Suspense>
          </div>
        </Accordion>
      </div>

      {/* Retrieve Tools Modal */}
      {isRetrieveModalOpen && (
        <Modal onClose={handleCloseRetrieveModal} title="Retrieve Tools">
          <div className="space-y-4">
            {tools.length > 0 ? (
              <ul className="space-y-2">
                {tools.map((tool, index) => (
                  <li
                    key={index}
                    className="p-3 bg-gray-800/50 rounded-md border border-gray-700/50"
                  >
                    <h3 className="text-lg text-white">{tool.name}</h3>
                    <p className="text-sm text-gray-300">{tool.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-300">No tools available.</p>
            )}
          </div>
        </Modal>
      )}

      {/* Add Tool Modal */}
      {isAddToolModalOpen && (
        <Modal onClose={handleCloseAddToolModal} title="Add Tool">
          <div className="space-y-4">
            <label className="block text-sm text-gray-400 mb-2">
              Tool JSON
            </label>
            <textarea
              value={newToolJson}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  newToolJson: e.target.value,
                })
              }
              placeholder="Paste your tool JSON here..."
              rows={10}
              className="w-full px-3 py-2 bg-gray-800 text-gray-300 placeholder-gray-500 text-sm
                border border-gray-700 rounded-md resize-y focus:outline-none focus:ring-1
                focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCloseAddToolModal}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 
                  rounded-md text-white text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTool}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 
                  rounded-md text-white text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default React.memo(LLMSettingsPanel);
