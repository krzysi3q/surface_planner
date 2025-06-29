import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface TouchDeviceWarningProps {
  className?: string;
}

export const TouchDeviceWarning: React.FC<TouchDeviceWarningProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center h-full bg-gray-50 p-8 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Smartphone className="w-16 h-16 text-orange-500" />
            <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Touch Devices Not Supported
        </h2>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          This Planner currently requires a desktop or laptop computer with a mouse for precise drawing and editing operations.
        </p>
        
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
          <Monitor className="w-5 h-5" />
          <span>Please use a desktop or laptop computer</span>
        </div>
        
        <div className="text-xs text-gray-400">
          Touch device support is planned for future updates
        </div>
      </div>
    </div>
  );
};
