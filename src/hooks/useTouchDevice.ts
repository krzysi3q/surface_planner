import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current device supports touch input
 * @returns boolean indicating if the device has touch capability
 */
export function useTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      // Check for touch support using multiple methods for better compatibility
      const hasTouchSupport = 
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - legacy property
        navigator.msMaxTouchPoints > 0;

      // Additional check for mobile user agent patterns
      const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      setIsTouchDevice(hasTouchSupport || mobileUserAgent);
    };

    checkTouchDevice();
  }, []);

  return isTouchDevice;
}
