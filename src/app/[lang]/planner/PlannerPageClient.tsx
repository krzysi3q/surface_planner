'use client';

import DynamicPlanner from "@/components/DynamicPlanner";
import { I18nProvider } from "@/components/I18nProvider";
import { useEffect } from "react";

export default function PlannerClient({ lang }: { lang: string }) {
  // Prevent pull-to-refresh and page zoom on this page
  useEffect(() => {
    // Add meta viewport with user-scalable=no to prevent pinch zoom
    const viewport = document.querySelector('meta[name="viewport"]');
    let originalContent = '';
    
    if (viewport) {
      originalContent = viewport.getAttribute('content') || '';
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }
    
    // Handle dynamic viewport changes on mobile browsers
    const handleViewportChange = () => {
      // Force a resize event to update the planner dimensions
      window.dispatchEvent(new Event('resize'));
    };
    
    // Listen for viewport changes (when browser chrome shows/hides)
    const visualViewport = window.visualViewport;
    if (visualViewport) {
      visualViewport.addEventListener('resize', handleViewportChange);
    }
    
    // Prevent default touch behaviors on document
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    const preventPullToRefresh = (e: TouchEvent) => {
      // Prevent pull-to-refresh when at the top of the page
      if (window.scrollY === 0) {
        e.preventDefault();
      }
    };
    
    // Add event listeners
    document.addEventListener('touchstart', preventZoom, { passive: false });
    document.addEventListener('touchmove', preventPullToRefresh, { passive: false });
    
    // Cleanup on unmount
    return () => {
      if (viewport && originalContent) {
        viewport.setAttribute('content', originalContent);
      }
      if (visualViewport) {
        visualViewport.removeEventListener('resize', handleViewportChange);
      }
      document.removeEventListener('touchstart', preventZoom);
      document.removeEventListener('touchmove', preventPullToRefresh);
    };
  }, []);

  return (
    <I18nProvider initialLanguage={lang}>
      <section id="planner" className="planner-page">
          <DynamicPlanner />
      </section>
    </I18nProvider>
  );
}
 