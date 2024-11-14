"use client"

import { useState } from 'react';

interface LLMSettingsPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function LLMSettingsPanel({ isOpen, onToggle }: LLMSettingsPanelProps) {
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(500);
  const [model, setModel] = useState('gpt-3.5-turbo');

  return (
    <div 
      className={`fixed right-0 top-0 h-full bg-gray-50 shadow-lg transition-all duration-300 z-20
        ${isOpen ? 'w-80' : 'w-0'}`}
    >
      <div className="relative">
        {!isOpen ? (
          <div 
            onClick={onToggle}
            className="fixed right-0 top-20 flex items-center gap-2 cursor-pointer
              bg-black text-white py-3 px-4 rounded-l shadow-lg
              hover:bg-gray-800 transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 4.5-7.5 7.5 7.5 7.5" />
            </svg>
            <span className="[writing-mode:vertical-lr] whitespace-nowrap text-sm font-medium">
              LLM Settings
            </span>
          </div>
        ) : (
          <button
            onClick={onToggle}
            className="absolute left-0 top-4 transform -translate-x-1/2 bg-black text-white rounded-full p-3 shadow-lg
              hover:bg-gray-800 border border-gray-600 transition-all duration-300
              flex items-center justify-center w-10 h-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 19.5 15.75 12l-7.5-7.5" />
            </svg>
          </button>
        )}
      </div>

      <div className={`${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} 
        transition-opacity duration-300 p-6 space-y-6 overflow-auto`}>
        <h2 className="text-2xl font-semibold mb-4">LLM Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Temperature: {temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Max Tokens: {maxTokens}
            </label>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}