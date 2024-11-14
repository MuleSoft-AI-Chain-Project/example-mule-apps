import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Components } from 'react-markdown';

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
    const bgClass = message.type === 'user' ? 'bg-indigo-100' : 'bg-gray-100';
    const textClass = message.type === 'user' ? 'text-indigo-800' : 'text-gray-800';

    if (typeof message.content === 'string') {
        return (
            <div className={`${bgClass} p-3 rounded-lg mb-2 max-w-3/4 ${alignClass}`}>
                <p className={`${textClass} font-semibold`}>{label} {message.content}</p>
            </div>
        );
    }

    const content = message.content as QueryResult;

    // Custom components for ReactMarkdown
    const components: Components = {
        // This will render paragraphs with preserved line breaks
        p: ({ children }) => <p className="whitespace-pre-line">{children}</p>,
        // Open links in new tab
        a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />,
    };

    return (
        <div className={`${bgClass} p-4 rounded-lg mb-2 w-full ${alignClass}`}>
            <p className={`${textClass} font-semibold mb-2`}>{label}</p>
            <div className="space-y-5">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                    <ReactMarkdown
                        className="prose max-w-none"
                        remarkPlugins={[remarkGfm]}
                        components={components}
                    >
                        {content.response}
                    </ReactMarkdown>
                </div>
                {content.sources && content.sources.length > 0 && (
                    <div>
                        <p className="font-medium text-gray-700 mb-1">Sources:</p>
                        <div className="bg-white rounded shadow-sm">
                            {content.sources.map((source, idx) => (
                                <AccordionItem key={idx} source={source} />
                            ))}
                        </div>
                    </div>
                )}
                <hr />
                <div className="text-sm text-gray-600">
                    <p><strong>Store Path:</strong> {selectedStore}</p>
                </div>
                {content.tokenUsage && (
                    <div className="text-sm text-gray-600">
                        <p className="font-medium">Token Usage:</p>
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
        <div className={`bg-white p-6 border-2 rounded-lg shadow-md flex flex-col h-full ${className}`}>
            <h2 className="text-xl font-bold text-gray-700 mb-6 ">Query Knowledge Base</h2>
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
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 text-gray-900"
                    required
                >
                    <option value="">Select a store</option>
                    {storeNames.map((name) => (
                        <option key={name} value={name}>
                            {name}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter your query"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 text-gray-900"
                    required
                />
                <button
                    type="submit"
                    disabled={isQuerying}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isQuerying ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    {isQuerying ? 'Querying...' : 'Send'}
                </button>
            </form>
        </div>
    );
}