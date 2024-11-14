"use client"

import React, { useState } from 'react';
import { 
    Cog6ToothIcon,
    AdjustmentsHorizontalIcon,
    BoltIcon,
    ChartBarIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

interface AccordionProps {
    title: string;
    children: React.ReactNode;
    icon: any;
    defaultOpen?: boolean;
}

function Accordion({ title, children, icon: Icon, defaultOpen = false }: AccordionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-700/50">
            <button
                className="w-full flex justify-between items-center py-3 px-3 text-gray-200 
                bg-gray-800/40 hover:bg-gray-700/50 rounded-lg my-1"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span className="text-[15px] font-medium">{title}</span>
                </div>
                {isOpen ? (
                    <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                ) : (
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                )}
            </button>
            {isOpen && (
                <div className="py-4 space-y-4 px-3">
                    {children}
                </div>
            )}
        </div>
    );
}

interface SettingsPanelProps {
    className?: string;
}

export default function SettingsPanel({ className = '' }: SettingsPanelProps) {
    const [provider, setProvider] = useState('openai');
    const [model, setModel] = useState('');
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(1000);
    const [chatMemory, setChatMemory] = useState(false);
    const [tokenUsage, setTokenUsage] = useState({
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
    });
    const [prePrompt, setPrePrompt] = useState('');
    const [postPrompt, setPostPrompt] = useState('');

    const providerModels = {
        openai: ['gpt-4', 'gpt-3.5-turbo'],
        anthropic: ['claude-3-opus', 'claude-3-sonnet'],
        mistral: ['mistral-large', 'mistral-medium'],
    };

    return (
        <div className={`flex flex-col ${className} h-full overflow-hidden`}>
            <div className="overflow-y-auto px-4 space-y-4">
                <Accordion title="LLM Configuration" icon={Cog6ToothIcon}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">LLM Provider</label>
                            <select
                                value={provider}
                                onChange={(e) => setProvider(e.target.value)}
                                className="w-full bg-gray-800/50 text-gray-300 px-3 py-2 rounded-md border border-gray-700/50"
                            >
                                <option value="openai">OpenAI</option>
                                <option value="anthropic">Anthropic</option>
                                <option value="mistral">Mistral</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Model</label>
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full bg-gray-800/50 text-gray-300 px-3 py-2 rounded-md border border-gray-700/50"
                            >
                                <option value="">Select model</option>
                                {providerModels[provider].map((model) => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </Accordion>

                <Accordion title="Generation Parameters" icon={AdjustmentsHorizontalIcon}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Temperature</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={temperature}
                                onChange={(e) => setTemperature(Number(e.target.value))}
                                className="w-full"
                            />
                            <div className="text-sm text-gray-400 text-right">{temperature}</div>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Max Tokens</label>
                            <input
                                type="number"
                                value={maxTokens}
                                onChange={(e) => setMaxTokens(Number(e.target.value))}
                                min="1"
                                max="4000"
                                className="w-full bg-gray-800/50 text-gray-300 px-3 py-2 rounded-md border border-gray-700/50"
                            />
                        </div>
                    </div>
                </Accordion>

                <Accordion title="Memory Settings" icon={BoltIcon}>
                    <label className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            checked={chatMemory}
                            onChange={(e) => setChatMemory(e.target.checked)}
                            className="rounded border-gray-700 bg-gray-800 text-indigo-500"
                        />
                        <span className="text-sm text-gray-400">Chat Memory</span>
                    </label>
                </Accordion>

                <Accordion title="Prompt Decoration" icon={DocumentTextIcon}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Pre-Prompt</label>
                            <textarea
                                value={prePrompt}
                                onChange={(e) => setPrePrompt(e.target.value)}
                                placeholder="Text to add before the prompt..."
                                rows={3}
                                className="w-full bg-gray-800/50 text-gray-300 px-3 py-2 rounded-md border border-gray-700/50 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Post-Prompt</label>
                            <textarea
                                value={postPrompt}
                                onChange={(e) => setPostPrompt(e.target.value)}
                                placeholder="Text to add after the prompt..."
                                rows={3}
                                className="w-full bg-gray-800/50 text-gray-300 px-3 py-2 rounded-md border border-gray-700/50 resize-none"
                            />
                        </div>
                    </div>
                </Accordion>

                <Accordion title="Usage Statistics" icon={ChartBarIcon}>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Prompt Tokens:</span>
                            <span className="text-sm text-gray-300">{tokenUsage.promptTokens}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Completion Tokens:</span>
                            <span className="text-sm text-gray-300">{tokenUsage.completionTokens}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-700 pt-2">
                            <span className="text-sm text-gray-300">Total Tokens:</span>
                            <span className="text-sm text-gray-300">{tokenUsage.totalTokens}</span>
                        </div>
                    </div>
                </Accordion>
            </div>
        </div>
    );
}