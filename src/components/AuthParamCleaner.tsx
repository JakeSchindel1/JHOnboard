"use client"

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

/**
 * Client-side component to handle cleaning up authentication query parameters
 * This replaces the functionality that was previously in middleware.ts
 * Can be added to layout.tsx or specific pages that need authentication
 */
export default function AuthParamCleaner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    // Check if we have authentication query parameters to clean up
    const hasAuthCode = searchParams.has('code');
    
    if (hasAuthCode) {
      console.log('Cleaning up auth redirect parameters');
      
      // Create a new URL without the code parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('code');
      
      // Replace the current URL without the code parameter
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams, pathname]);

  // This component doesn't render anything
  return null;
} 