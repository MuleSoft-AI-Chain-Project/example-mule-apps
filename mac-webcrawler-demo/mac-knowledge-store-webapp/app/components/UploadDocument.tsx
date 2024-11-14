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
        <div className={`flex flex-col h-full ${className}`}>
            <h2 className="text-xl font-bold text-gray-700 mb-6">Add Knowledge</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="storeSelect" className="text-sm font-medium text-gray-600">
                            Store
                        </label>
                        <select
                            id="storeSelect"
                            value={selectedStore}
                            onChange={(e) => setSelectedStore(e.target.value)}
                            className="mt-1 w-full px-3 py-1.5 text-sm border rounded-md"
                            required
                        >
                            <option value="">Select store</option>
                            {storeNames.map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="fileType" className="text-sm font-medium  text-gray-600">
                            File Type
                        </label>
                        <select
                            id="fileType"
                            value={fileType}
                            onChange={(e) => setFileType(e.target.value)}
                            className="mt-1 w-full px-3 py-1.5 text-sm border rounded-md"
                        >
                            <option value="text">Text</option>
                            <option value="PDF">PDF</option>
                        </select>
                    </div>
                </div>

                <div
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer 
                        ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
                >
                    {file ? (
                        <p className="text-sm text-gray-700">File: {file.name}</p>
                    ) : (
                        <p className="text-sm text-gray-500">Drop file here or click to select</p>
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
                    className={`w-full py-1.5 px-4 text-sm font-medium text-white 
                        bg-indigo-600 hover:bg-indigo-700 rounded-md 
                        ${isUploading || !file ? 'opacity-50' : ''}`}
                >
                    {isUploading ? 'Uploading...' : 'Upload Document'}
                </button>
            </form>
            <div className="flex-1" />
            {message && <p className="text-xs text-green-600">{message}</p>}
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    )
}