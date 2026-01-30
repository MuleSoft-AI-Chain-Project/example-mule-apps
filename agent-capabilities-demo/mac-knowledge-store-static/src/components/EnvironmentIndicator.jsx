import React from 'react';

export default function EnvironmentIndicator({ isCollapsed }) {
  const baseURL = import.meta.env.VITE_API_BASE_URL || '';
  
  // Determine environment
  let envName = 'Unknown';
  let envColor = 'gray';
  let envIcon = '🌐';
  
  if (!baseURL || baseURL === '') {
    envName = 'Same Origin';
    envColor = 'blue';
    envIcon = '🔗';
  } else if (baseURL.includes('localhost') || baseURL.includes('127.0.0.1')) {
    envName = 'Local';
    envColor = 'green';
    envIcon = '💻';
  } else if (baseURL.includes('cloudhub')) {
    envName = 'CloudHub';
    envColor = 'purple';
    envIcon = '☁️';
  } else {
    envName = 'Remote';
    envColor = 'orange';
    envIcon = '🌍';
  }
  
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    green: 'bg-green-500/20 text-green-300 border-green-500/40',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    orange: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    gray: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
  };
  
  if (isCollapsed) {
    // Collapsed view - just show icon
    return (
      <div 
        className={`w-full px-2 py-2 border-t border-gray-800 ${colorClasses[envColor]} text-xs font-medium flex items-center justify-center backdrop-blur-sm`}
        title={`Environment: ${envName}\nAPI Base URL: ${baseURL || 'Same origin (relative URLs)'}`}
      >
        <span className="text-lg">{envIcon}</span>
      </div>
    );
  }
  
  // Expanded view - show full details
  return (
    <div 
      className={`w-full px-3 py-2 border-t border-gray-800 ${colorClasses[envColor]} text-xs font-medium backdrop-blur-sm`}
      title={`API Base URL: ${baseURL || 'Same origin (relative URLs)'}`}
    >
      <div className="flex items-center gap-2">
        <span>{envIcon}</span>
        <span>{envName}</span>
      </div>
      {baseURL && (
        <div className="text-[10px] opacity-70 mt-1 truncate">
          {baseURL.replace('https://', '').replace('http://', '')}
        </div>
      )}
    </div>
  );
}

