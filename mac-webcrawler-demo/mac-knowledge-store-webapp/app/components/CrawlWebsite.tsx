"use client"

// components/CrawlWebsite.tsx
import React, { useState } from 'react'

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
        <div className="bg-white p-6 border-2 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Crawl Website</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="crawlWebsiteName" className="block text-sm font-medium text-gray-700 mb-1">
                        Website Url
                    </label>
                    <input
                        id="crawlWebsiteName"
                        type="text"
                        value={websiteUrl}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Enter website URL"
                        className="w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 text-gray-900"
                        required
                    />
                </div>
                
                {/* Step 2: Add the depth input field */}
                <div>
                    <label htmlFor="crawlDepth" className="block text-sm font-medium text-gray-700 mb-1">
                        Depth
                    </label>
                    <input
                        id="crawlDepth"
                        type="number"
                        value={depth}
                        onChange={(e) => setDepth(Number(e.target.value))}
                        placeholder="Enter depth"
                        className="w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 text-gray-900"
                        min="0"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="storeSelect" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Store
                    </label>
                    <select
                        id="storeSelect"
                        value={selectedStore}
                        onChange={(e) => setSelectedStore(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 text-gray-900"
                        required
                    >
                        <option value="">Select a store</option>
                        {storeNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <button
                    type="submit"
                    disabled={isCreating}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isCreating ? 'Crawling...' : 'Crawl Website'}
                </button>
            </form>
            {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>
    )
}
