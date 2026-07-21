/**
 * API Configuration
 * 
 * Reads from .env.local file
 * Switch between local and CloudHub by editing .env.local
 */

export const API_CONFIG = {
  // Reads from VITE_API_BASE_URL in .env.local
  // Defaults to empty string (same origin) if not set
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  
  endpoints: {
    createStore: '/store',
    getStore: '/getstores',
    uploadDocument: '/doc',
    crawlWebsite: '/crawl',
    queryStore: '/query',
    uploadAudio: '/upload-audio',
    getTools: '/tools',
    addTools: '/tools',
    tokenUsage: '/token-usage'
  }
};

// Helper function to build full API URL
export const getApiUrl = (endpoint) => {
  return API_CONFIG.baseURL + API_CONFIG.endpoints[endpoint];
};
