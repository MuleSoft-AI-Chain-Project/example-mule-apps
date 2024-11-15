"use client"

// components/CrawlWebsite.tsx
import React, { useState } from 'react'
import { GlobeAltIcon } from '@heroicons/react/24/outline';

interface CrawlWebsiteProps {
    className?: string;
    storeNames: string[];
    onStoreCreated: (name: string) => void;
}

export default function CrawlWebsite({ className = '', storeNames, onStoreCreated }: CrawlWebsiteProps) {
    const [selectedStore, setSelectedStore] = useState('')
    const [websiteUrl, setStoreName] = useState('')
    const [depth, setDepth] = useState<number>(0)  // Step 1: Add state for depth
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [isCreating, setIsCreating] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')
        setError('')
        setIsCreating(true)

        try {
            const response = await fetch('/api/crawl-website', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ websiteUrl, depth, storeName: selectedStore }),  // Include depth in the request body
            })

            const data = await response.json()

            if (response.ok) {
                setMessage(`Crawl of ${websiteUrl} successful`)
                //onStoreCreated(websiteUrl) // Call the callback with the new store name
                //setStoreName('')
                setDepth(0)  // Reset depth after submission
            } else {
                setError(`Error: ${data.error}`)
            }
        } catch (error) {
            setError(`Error creating store: ${error.message}`)
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className={className}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="crawlWebsiteName" className="block text-base text-gray-400 mb-3">
                        Website URL
                    </label>
                    <input
                        id="crawlWebsiteName"
                        type="text"
                        value={websiteUrl}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Enter website URL"
                        className="w-full px-4 py-3.5 bg-[#1C1F2E] text-gray-100 placeholder-gray-500 
                            rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 border-0"
                        required
                    />
                </div>
                
                <div className="flex gap-4">
                    <div className="w-1/3">
                        <label htmlFor="crawlDepth" className="block text-base text-gray-400 mb-3">
                            Depth
                        </label>
                        <input
                            id="crawlDepth"
                            type="number"
                            value={depth}
                            onChange={(e) => setDepth(Number(e.target.value))}
                            placeholder="0"
                            className="w-full px-4 py-3.5 bg-[#1C1F2E] text-gray-100 placeholder-gray-500 
                                rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 border-0"
                            min="0"
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="storeSelect" className="block text-base text-gray-400 mb-3">
                            Store
                        </label>
                        <select
                            id="storeSelect"
                            value={selectedStore}
                            onChange={(e) => setSelectedStore(e.target.value)}
                            className="w-full px-4 py-3.5 bg-[#1C1F2E] text-gray-100 
                                rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 border-0"
                            required
                        >
                            <option value="">Select store</option>
                            {storeNames.map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <button
                    type="submit"
                    disabled={isCreating}
                    className={`w-full py-3.5 px-4 rounded-xl text-sm font-medium
                        text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-1 
                        focus:ring-blue-500 ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isCreating ? 'Crawling...' : 'Crawl Website'}
                </button>
            </form>
            {message && <p className="mt-4 text-sm text-green-400">{message}</p>}
            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </div>
    )
}
