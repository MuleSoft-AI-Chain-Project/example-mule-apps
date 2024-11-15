// app/page.tsx

"use client"

import { useState, useEffect, useCallback } from 'react'
import CreateStore from './components/CreateStore'
import QueryStore from './components/QueryStore'
import TabsCard from './components/TabsCard'
import LLMSettingsPanel from './components/LLMSettingsPanel'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'
import { HomeIcon, Cog6ToothIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const [storeNames, setStoreNames] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Fetch store names from the server-side API
    const fetchStoreNames = async () => {
        try {
            const response = await fetch('/api/get-store');
            if (!response.ok) {
                throw new Error('Failed to fetch store names');
            }
            const data: string[] = await response.json();
            setStoreNames(data);
        } catch (error) {
            console.error(error);
        }
    };

    fetchStoreNames();
}, []);

  const addStoreName = (name: string) => {
    setStoreNames(prev => [...prev, name])
  }

  return (
    <div className="flex min-h-screen relative bg-[#0B0E17]">
      {/* Collapsible Left Panel */}
      <div className={`fixed left-0 top-0 h-full transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-[60px]' : 'w-80'} bg-[#151929]`}>
        {/* Logo Section */}
        <div className="flex items-center p-4 border-b border-gray-800">
          <div className="text-indigo-400 text-xl">
            <span className="text-2xl">⚡</span>
          </div>
          {!isCollapsed && <span className="text-white font-semibold ml-2">Agent Settings</span>}
        </div>

        {/* Settings Panel */}
        <LLMSettingsPanel isCollapsed={isCollapsed} />

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-4 bg-[#0B0E17] rounded-full p-1 border border-gray-800 hover:bg-[#1C1F2E]"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Main Content - adjusted margin */}
      <main className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-[60px]' : 'ml-80'} flex-1 p-6 bg-[#0B0E17]`}>
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-4rem)]">
            {/* Left Column - Store Management (4 columns = 1/3) */}
            <div className="col-span-4 flex flex-col gap-6 h-full">
              <div className="flex-none">
                <CreateStore onStoreCreated={addStoreName} />
              </div>
              
              <div className="flex-1 overflow-hidden">
                <TabsCard 
                  storeNames={storeNames} 
                  onStoreCreated={addStoreName} 
                  className="h-full"
                />
              </div>
            </div>

            {/* Right Column - Query Interface (8 columns = 2/3) */}
            <div className="col-span-8 h-full">
              <QueryStore 
                className="h-full" 
                storeNames={storeNames} 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}