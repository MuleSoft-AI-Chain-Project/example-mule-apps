"use client"

// components/CreateStore.tsx
import React, { useState } from 'react'
import { PlusCircleIcon } from '@heroicons/react/24/outline';

interface CreateStoreProps {
    className?: string;
    onStoreCreated: (name: string) => void;
}

export default function CreateStore({ className = '', onStoreCreated }: CreateStoreProps) {
    const [storeName, setStoreName] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [isCreating, setIsCreating] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')
        setError('')
        setIsCreating(true)

        try {
            const response = await fetch('/api/create-store', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ storeName }),
            })

            const data = await response.json()

            if (response.ok) {
                setMessage(`Store ${storeName} successfully created`)
                onStoreCreated(storeName) // Call the callback with the new store name
                setStoreName('')
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
        <div className="bg-[#151929] p-6 rounded-xl border border-gray-800/40 shadow-lg">
            <h2 className="text-xl text-white font-medium flex items-center gap-3">
                <PlusCircleIcon className="h-5 w-5 text-gray-400" />
                Create Store
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="createStoreName" className="block text-sm text-gray-400 mb-2">
                        Store Name
                    </label>
                    <input
                        id="createStoreName"
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Enter store name"
                        className="w-full px-3 py-2.5 bg-[#1C1F2E] text-gray-100 placeholder-gray-500 
                            border border-gray-700/40 rounded-lg focus:outline-none focus:ring-1 
                            focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={isCreating}
                    className={`w-full py-2.5 px-4 border border-gray-200/20 rounded-lg shadow-sm text-sm font-medium 
                        text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 
                        focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#151929]
                        ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isCreating ? 'Creating...' : 'Create Store'}
                </button>
            </form>
            {message && <p className="mt-4 text-sm text-green-400">{message}</p>}
            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </div>
    )
}