'use client';

import { useEffect } from 'react';
import { clickTracker } from '@/lib/click-tracker';

export function ClickTrackingProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize the click tracker
    clickTracker.init();
    
    // Flush any pending events when the page is about to unload
    const handleBeforeUnload = () => {
      // Use synchronous flush for page unload
      clickTracker.flush();
    };
    
    // Also flush on visibility change (mobile browser optimization)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        clickTracker.flush();
      }
    };
    
    // Handle page freeze (mobile Safari, Chrome mobile)
    const handlePageFreeze = () => {
      clickTracker.flush();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('freeze', handlePageFreeze);
    document.addEventListener('pagehide', handlePageFreeze);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('freeze', handlePageFreeze);
      document.removeEventListener('pagehide', handlePageFreeze);
      clickTracker.destroy();
    };
  }, []);
  
  return <>{children}</>;
}