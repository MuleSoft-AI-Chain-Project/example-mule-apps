// app/page.tsx

"use client"

import { useState, useEffect } from 'react'
import CreateStore from './components/CreateStore'
import UploadDocument from './components/UploadDocument'
import QueryStore from './components/QueryStore'
import CrawlWebsite from './components/CrawlWebsite'

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
      <div className="w-full max-w-screen-lg md:w-1/5 space-y-5">
        <CreateStore onStoreCreated={addStoreName} />
        <CrawlWebsite storeNames={storeNames} onStoreCreated={addStoreName} />
        <UploadDocument storeNames={storeNames} />
      </div>
      <div className="w-full md:w-4/5 flex">
        <QueryStore className="flex-grow" storeNames={storeNames} />
      </div>
    </main>
  )
}