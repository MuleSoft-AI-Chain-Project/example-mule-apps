import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

const AccordionItem: React.FC<{ source: QueryResult['sources'][number] }> = ({ source }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200 p-2">
            <button
                className="flex justify-between items-center w-full text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-medium text-gray-800">{source.fileName}</span>
                <span className="text-sm text-gray-600">
                    {isOpen ? '▲' : '▼'}
                </span>
            </button>
            {isOpen && (
                <div className="mt-2 pl-4 text-sm text-gray-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {source.textSegment}
                    </ReactMarkdown>
                </div>
            )}
        </div>
    );
};

const RenderMessage: React.FC<RenderMessageProps> = ({ message, selectedStore }) => {
    const label = message.type === 'user' ? 'User:' : 'Agent:';
    const alignClass = message.type === 'user' ? 'self-end' : 'self-start';
    const bgClass = message.type === 'user' ? 'bg-[#1C1F2E]' : 'bg-[#212534]';
    const textClass = 'text-gray-100';

    if (typeof message.content === 'string') {
        return (
            <div className={`${bgClass} p-3 rounded-lg mb-2 max-w-3/4 ${alignClass} border border-gray-700/50`}>
                <p className={`${textClass} font-semibold`}>{label} {message.content}</p>
            </div>
        );
    }

    const content = message.content as QueryResult;

    return (
        <div className={`${bgClass} p-4 rounded-lg mb-2 w-full ${alignClass} border border-gray-700/50`}>
            <p className={`${textClass} font-semibold mb-2`}>{label}</p>
            <div className="space-y-5">
                <div className="bg-[#151929] p-3 rounded-lg shadow-sm border border-gray-700/50">
                    <ReactMarkdown
                        className="prose prose-invert max-w-none"
                        remarkPlugins={[remarkGfm]}
                        components={components}
                    >
                        {content.response}
                    </ReactMarkdown>
                </div>
                {content.sources && content.sources.length > 0 && (
                    <div>
                        <p className="font-medium text-gray-300 mb-1">Sources:</p>
                        <div className="bg-[#151929] rounded-lg border border-gray-700/50">
                            {content.sources.map((source, idx) => (
                                <AccordionItem key={idx} source={source} />
                            ))}
                        </div>
                    </div>
                )}
                <hr className="border-gray-700/50" />
                <div className="text-sm text-gray-400">
                    <p><strong className="text-gray-300">Store Path:</strong> {selectedStore}</p>
                </div>
                {content.tokenUsage && (
                    <div className="text-sm text-gray-400">
                        <p className="font-medium text-gray-300">Token Usage:</p>
                        <p>Input: {content.tokenUsage.inputCount}</p>
                        <p>Output: {content.tokenUsage.outputCount}</p>
                        <p>Total: {content.tokenUsage.totalCount}</p>
                    </div>
                )}
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
        <div className={`bg-[#151929] p-6 rounded-xl border border-gray-800/40 shadow-lg flex flex-col h-full ${className}`}>
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Query Knowledge Base</h2>
            <div className="flex-grow overflow-y-auto mb-4 flex flex-col">
                {messages.map((message, index) => (
                    <RenderMessage key={index} message={message} selectedStore={selectedStore} />
                ))}
                <div ref={chatEndRef} />
            </div>
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
    );
}