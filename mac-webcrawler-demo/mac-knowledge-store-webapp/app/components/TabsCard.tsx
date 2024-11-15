'use client';

import React, { useState } from 'react';
import CrawlWebsite from './CrawlWebsite';
import UploadDocument from './UploadDocument';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

interface TabsCardProps {
  storeNames: string[];
  onStoreCreated: (name: string) => void;
  className?: string;
}

export default function TabsCard({ storeNames, onStoreCreated, className = '' }: TabsCardProps) {
  const [activeTab, setActiveTab] = useState('crawl');

  return (
    <div className={`bg-[#151929] rounded-2xl flex flex-col ${className}`}>
      <div className="px-6 pt-6 pb-3">
        <h2 className="text-xl text-white font-medium flex items-center gap-3">
          <GlobeAltIcon className="h-5 w-5 text-gray-400" />
          Add Knowledge
        </h2>
      </div>

      <div className="flex">
        <button
          onClick={() => setActiveTab('crawl')}
          className={`flex-1 px-4 py-2 text-base transition-colors duration-200 ${
            activeTab === 'crawl'
              ? 'text-blue-400 bg-[#151929] border-b-2 border-blue-500'
              : 'text-gray-500 bg-[#1C1F2E] hover:text-gray-400'
          }`}
        >
          Crawl Website
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 px-4 py-2 text-base transition-colors duration-200 ${
            activeTab === 'upload'
              ? 'text-blue-400 bg-[#151929] border-b-2 border-blue-500'
              : 'text-gray-500 bg-[#1C1F2E] hover:text-gray-400'
          }`}
        >
          Upload Docs
        </button>
      </div>

      <div className="p-6">
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
