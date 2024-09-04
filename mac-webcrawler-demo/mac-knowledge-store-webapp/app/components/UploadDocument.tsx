'use client';
import React, { useState, useRef, useCallback } from 'react'

interface UploadDocumentProps {
    className?: string;
    storeNames: string[];
}

export default function UploadDocument({ className = '', storeNames }: UploadDocumentProps) {
    const [selectedStore, setSelectedStore] = useState('')
    const [fileType, setFileType] = useState('text')
    const [file, setFile] = useState<File | null>(null)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const readFileAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = error => reject(error)
            reader.readAsDataURL(file)
        })
    }

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0])
        }
    }, [])

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        setMessage('')
        setError('')
        setIsUploading(true)

        try {
            const fileContent = await readFileAsBase64(file)

            const response = await fetch('/api/upload-document', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    storeName: selectedStore,
                    fileName: file.name,
                    fileContent,
                    fileType,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setMessage(`Document ${data.status} in store "${selectedStore}"`)
                setSelectedStore('')
                setFileType('text')
                setFile(null)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                }
            } else {
                setError(`Error: ${data.error}. Details: ${data.details}`)
            }
        } catch (error) {
            setError(`Error uploading document: ${error.message}`)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className={`bg-white border-2 p-6 rounded-lg shadow-md ${className}`}>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Document</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div>
                    <label htmlFor="fileType" className="block text-sm font-medium text-gray-700 mb-1">
                        File Type
                    </label>
                    <select
                        id="fileType"
                        value={fileType}
                        onChange={(e) => setFileType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 text-gray-900"
                    >
                        <option value="text">Text</option>
                        <option value="PDF">PDF</option>
                    </select>
                </div>
                <div
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
                        }`}
                >
                    {file ? (
                        <p className="text-gray-700">File selected: {file.name}</p>
                    ) : (
                        <>
                            <p className="text-gray-700 mb-2">Drag and drop your file here, or click to select</p>
                            <p className="text-sm text-gray-500">Supported file types: Text, PDF</p>
                        </>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInput}
                        className="hidden"
                        accept=".txt,.pdf"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isUploading || !file}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isUploading || !file ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    {isUploading ? 'Uploading...' : 'Upload Document'}
                </button>
            </form>
            {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>
    )
}