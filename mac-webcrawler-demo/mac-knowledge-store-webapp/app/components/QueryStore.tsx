"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ChatBubbleBottomCenterTextIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

interface LLMSettings {
  llmType: "OPENAI" | "MISTRAL_AI";
  modelName: string;
  temperature: number;
  inputLimit: number;
  maxToken: number;
  chatMemory: boolean;
  maxMessages: number;
  tokenUsageData: {
    session: string;
    inputTokens: number;
    outputTokens: number;
  }[];
  preDecoration: string;
  postDecoration: string;
  isRetrieveModalOpen: boolean;
  isAddToolModalOpen: boolean;
  tools: { name: string; description: string }[];
  newToolJson: string;
  toxicityDetection: boolean;
}

interface QueryResult {
  payload: {
    sources: {
      absoluteDirectoryPath: string;
      fileName: string;
      textSegment: string;
    }[];
    response: string;
  };
  attributes: {
    additionalAttributes: {
      getLatest: string;
      question: string;
      storeName: string;
    };
  };
  toxicity?: {
    response: {
      results: any[];
    };
  };
}

interface Message {
  type: "user" | "agent";
  content: string | QueryResult;
  partialResponse?: string; // For simulating streaming effect
}

interface QueryStoreProps {
  className?: string;
  storeNames: string[];
  llmSettings: LLMSettings;
}

interface RenderMessageProps {
  message: Message;
}

const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="whitespace-pre-line text-white">{children}</p>
  ),
  a: ({ node, ...props }) => (
    <a
      className="text-blue-400 hover:text-blue-300"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
};

const AccordionItem: React.FC<{
  source: QueryResult["payload"]["sources"][number];
}> = ({ source }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-700/50 p-2">
      <button
        className="flex justify-between items-center w-full text-left text-white focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{source.fileName}</span>
        <span className="text-sm text-gray-300">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className="mt-2 pl-4 text-sm text-white">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {source.textSegment}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

const RenderMessage: React.FC<RenderMessageProps> = ({ message }) => {
  const isUser = message.type === "user";
  const alignClass = isUser ? "self-end" : "self-start";
  const bubbleClass = isUser
    ? "bg-blue-500 text-right"
    : "bg-[#1E2235] text-left";

  return (
    <div className={`flex flex-col mb-2 ${alignClass} max-w-lg`}>
      <div
        className={`${bubbleClass} p-4 rounded-3xl border border-gray-700/50 shadow-lg`}
      >
        <div className="text-white text-sm">
          {typeof message.content === "string" ? (
            message.content
          ) : (
            <>
              <ReactMarkdown
                className="prose prose-invert max-w-none prose-sm"
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {message.partialResponse ||
                  message.content.payload.response ||
                  ""}
              </ReactMarkdown>
              {message.content.payload.sources &&
                message.content.payload.sources.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-white text-base font-semibold mb-2">
                      Sources:
                    </h3>
                    <div className="border border-gray-700/50 rounded-lg overflow-hidden">
                      {message.content.payload.sources.map((source, index) => (
                        <AccordionItem key={index} source={source} />
                      ))}
                    </div>
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default function QueryStore({
  className = "",
  storeNames,
  llmSettings,
}: QueryStoreProps) {
  const [selectedStore, setSelectedStore] = useState("");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [inputErrors, setInputErrors] = useState({
    selectedStore: "",
    prompt: "",
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const validateForm = (): boolean => {
    const errors = {
      selectedStore: "",
      prompt: "",
    };
    let isValid = true;

    if (!selectedStore) {
      errors.selectedStore = "Please select a store.";
      isValid = false;
    }

    if (!prompt.trim()) {
      errors.prompt = "Please enter a query.";
      isValid = false;
    }

    setInputErrors(errors);
    return isValid;
  };

  const simulateStreamingResponse = (
    response: string,
    messageIndex: number,
    originalMessage: QueryResult
  ) => {
    let currentText = "";
    response.split("").forEach((char, idx) => {
      setTimeout(() => {
        currentText += char;
        setMessages((prev) => {
          const newMessages = [...prev];
          const messageToUpdate = newMessages[messageIndex];
          if (typeof messageToUpdate.content !== "string") {
            messageToUpdate.partialResponse = currentText;
          }
          return newMessages;
        });

        // After the last character, ensure we set the complete message with sources
        if (idx === response.length - 1) {
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[messageIndex] = {
              ...newMessages[messageIndex],
              content: originalMessage,
            };
            return newMessages;
          });
        }
      }, idx * 10); // Typing speed (10ms per character) - 5x faster
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsQuerying(true);
    setMessages((prev) => [...prev, { type: "user", content: prompt }]);

    // Add a placeholder message for the agent response
    const agentIndex = messages.length + 1;
    setMessages((prev) => [
      ...prev,
      {
        type: "agent",
        content: {
          payload: {
            response: "",
            sources: [],
          },
          attributes: {
            additionalAttributes: {
              getLatest: "",
              question: "",
              storeName: "",
            },
          },
        },
      },
    ]);

    try {
      const response = await fetch("/api/query-store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-LLM-Type": llmSettings.llmType,
          "X-LLM-Model": llmSettings.modelName,
          "X-Temperature": llmSettings.temperature.toString(),
          "X-Max-Tokens": llmSettings.maxToken.toString(),
          "X-Input-Limit": llmSettings.inputLimit.toString(),
          "X-Chat-Memory": llmSettings.chatMemory.toString(),
          "X-Max-Messages": llmSettings.maxMessages.toString(),
          "X-Toxicity-Detection": llmSettings.toxicityDetection.toString(),
          "X-Pre-Decoration": llmSettings.preDecoration,
          "X-Post-Decoration": llmSettings.postDecoration,
        },
        body: JSON.stringify({
          storeName: selectedStore,
          prompt: prompt,
          tools: llmSettings.tools,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data: QueryResult = await response.json();

      // Start simulating a streaming response
      simulateStreamingResponse(data.payload.response, agentIndex, data);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { type: "agent", content: `Error querying store: ${error.message}` },
      ]);
    } finally {
      setIsQuerying(false);
      setPrompt("");
    }
  };

  return (
    <div
      className={`bg-[#151929] rounded-3xl border border-gray-800/40 shadow-lg 
        flex flex-col h-full ${className}`}
      data-form-type="other"
    >
      <div className="flex-none p-6 pb-2">
        <h2 className="text-xl text-white font-medium flex items-center gap-3">
          <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-gray-400" />
          Query Knowledge Base
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 relative">
        <div className="flex flex-col gap-4">
          {messages.map((message, index) => (
            <RenderMessage key={index} message={message} />
          ))}
          <div ref={chatEndRef} />
          {isQuerying && (
            <div className="text-gray-500 text-sm mt-2 animate-pulse">
              Agent is typing<span className="dot-flashing">...</span>
            </div>
          )}
        </div>
      </div>

      <div
        className="flex-none p-6 pt-2 border-t border-gray-800/40"
        data-form-type="other"
      >
        <div className="flex items-center mb-4">
          <label
            htmlFor="store-select"
            className="text-white text-sm mr-3 flex-none"
          >
            Knowledge Store
          </label>
          <select
            id="store-select"
            value={selectedStore}
            onChange={(e) => {
              setSelectedStore(e.target.value);
              setInputErrors((prev) => ({ ...prev, selectedStore: "" }));
            }}
            className="inline-flex px-4 py-2 bg-[#1C1F2E] text-gray-100 text-sm border border-gray-700/40 
              rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            required
            data-form-type="other"
          >
            <option value="" className="text-sm">
              Select a store
            </option>
            {storeNames.map((name) => (
              <option key={name} value={name} className="text-sm">
                {name}
              </option>
            ))}
          </select>
          {inputErrors.selectedStore && (
            <p className="text-sm text-red-400 ml-3">
              {inputErrors.selectedStore}
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center space-x-4 bg-[#1C1F2E] rounded-full px-4 py-3 border border-gray-700/40"
          data-form-type="other"
        >
          <button
            type="button"
            className="flex items-center justify-center text-gray-400 hover:text-gray-300 focus:outline-none"
          >
            <MicrophoneIcon className="h-6 w-6" />
          </button>

          <input
            type="text"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setInputErrors((prev) => ({ ...prev, prompt: "" }));
            }}
            placeholder="Send a message..."
            className="flex-grow px-3 py-1.5 bg-transparent text-gray-100 placeholder-gray-500 text-sm focus:outline-none"
            required
            data-form-type="other"
          />
          {inputErrors.prompt && (
            <p className="text-sm text-red-400 mt-1">{inputErrors.prompt}</p>
          )}

          <button
            type="submit"
            disabled={isQuerying}
            className={`flex items-center justify-center h-10 w-10 rounded-full bg-blue-500 hover:bg-blue-600 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#151929]
                ${isQuerying ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <PaperAirplaneIcon className="h-5 w-5 text-white transform rotate-45" />
          </button>
        </form>
      </div>
    </div>
  );
}
