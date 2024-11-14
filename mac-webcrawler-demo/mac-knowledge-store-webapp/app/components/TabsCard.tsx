'use client';

import React, { useState } from 'react';
import CrawlWebsite from './CrawlWebsite';
import UploadDocument from './UploadDocument';

interface TabsCardProps {
  storeNames: string[];
  onStoreCreated: (name: string) => void;
  className?: string;
}

export default function TabsCard({ storeNames, onStoreCreated, className = '' }: TabsCardProps) {
  const [activeTab, setActiveTab] = useState('crawl');

  return (
    <div className={`bg-white border-2 rounded-lg shadow-sm flex flex-col ${className}`}>
      <div className="flex border-b flex-none">
        <button
          onClick={() => setActiveTab('crawl')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'crawl'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Crawl Website
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'upload'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Upload Document
        </button>
      </div>

      <div className="flex-1 p-6">
        <div className={activeTab === 'crawl' ? 'block' : 'hidden'}>
          <CrawlWebsite storeNames={storeNames} onStoreCreated={onStoreCreated} />
        </div>
        <div className={activeTab === 'upload' ? 'block' : 'hidden'}>
          <UploadDocument storeNames={storeNames} />
        </div>
      </div>
    </div>
  );
}
