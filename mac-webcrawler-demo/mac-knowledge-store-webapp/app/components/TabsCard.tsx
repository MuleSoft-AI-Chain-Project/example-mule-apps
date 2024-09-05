'use client';

import React, { useState } from 'react';
import CrawlWebsite from './CrawlWebsite';
import UploadDocument from './UploadDocument';

interface TabsCardProps {
  storeNames: string[];
  onStoreCreated: (name: string) => void;
}

export default function TabsCard({ storeNames, onStoreCreated }: TabsCardProps) {
  const [activeTab, setActiveTab] = useState('crawl');

  return (
    <div className="bg-white p-6 border-2 rounded-lg shadow-sm">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('crawl')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'crawl'
              ? 'text-white bg-indigo-600'
              : 'text-indigo-600 bg-gray-100'
          } rounded-md`}
        >
          Crawl Website
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'upload'
              ? 'text-white bg-indigo-600'
              : 'text-indigo-600 bg-gray-100'
          } rounded-md`}
        >
          Upload Document
        </button>
      </div>

      <div>
        {activeTab === 'crawl' && (
          <CrawlWebsite storeNames={storeNames} onStoreCreated={onStoreCreated} />
        )}
        {activeTab === 'upload' && <UploadDocument storeNames={storeNames} />}
      </div>
    </div>
  );
}
