"use client";

import { useRef, useState } from "react";
import va from "@vercel/analytics";
import clsx from "clsx";
import { LoadingCircle, SendIcon } from "./icons";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Textarea from "react-textarea-autosize";
import { toast } from "sonner";
import Image from "next/image";
import React from "react";

// Define the Message type
type Message = {
  role: string;
  content: string;
};

// Define the TokenInfo type
type TokenInfo = {
  inputCount: number;
  outputCount: number;
  totalCount: number;
};

// Example users
const users = [
  { clientId: "user1", name: "Alice" },
  { clientId: "user2", name: "Bob" },
  { clientId: "user3", name: "Charlie" },
];

const examples = [
  "Return the last created Lead",
  "How many active users do we have in Salesforce? Return their names",
  "Return the 3 Contact names and order by date",
  "Return all open opportunities",
  "What was our last closed case in Salesforce"
];

// New component to display token information
const TokenInfo = ({ tokenInfo }: { tokenInfo: TokenInfo | null }) => {
  if (!tokenInfo) return null;

  return (
    <div className="mt-2 text-sm text-gray-500">
      <p>Input tokens: {tokenInfo.inputCount}</p>
      <p>Output tokens: {tokenInfo.outputCount}</p>
      <p>Total tokens: {tokenInfo.totalCount}</p>
    </div>
  );
};

export default function Chat() {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTokenInfo, setCurrentTokenInfo] = useState<TokenInfo | null>(null);
  const [selectedUser, setSelectedUser] = useState<{ clientId: string; name: string } | null>(null);

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const user = users.find(u => u.clientId === e.target.value);
    setSelectedUser(user || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser) return;

    const newMessage: Message = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const requestBody = { data: input, clientId: selectedUser.clientId };
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      setCurrentTokenInfo(data.tokenInfo);
      va.track("Chat initiated");
    } catch (error) {
      console.error("Error occurred during fetch:", error);
      toast.error("Something went wrong. Please try again.");
      va.track("Chat errored", {
        input,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disabled = isLoading || input.length === 0 || !selectedUser;

  return (
    <main className="flex flex-col items-center justify-between pb-40">
      <div className="absolute top-5 hidden w-full justify-between px-5 sm:flex">

        {/* User Selection Dropdown */}
        <div className="flex items-center space-x-2">
          <label htmlFor="userSelect" className="text-sm font-medium text-gray-700">
            Select User:
          </label>
          <select
            id="userSelect"
            onChange={handleUserSelect}
            className="p-2 border rounded-md"
            defaultValue=""
          >
            <option value="" disabled>
              Select a user
            </option>
            {users.map(user => (
              <option key={user.clientId} value={user.clientId}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>



      {messages.length > 0 ? (
        messages.map((message, i) => (
          <div
            key={i}
            className={clsx(
              "flex w-full items-center justify-center border-b border-gray-200 py-8",
              message.role === "user" ? "bg-white" : "bg-gray-100",
            )}
          >
            <div className="flex w-full max-w-screen-md items-start space-x-4 px-5 sm:px-0">
              <div
                className={clsx(
                  "p-1.5 text-white",
                  message.role === "assistant" ? "bg-green-500" : "bg-black",
                )}
              >
                {message.role === "user" ? (
                  <User width={20} />
                ) : (
                  <Bot width={20} />
                )}
              </div>
              <ReactMarkdown
                className="prose mt-1 w-full break-words prose-p:leading-relaxed"
                remarkPlugins={[remarkGfm]}
                components={{
                  a: (props) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))
      ) : (
        <div className="mx-5 mt-5 max-w-screen-md rounded-md border border-gray-200 sm:mx-0 sm:mt-20 sm:w-full">
          <div className="flex flex-col items-center p-5 sm:flex-row sm:p-10">
            <Image
              src="/images/logo.png"
              width={50}
              height={50}
              alt="MuleSoft AI Chain Agent Logo"
              className="mb-4 h-12 w-12 sm:mb-0 sm:mr-10 sm:h-16 sm:w-16"
            />
            <div className="flex flex-col space-y-2 text-center sm:text-left">
              <h1 className="text-lg font-semibold text-black sm:text-xl">
                Welcome to the MuleSoft AI Chain Agent
              </h1>
              <p className="text-sm text-gray-500 sm:text-base">
                This is an AI chatbot built using{" "}
                <a
                  href="https://docs.langchain4j.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline underline-offset-4 transition-colors hover:text-black"
                >
                  Langchain4j
                </a>{" "}
                and{" "}
                <a
                  href="https://sdk.vercel.ai/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline underline-offset-4 transition-colors hover:text-black"
                >
                  Mule SDK
                </a>{" "}
                designed to interact with any{" "}
                <a
                  href="https://github.com/HackerNews/API"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline underline-offset-4 transition-colors hover:text-black"
                >
                  Large Language Model (LLM)
                </a>{" "}
                through natural language.
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-4 border-t border-gray-200 bg-gray-50 p-7 sm:p-10">
            {examples.map((example, i) => (
              <button
                key={i}
                className="rounded-md border border-gray-200 bg-white px-5 py-3 text-left text-sm text-gray-500 transition-all duration-75 hover:border-black hover:text-gray-700 active:bg-gray-50"
                onClick={() => {
                  setInput(example);
                  inputRef.current?.focus();
                }}
                disabled={!selectedUser}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="fixed bottom-0 flex w-full flex-col items-center space-y-3 bg-gradient-to-b from-transparent via-gray-100 to-gray-100 p-5 pb-3 sm:px-0">
        <div className="w-full max-w-screen-md">
          <TokenInfo tokenInfo={currentTokenInfo} />
        </div>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="relative w-full max-w-screen-md rounded-xl border border-gray-200 bg-white px-4 pb-2 pt-3 shadow-lg sm:pb-3 sm:pt-4"
        >
          <Textarea
            ref={inputRef}
            tabIndex={0}
            required
            rows={1}
            autoFocus
            placeholder="Send a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                formRef.current?.requestSubmit();
                e.preventDefault();
              }
            }}
            spellCheck={false}
            className="w-full pr-10 focus:outline-none"
            disabled={!selectedUser}
          />
          <button
            className={clsx(
              "absolute inset-y-0 right-3 my-auto flex h-8 w-8 items-center justify-center rounded-md transition-all",
              disabled
                ? "cursor-not-allowed bg-white"
                : "bg-green-500 hover:bg-green-600",
            )}
            disabled={disabled}
          >
            {isLoading ? (
              <LoadingCircle />
            ) : (
              <SendIcon
                className={clsx(
                  "h-4 w-4",
                  input.length === 0 ? "text-gray-300" : "text-white",
                )}
              />
            )}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400">
          Built with{" "}
          <a
            href="https://docs.mulesoft.com/mule-sdk/latest/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-black"
          >
            Mule SDK
          </a>{" "}
          and{" "}
          <a
            href="https://docs.langchain4j.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-black"
          >
            Langchain4J
          </a>
          .{" "}
        </p>
      </div>
    </main>
  );
}
