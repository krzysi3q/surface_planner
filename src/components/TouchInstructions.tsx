'use client';

import React, { useState, useEffect } from 'react';
import { X, Hand, MousePointer } from 'lucide-react';
import { useTouchDevice } from '@/hooks/useTouchDevice';

interface TouchInstructionsProps {
  className?: string;
}

export const TouchInstructions: React.FC<TouchInstructionsProps> = ({ className = '' }) => {
  const isTouchDevice = useTouchDevice();
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    // Only show on touch devices and only once
    if (isTouchDevice && !hasBeenShown) {
      const hasSeenInstructions = localStorage.getItem('touchInstructionsSeen');
      if (!hasSeenInstructions) {
        setIsVisible(true);
      }
    }
  }, [isTouchDevice, hasBeenShown]);

  const handleClose = () => {
    setIsVisible(false);
    setHasBeenShown(true);
    localStorage.setItem('touchInstructionsSeen', 'true');
  };

  if (!isTouchDevice || !isVisible) {
    return null;
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Touch Controls
          </h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4 text-sm text-gray-600">
          <div className="bg-green-50 p-3 rounded-md mb-4">
            <div className="font-medium text-green-800 mb-1">✨ Touch Support Now Available!</div>
            <div className="text-green-700 text-xs">
              The floor planner now fully supports touch devices. All interactive elements have been optimized for touch input.
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <MousePointer className="w-5 h-5 mt-0.5 text-blue-500 flex-shrink-0" />
            <div>
              <div className="font-medium text-gray-800">Tap to Interact</div>
              <div>Tap walls and corners to edit them, tap tools to select modes</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-500 rounded-full"></div>
              <div className="w-3 h-3 border-2 border-blue-500 rounded-full ml-1"></div>
            </div>
            <div>
              <div className="font-medium text-gray-800">Complete Wall Drawing</div>
              <div>Tap near the starting point (green circle) to close the shape, or double tap after 4+ points</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Hand className="w-5 h-5 mt-0.5 text-blue-500 flex-shrink-0" />
            <div>
              <div className="font-medium text-gray-800">Drag</div>
              <div>Move corners, walls, or pan in preview mode</div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md mt-4">
            <div className="font-medium text-blue-800 mb-1">Tips</div>
            <ul className="text-blue-700 text-xs space-y-1">
              <li>• Use two fingers to zoom in/out on the canvas</li>
              <li>• Buttons are larger for easier touch interaction</li>
              <li>• Tap near the starting point to close wall drawing</li>
              <li>• Switch to Preview mode to pan around large designs</li>
            </ul>
          </div>
        </div>
        
        <button 
          onClick={handleClose}
          className="w-full mt-6 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};
