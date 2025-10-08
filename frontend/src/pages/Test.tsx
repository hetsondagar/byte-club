import React from 'react';
import { config } from '@/config/env';

export default function Test() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-green-400 font-mono">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🔧 Byte Club Test Page</h1>
        <p className="text-lg mb-4">Frontend is working!</p>
        
        <div className="bg-gray-900 p-4 rounded border border-green-400">
          <h2 className="text-xl mb-2">Configuration:</h2>
          <p>API Base URL: {config.apiBaseUrl}</p>
          <p>Environment: {config.environment}</p>
          <p>App Name: {config.appName}</p>
          <p>Debug Logs: {config.enableDebugLogs ? 'Enabled' : 'Disabled'}</p>
        </div>
        
        <div className="mt-4">
          <a 
            href="/" 
            className="text-green-400 hover:text-green-300 underline"
          >
            ← Go to Login
          </a>
        </div>
      </div>
    </div>
  );
}
