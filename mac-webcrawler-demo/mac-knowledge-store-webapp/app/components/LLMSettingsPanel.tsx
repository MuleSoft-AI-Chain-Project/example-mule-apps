"use client";

import React, { useState } from "react";
import {
  Cog6ToothIcon,
  AdjustmentsHorizontalIcon,
  BoltIcon,
  ChartBarIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  ArrowDownTrayIcon,
  PlusCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

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

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  icon: React.ElementType;
  defaultOpen?: boolean;
  isCollapsed?: boolean;
  onCollapsedClick?: () => void;
}

function Accordion({
  title,
  children,
  icon: Icon,
  defaultOpen = false,
  isCollapsed = false,
  onCollapsedClick,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleClick = () => {
    if (isCollapsed && onCollapsedClick) {
      onCollapsedClick();
      setIsOpen(true); // Open this accordion when expanding
    } else if (!isCollapsed) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      className={`w-full my-2 rounded-lg ${
        isOpen ? "border border-blue-500 shadow-md" : ""
      }`}
    >
      <button
        aria-expanded={isOpen}
        className={`w-full flex items-center ${
          isCollapsed ? "justify-center" : "justify-between"
        } py-3 text-gray-200 hover:bg-blue-800 rounded-lg ${
          isCollapsed ? "px-0" : "px-3"
        } ${isOpen ? "bg-blue-800" : "bg-gray-800/40"}`}
        onClick={handleClick}
      >
        <div
          className={`flex ${
            isCollapsed ? "justify-center w-full" : "items-center gap-3"
          }`}
        >
          <Icon className="h-6 w-6" />
          {!isCollapsed && (
            <span className="text-[15px] font-medium">{title}</span>
          )}
        </div>
        {!isCollapsed &&
          (isOpen ? (
            <ChevronUpIcon className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          ))}
      </button>
      {!isCollapsed && isOpen && (
        <div className="py-4 space-y-4 px-3 bg-gray-800/40 rounded-b-lg">
          {children}
        </div>
      )}
    </div>
  );
}

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#151929] w-full max-w-lg mx-auto rounded-lg shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h2 className="text-xl text-white font-medium mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}

interface Tool {
  name: string;
  description: string;
}

interface SettingsPanelProps {
  className?: string;
  isCollapsed?: boolean;
  onExpand?: () => void;
}

export default function SettingsPanel({
  className = "",
  isCollapsed = false,
  onExpand,
}: SettingsPanelProps) {
  const [provider, setProvider] = useState<Provider | "">("");
  const [model, setModel] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxInputTokens, setMaxInputTokens] = useState(3000);
  const [maxOutputTokens, setMaxOutputTokens] = useState(500);
  const [chatMemory, setChatMemory] = useState(false);
  const [maxMessages, setMaxMessages] = useState(20);
  const [tokenUsageData] = useState([
    { session: "Session 1", inputTokens: 1500, outputTokens: 500 },
    { session: "Session 2", inputTokens: 2000, outputTokens: 800 },
    { session: "Session 3", inputTokens: 1800, outputTokens: 600 },
  ]);
  const [prePrompt, setPrePrompt] = useState("");
  const [postPrompt, setPostPrompt] = useState("");
  const [isRetrieveModalOpen, setIsRetrieveModalOpen] = useState(false);
  const [isAddToolModalOpen, setIsAddToolModalOpen] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [newToolJson, setNewToolJson] = useState("");

  const providerModels = {
    openai: ["gpt-4", "gpt-4o", "gpt-4o-mini", "gpt-4o-turbo-preview"],
    mistral: ["mistral-small", "mistral-large-latest"],
  } as const;

  type Provider = keyof typeof providerModels;

  const filteredModels = provider ? providerModels[provider] : [];

  const estimateTokens = (text: string) => Math.ceil(text.length / 4);

  const totalPromptTokens =
    estimateTokens(prePrompt) + estimateTokens(postPrompt);

  const handleRetrieveTools = () => {
    setIsRetrieveModalOpen(true);
    // Replace with actual API call in production
    setTools([
      { name: "Tool 1", description: "Description of Tool 1" },
      { name: "Tool 2", description: "Description of Tool 2" },
    ]);
  };

  const handleAddTool = () => {
    setIsAddToolModalOpen(true);
  };

  const handleCloseRetrieveModal = () => {
    setIsRetrieveModalOpen(false);
    setTools([]);
  };

  const handleCloseAddToolModal = () => {
    setIsAddToolModalOpen(false);
    setNewToolJson("");
  };

  const handleSaveTool = () => {
    try {
      const tool = JSON.parse(newToolJson);
      if (tool.name && tool.description) {
        setTools([...tools, tool]);
        setIsAddToolModalOpen(false);
        setNewToolJson("");
      } else {
        alert("Invalid tool JSON: Missing name or description");
      }
    } catch (error) {
      alert("Invalid JSON format");
    }
  };

  return (
    <div className={`flex flex-col ${className} h-full overflow-hidden`}>
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
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value as Provider);
                  setModel("");
                }}
                className="w-full bg-gray-800/50 text-gray-300 px-3 py-2 rounded-md border border-gray-700/50"
              >
                <option value="">Select provider</option>
                {Object.keys(providerModels).map((providerOption) => (
                  <option key={providerOption} value={providerOption}>
                    {providerOption.charAt(0).toUpperCase() +
                      providerOption.slice(1)}
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
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={!provider}
                className={`w-full bg-gray-800/50 text-gray-300 px-3 py-2 rounded-md border border-gray-700/50 ${
                  !provider ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <option value="">Select model</option>
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
                value={maxOutputTokens}
                onChange={(e) => setMaxOutputTokens(Number(e.target.value))}
                min="1"
                max="2000"
                className="w-full bg-gray-800/50 text-gray-300 px-3 py-2 rounded-md border border-gray-700/50"
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
                value={maxInputTokens}
                onChange={(e) => setMaxInputTokens(Number(e.target.value))}
                min="1"
                max="6000"
                className="w-full bg-gray-800/50 text-gray-300 px-3 py-2 rounded-md border border-gray-700/50"
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
                onChange={(e) => setTemperature(Number(e.target.value))}
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
                onChange={(e) => setChatMemory(e.target.checked)}
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
                  onChange={(e) => setMaxMessages(Number(e.target.value))}
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
                value={prePrompt}
                onChange={(e) => setPrePrompt(e.target.value)}
                placeholder="Text to add before the prompt..."
                rows={3}
                maxLength={1000}
                className="w-full px-3 py-2 bg-gray-800/50 text-gray-300 placeholder-gray-500
                  border border-gray-700/50 rounded-md resize-y focus:outline-none focus:ring-1
                  focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="text-xs text-gray-500 text-right">
                {prePrompt.length} characters (~
                {estimateTokens(prePrompt)} tokens)
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
                value={postPrompt}
                onChange={(e) => setPostPrompt(e.target.value)}
                placeholder="Text to add after the prompt..."
                rows={3}
                maxLength={1000}
                className="w-full px-3 py-2 bg-gray-800/50 text-gray-300 placeholder-gray-500
                  border border-gray-700/50 rounded-md resize-y focus:outline-none focus:ring-1
                  focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="text-xs text-gray-500 text-right">
                {postPrompt.length} characters (~
                {estimateTokens(postPrompt)} tokens)
              </div>
            </div>

            {/* Combined Length Warning */}
            {totalPromptTokens > maxInputTokens && (
              <p className="text-sm text-red-500">
                The combined length of your pre-prompt and post-prompt exceeds
                the maximum input limit of {maxInputTokens} tokens.
              </p>
            )}

            {/* Prompt Preview */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Prompt Preview
              </label>
              <div
                className="p-3 bg-gray-800/50 text-gray-300 rounded-md border border-gray-700/50
                  max-h-48 overflow-auto whitespace-pre-wrap break-words"
              >
                {prePrompt}
                <span className="text-blue-400"> [User Input] </span>
                {postPrompt}
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
              className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 
                               rounded-md text-white text-xs flex items-center justify-center gap-1"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Retrieve Tools
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
              onChange={(e) => setNewToolJson(e.target.value)}
              placeholder="Paste your tool JSON here..."
              rows={10}
              className="w-full px-3 py-2 bg-gray-800 text-gray-300 placeholder-gray-500
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
}
