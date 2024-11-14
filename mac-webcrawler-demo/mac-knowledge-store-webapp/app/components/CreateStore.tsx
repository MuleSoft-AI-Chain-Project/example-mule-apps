"use client"

// components/CreateStore.tsx
import React, { useState } from 'react'

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
        <div className="bg-white p-6 border-2 rounded-lg shadow-sm">
            <h2 className="text-xl mb-6 text-gray-900 font-bold">Create Store</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="createStoreName" className="block text-sm text-gray-700 mb-1">
                        Store Name
                    </label>
                    <input
                        id="createStoreName"
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Enter store name"
                        className="w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 text-gray-900"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={isCreating}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isCreating ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    {isCreating ? 'Creating...' : 'Create Store'}
                </button>
            </form>
            {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>
    )
}