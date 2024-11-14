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
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);

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
    <div className="flex min-h-screen relative">
      {/* Fixed-width Left Panel with logo */}
      <div className="bg-[#1C1F2E] fixed left-0 top-0 h-full w-80">
        <div className="flex items-center gap-2 p-4 border-b border-gray-700">
            <div className="text-white text-xl font-semibold flex items-center gap-2">
                <div className="text-indigo-400">
                    <span className="text-2xl">⚡</span>
                </div>
                <span>LLM Settings</span>
            </div>
        </div>
        <LLMSettingsPanel />
      </div>

      {/* Main Content */}
      <main className="ml-80 flex-1 p-6">
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