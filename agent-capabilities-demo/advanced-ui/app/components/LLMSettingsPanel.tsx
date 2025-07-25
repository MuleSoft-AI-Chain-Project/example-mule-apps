import React, { useState, useMemo, Suspense } from "react";
import {
  Cog6ToothIcon,
  AdjustmentsHorizontalIcon,
  BoltIcon,
  ChartBarIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  ArrowDownTrayIcon,
  PlusCircleIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";
import Accordion from "./ui/Accordion";
import Modal from "./ui/Modal";
import { SettingsPanelProps, LLMType, ProviderModels } from "../../types/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const LoadingSpinner = () => <div className="loader">Loading...</div>;

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
    grounded,
  } = settings;

  const [isRetrievingTools, setIsRetrievingTools] = useState(false);
  const [isAddingTool, setIsAddingTool] = useState(false);

  const providerModels: ProviderModels = {
    [LLMType.OPENAI]: [
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4o-turbo-preview",
    ],
    [LLMType.MISTRAL_AI]: ["mistral-small-latest", "mistral-large-latest"],
  };

  const filteredModels = useMemo(() => {
    return llmType ? providerModels[llmType] : [];
  }, [llmType]);

  const estimateTokens = (text: string): number => Math.ceil(text.length / 4);

  const totalPromptTokens =
    estimateTokens(preDecoration) + estimateTokens(postDecoration);

  // Reusable function for updating settings
  const updateSettings = (updatedValues: Partial<typeof settings>) => {
    onSettingsChange({
      ...settings,
      ...updatedValues,
    });
  };

  // Tool-related handlers
  const handleRetrieveTools = async () => {
    setIsRetrievingTools(true);
    updateSettings({ tools: [] });

    try {
      const response = await fetch("/api/get-tools", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to retrieve tools");
      }

      updateSettings({ isRetrieveModalOpen: true, tools: data });
    } catch (error: unknown) {
      handleFetchError(error, "Failed to retrieve tools");
    } finally {
      setIsRetrievingTools(false);
    }
  };

  const handleAddTool = () => {
    updateSettings({ isAddToolModalOpen: true });
  };

  const handleCloseRetrieveModal = () => {
    updateSettings({ isRetrieveModalOpen: false, tools: [] });
  };

  const handleCloseAddToolModal = () => {
    updateSettings({ isAddToolModalOpen: false, newToolJson: "" });
  };

  const handleSaveTool = async () => {
    setIsAddingTool(true);
    try {
      JSON.parse(newToolJson);

      const response = await fetch("/api/add-tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: newToolJson,
      });

      if (!response.ok) {
        throw new Error("Failed to add tool");
      }

      const result = await response.json();
      updateSettings({
        tools: [...tools, result],
        isAddToolModalOpen: false,
        newToolJson: "",
      });
      alert("Tool added successfully.");
    } catch (error: unknown) {
      handleFetchError(error, "Failed to add tool. Please try again.");
    } finally {
      setIsAddingTool(false);
    }
  };

  const handleFetchError = (error: unknown, defaultMessage: string) => {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(defaultMessage, errorMessage);
    alert(errorMessage);
  };

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      data-form-type="other"
    >
      <div className="overflow-y-auto space-y-2">
        {/* LLM Configuration */}
        <Accordion
          title="LLM Configuration"
          icon={Cog6ToothIcon}
          isCollapsed={isCollapsed}
          onCollapsedClick={onExpand}
        >
          <div className="space-y-4" data-form-type="other">
            {/* LLM Provider Dropdown */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                LLM Provider
              </label>
              <select
                value={llmType}
                onChange={(e) =>
                  updateSettings({
                    llmType: e.target.value as LLMType,
                    modelName: "",
                  })
                }
                className="w-full bg-gray-800/50 text-gray-300 text-sm px-3 py-2 rounded-md border border-gray-700/50"
                data-form-type="other"
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
                onChange={(e) => updateSettings({ modelName: e.target.value })}
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
                  updateSettings({
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
                  updateSettings({
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
                  updateSettings({
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

            {/* Toxicity Detection Checkbox */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={toxicityDetection}
                  onChange={(e) =>
                    updateSettings({
                      toxicityDetection: e.target.checked,
                    })
                  }
                  className="h-5 w-5 text-indigo-600 bg-gray-800 border-gray-700 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-400">
                  Enable Toxicity Detection
                </span>
              </label>
              <small className="block text-xs text-gray-500 mt-1 ml-8">
                Automatically detect and filter potentially harmful content
              </small>
            </div>

            {/* Grounded Checkbox */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={grounded}
                  onChange={(e) =>
                    updateSettings({
                      grounded: e.target.checked,
                    })
                  }
                  className="h-5 w-5 text-indigo-600 bg-gray-800 border-gray-700 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-400">
                  Enable Grounded Responses
                </span>
              </label>
              <small className="block text-xs text-gray-500 mt-1 ml-8">
                When enabled, the AI will respond with "I don't know" if it
                cannot find supporting information
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
                  updateSettings({
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
                    updateSettings({
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
                  updateSettings({ preDecoration: e.target.value })
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
                  updateSettings({ postDecoration: e.target.value })
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
              disabled={isRetrievingTools}
              className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 
                rounded-md text-white text-xs flex items-center justify-center gap-1"
            >
              {isRetrievingTools ? (
                <LoadingSpinner />
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Get Tools
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
        <Modal onClose={handleCloseRetrieveModal} title="Retrieved Tools">
          <div className="space-y-4">
            <pre className="p-4 bg-gray-800/50 rounded-md border border-gray-700/50 overflow-auto text-sm text-gray-300 whitespace-pre-wrap">
              <code className="language-json">
                {JSON.stringify(tools, null, 2)}
              </code>
            </pre>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      JSON.stringify(tools, null, 2)
                    );
                    alert("Copied to clipboard!");
                  } catch (err) {
                    alert("Failed to copy to clipboard.");
                  }
                }}
                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 rounded-md text-white text-sm flex items-center gap-1"
              >
                <ClipboardIcon className="h-4 w-4" /> Copy
              </button>
              <button
                onClick={handleCloseRetrieveModal}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Tool Modal */}
      {isAddToolModalOpen && (
        <Modal onClose={handleCloseAddToolModal} title="Add Tool">
          <div className="space-y-4" data-form-type="other">
            <label className="block text-sm text-gray-400 mb-2">
              Tool JSON
            </label>
            <textarea
              value={newToolJson}
              onChange={(e) => updateSettings({ newToolJson: e.target.value })}
              placeholder="Paste your tool JSON here..."
              rows={10}
              className="w-full px-3 py-2 bg-gray-800 text-gray-300 placeholder-gray-500 text-sm
                border border-gray-700 rounded-md resize-y focus:outline-none focus:ring-1
                focus:ring-blue-500 focus:border-blue-500"
              data-form-type="other"
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
                disabled={isAddingTool}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 
                  rounded-md text-white text-sm"
              >
                {isAddingTool ? <LoadingSpinner /> : "Save"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default React.memo(LLMSettingsPanel);
