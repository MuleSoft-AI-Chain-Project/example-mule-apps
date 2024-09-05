// app/page.tsx

"use client"

import { useState, useEffect } from 'react'
import CreateStore from './components/CreateStore'
import UploadDocument from './components/UploadDocument'
import QueryStore from './components/QueryStore'
import CrawlWebsite from './components/CrawlWebsite'
import TabsCard from './components/TabsCard';

export default function Home() {

  const [storeNames, setStoreNames] = useState<string[]>([]);

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
<main className="flex flex-col md:flex-row gap-5 max-w-full mx-auto max-h-[calc(100vh-4rem)]">
  <div className="w-full max-w-screen-lg md:w-2/5 space-y-5">
    <CreateStore onStoreCreated={addStoreName} />
    
    {/* Adjust the height of the TabsCard */}
    <TabsCard 
      storeNames={storeNames} 
      onStoreCreated={addStoreName} 
      className="max-h-[400px] overflow-auto" // Set the max height and handle overflow
    />
  </div>

  <div className="w-full md:w-3/5 flex">
    <QueryStore className="flex-grow" storeNames={storeNames} />
  </div>
</main>
  )
}