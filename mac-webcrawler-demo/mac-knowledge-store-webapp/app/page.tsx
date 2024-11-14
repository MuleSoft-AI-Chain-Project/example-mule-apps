// app/page.tsx

"use client"

import { useState, useEffect, useCallback } from 'react'
import CreateStore from './components/CreateStore'
import QueryStore from './components/QueryStore'
import TabsCard from './components/TabsCard'

export default function Home() {
  const [storeNames, setStoreNames] = useState<string[]>([]);
  const [sidebarWidth, setSidebarWidth] = useState(320); // 320px = 20rem
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      const newWidth = mouseMoveEvent.clientX;
      if (newWidth > 200 && newWidth < 600) { // Min 200px, Max 600px
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

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
    <div className="flex min-h-screen">
      {/* Resizable Left Panel */}
      <div 
        className="bg-gray-50 border-r shadow-sm relative flex-shrink-0" 
        style={{ width: sidebarWidth }}
      >
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-semibold mb-4">LLM Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Model</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Temperature: 0.7
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                defaultValue="0.7"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Tokens: 500
              </label>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                defaultValue="500"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Modern Resize Handle */}
        <div
          className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize 
            group flex items-center justify-center
            hover:bg-gray-100 transition-colors duration-150 ease-in-out"
          onMouseDown={startResizing}
        >
          {/* Vertical dots pattern */}
          <div className="flex flex-col gap-1">
            <div className={`w-1 h-8 rounded-full transition-colors duration-150
              ${isResizing ? 'bg-indigo-600' : 'bg-gray-300 group-hover:bg-indigo-400'}`}>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6">
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