// QueryStore.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import VoiceRecorder from "./VoiceRecorder"; // Import the VoiceRecorder
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ChatBubbleBottomCenterTextIcon,
  MicrophoneIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { QueryResult, Message, QueryStoreProps } from "@/types/types";

interface RenderMessageProps {
  message: Message;
}

const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="whitespace-pre-line text-inherit leading-relaxed inherit">
      {children}
    </p>
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
    <div className="border-b border-gray-700/50 p-2 transition-height ease-in-out duration-300">
      <button
        className="flex justify-between items-center w-full text-left text-white focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-xs font-medium">{source.fileName}</span>
        <span className="text-sm text-gray-300">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className="mt-2 pl-4 text-sm text-gray-400 italic">
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

const ToxicityDisplay: React.FC<{ toxicity: QueryResult["toxicity"] }> = ({
  toxicity,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!toxicity?.response?.results) return null;

  // Function to determine text color based on score
  const getScoreColor = (score: number): string => {
    const percentage = score * 100;
    if (percentage < 1) return "text-green-400";
    if (percentage < 10) return "text-blue-400";
    if (percentage < 25) return "text-yellow-400";
    if (percentage < 50) return "text-orange-400";
    return "text-red-500";
  };

  const scores = toxicity.response.results[0]?.category_scores;
  const topScores = scores
    ? Object.entries(scores)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 4)
    : [];

  return (
    <div className="mt-3 border-t border-gray-700/50 pt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs flex items-center gap-2 text-gray-300 hover:text-gray-200"
      >
        <span className="font-medium">Toxicity Analysis</span>
        <span>{isExpanded ? "▼" : "▲"}</span>
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-1 text-xs text-gray-400">
          {topScores.length > 0 ? (
            topScores.map(([category, score]) => (
              <div key={category} className="flex justify-between">
                <span>{category}:</span>
                <span className={getScoreColor(Number(score))}>
                  {(Number(score) * 100).toFixed(2)}%
                </span>
              </div>
            ))
          ) : (
            <div className="flex justify-between">
              <span>Toxicity detection not enabled</span>
              <span className="text-green-400">N/A</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const RenderMessage: React.FC<RenderMessageProps> = ({ message }) => {
  const isUser = message.type === "user";
  const alignClass = isUser ? "self-end" : "self-start";
  const bubbleClass = isUser
    ? "bg-blue-600 text-left" // Keep user message right aligned but text inside left-aligned
    : "bg-[#1E2235] text-left";

  return (
    <div
      className={`flex flex-col mb-2 ${alignClass} max-w-3xl lg:max-w-4xl animate-fadeIn`}
    >
      <div
        className={`${bubbleClass} p-6 rounded-3xl border border-gray-700/50 shadow-md`}
      >
        <div className="text-white text-base text-left leading-relaxed">
          {typeof message.content === "string" ? (
            message.content
          ) : (
            <>
              <ReactMarkdown
                className="prose prose-invert max-w-none prose-base"
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {message.partialResponse ||
                  message.content.payload.response ||
                  ""}
              </ReactMarkdown>

              {message.content.toxicity?.response && (
                <ToxicityDisplay toxicity={message.content.toxicity} />
              )}

              {message.content.payload.sources &&
                message.content.payload.sources.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-xs text-gray-300 font-medium mb-2">
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [inputErrors, setInputErrors] = useState({
    prompt: "",
    selectedStore: "",
  });
  const MAX_RECORDING_DURATION = 30; // 30 seconds

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Effect to handle recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prevTime) => {
          if (prevTime >= MAX_RECORDING_DURATION) {
            setIsRecording(false);
            return MAX_RECORDING_DURATION;
          }
          return prevTime + 1;
        });
      }, 1000);
    } else if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    };
  }, [isRecording, MAX_RECORDING_DURATION]);

  // Memoize handleRecordingComplete to prevent function reference changes
  const handleRecordingComplete = useCallback(
    async (response: QueryResult) => {
      setMessages((prev) => [
        ...prev,
        { type: "user", content: response.question },
      ]);

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
                question: prompt,
                storeName: selectedStore,
              },
            },
            question: prompt,
          },
        },
      ]);

      simulateStreamingResponse(
        response.payload.response,
        agentIndex,
        response
      );
    },
    [messages, prompt, selectedStore]
  );

  // Memoize onRecordingStop to prevent function reference changes
  const onRecordingStop = useCallback(() => {
    setIsRecording(false);
  }, []);

  const validateForm = (): boolean => {
    const errors = {
      prompt: "",
      selectedStore: "",
    };
    let isValid = true;

    if (!prompt.trim()) {
      errors.prompt = "Please enter a query.";
      isValid = false;
    }

    setInputErrors(errors);
    return isValid;
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
              question: prompt,
              storeName: selectedStore,
            },
          },
          question: prompt,
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
          "X-Grounded": llmSettings.grounded.toString(),
          "X-Pre-Decoration": llmSettings.preDecoration,
          "X-Post-Decoration": llmSettings.postDecoration,
          "X-RAG": Boolean(selectedStore).toString(),
        },
        body: JSON.stringify({
          storeName: selectedStore || undefined,
          prompt: prompt,
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
      }, idx * 5); // Typing speed (10ms per character) - 5x faster
    });
  };

  // Simplify the recording time display logic
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`bg-[#151929] rounded-3xl border border-gray-800/40 shadow-lg 
        flex flex-col h-full ${className} max-w-screen-2xl mx-auto`}
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

      {/* Always Render VoiceRecorder with Explicit maxDuration */}
      <VoiceRecorder
        onRecordingComplete={handleRecordingComplete}
        isRecording={isRecording}
        onRecordingStop={onRecordingStop}
        maxDuration={30}
        llmSettings={llmSettings}
        storeName={selectedStore || undefined}
        rag={Boolean(selectedStore)}
      />

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
          {/* Microphone Button to Start/Stop Recording */}
          <button
            type="button"
            onClick={() => {
              setIsRecording(!isRecording);
            }}
            className={`flex items-center justify-center text-gray-400 hover:text-gray-300 focus:outline-none relative ${
              isRecording ? "text-red-500 animate-pulse" : ""
            }`}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            <MicrophoneIcon className="h-6 w-6" />
            {isRecording && (
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-ping"></span>
            )}
          </button>

          {isRecording && (
            <span className="text-sm text-white">
              Recording... {formatRecordingTime(recordingTime)}
            </span>
          )}

          {/* Input Field */}
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
            className={`flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 
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
