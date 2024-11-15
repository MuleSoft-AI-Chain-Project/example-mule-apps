import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

interface QueryResult {
    getLatest: boolean;
    question: string;
    sources: {
        absoluteDirectoryPath: string;
        fileName: string;
        textSegment: string;
    }[];
    response: string;
    tokenUsage: {
        outputCount: number;
        totalCount: number;
        inputCount: number;
    };
    storeName: string;
}

interface Message {
    type: 'user' | 'agent';
    content: string | QueryResult;
}

interface QueryStoreProps {
    className?: string;
    storeNames: string[];
}

interface RenderMessageProps {
    message: Message;
    selectedStore: string;
}

const components: Components = {
    p: ({ children }) => <p className="whitespace-pre-line text-white">{children}</p>,
    a: ({ node, ...props }) => (
        <a 
            className="text-blue-400 hover:text-blue-300" 
            target="_blank" 
            rel="noopener noreferrer" 
            {...props} 
        />
    ),
};

const AccordionItem: React.FC<{ source: QueryResult['sources'][number] }> = ({ source }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-700/50 p-2">
            <button
                className="flex justify-between items-center w-full text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-medium text-white">{source.fileName}</span>
                <span className="text-sm text-gray-300">
                    {isOpen ? '▲' : '▼'}
                </span>
            </button>
            {isOpen && (
                <div className="mt-2 pl-4 text-sm text-white">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {source.textSegment}
                    </ReactMarkdown>
                </div>
            )}
        </div>
    );
};

const RenderMessage: React.FC<RenderMessageProps> = ({ message, selectedStore }) => {
    const isUser = message.type === 'user';
    const alignClass = isUser ? 'self-end' : 'self-start';
    const bgClass = isUser ? 'bg-[#3B82F6]' : 'bg-[#1E2235]';

    if (typeof message.content === 'string') {
        return (
            <div className={`${bgClass} p-4 rounded-lg mb-2 max-w-3/4 ${alignClass} border border-gray-700/50`}>
                <div className="mb-2">
                    <span className="text-white text-base font-bold">
                        {isUser ? 'User:' : 'Agent:'}
                    </span>
                </div>
                <div className="text-white">
                    {message.content}
                </div>
                {!isUser && (
                    <div className="mt-3 pt-3 border-t border-gray-700/50 text-sm text-gray-300">
                        <span className="font-medium">Store Path:</span> {selectedStore}
                    </div>
                )}
            </div>
        );
    }

    // For agent responses with QueryResult content
    const content = message.content as QueryResult;
    return (
        <div className={`${bgClass} p-4 rounded-lg mb-2 w-full ${alignClass} border border-gray-700/50`}>
            <div className="mb-2">
                <span className="text-white text-base font-bold">Agent:</span>
            </div>
            <div className="text-white">
                <ReactMarkdown
                    className="prose prose-invert max-w-none text-white
                        prose-p:text-white 
                        prose-headings:text-white 
                        prose-strong:text-white 
                        prose-ul:text-white 
                        prose-ol:text-white 
                        prose-li:text-white
                        prose-code:text-white
                        [&>*]:text-white"
                    remarkPlugins={[remarkGfm]}
                    components={components}
                >
                    {content.response}
                </ReactMarkdown>
            </div>
            {/* Sources and token usage sections */}
            <div className="mt-3 pt-3 border-t border-gray-700/50 text-sm text-gray-300">
                <span className="font-medium">Store Path:</span> {selectedStore}
            </div>
        </div>
    );
};

export default function QueryStore({ className = '', storeNames }: QueryStoreProps) {
    const [selectedStore, setSelectedStore] = useState('');
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isQuerying, setIsQuerying] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsQuerying(true);
        setMessages(prev => [...prev, { type: 'user', content: prompt }]);

        try {
            const response = await fetch('/api/query-store', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ storeName: selectedStore, prompt }),
            });

            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }

            const data: QueryResult = await response.json();

            setMessages(prev => [
                ...prev,
                {
                    type: 'agent',
                    content: data,
                },
            ]);
        } catch (error) {
            setMessages(prev => [
                ...prev,
                { type: 'agent', content: `Error querying store: ${error.message}` },
            ]);
        } finally {
            setIsQuerying(false);
            setPrompt('');
        }
    };

    return (
        <div className={`bg-[#151929] rounded-xl border border-gray-800/40 shadow-lg 
            flex flex-col h-full ${className}`}>
            <div className="flex-none p-6 pb-2">
                <h2 className="text-xl text-white font-medium flex items-center gap-3">
                    <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-gray-400" />
                    Query Knowledge Base
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="flex flex-col">
                    {messages.map((message, index) => (
                        <RenderMessage key={index} message={message} selectedStore={selectedStore} />
                    ))}
                    <div ref={chatEndRef} />
                </div>
            </div>

            <div className="flex-none p-6 pt-2 border-t border-gray-800/40">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                    <select
                        value={selectedStore}
                        onChange={(e) => setSelectedStore(e.target.value)}
                        className="px-3 py-2.5 bg-[#1C1F2E] text-gray-100 border border-gray-700/40 
                            rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        required
                    >
                        <option value="">Select a store</option>
                        {storeNames.map((name) => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter your query"
                        className="flex-grow px-3 py-2.5 bg-[#1C1F2E] text-gray-100 placeholder-gray-500 
                            border border-gray-700/40 rounded-lg focus:outline-none focus:ring-1 
                            focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                    <button
                        type="submit"
                        disabled={isQuerying}
                        className={`px-4 py-2.5 border border-gray-200/20 rounded-lg shadow-sm text-sm font-medium 
                            text-white bg-[#151929] hover:bg-[#1C2438] focus:outline-none focus:ring-2 
                            focus:ring-offset-2 focus:ring-[#151929] focus:ring-offset-[#0F1117]
                            ${isQuerying ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isQuerying ? 'Querying...' : 'Send'}
                    </button>
                </form>
            </div>
        </div>
    );
}