/**
 * This script fetches "Now Playing" data before React loads
 * and injects it into the window object for immediate use.
 * 
 * This provides SSR-like behavior in a Vite/React app.
 * 
 * Note: Supabase URL and key are injected at build time via Vite's
 * environment variable replacement in the HTML template.
 */

(function() {
  'use strict';
  
  // Only run on the homepage
  if (window.location.pathname !== '/' && window.location.pathname !== '') {
    return;
  }
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return;
  }
  
  // Try to get Supabase URL from meta tag (injected by build process)
  // Or from a global variable set by the build
  const supabaseUrl = document.querySelector('meta[name="supabase-url"]')?.getAttribute('content');
  const supabaseKey = document.querySelector('meta[name="supabase-key"]')?.getAttribute('content');
  
  if (!supabaseUrl || !supabaseKey) {
    // If not found, the hook will fetch on mount - that's okay
    return;
  }
  
  // Fetch initial data asynchronously (non-blocking)
  // This runs before React hydration but doesn't block page load
  fetch(`${supabaseUrl}/functions/v1/get-now-playing`, {
    method: 'GET',
    headers: {
      'apikey': supabaseKey,
    },
    // Use cache if available
    cache: 'default',
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Inject into window for React to pick up
      window.__INITIAL_NOW_PLAYING__ = data;
    })
    .catch(error => {
      // Silently fail - React will fetch on mount
      console.debug('Initial now playing fetch failed, will fetch on mount:', error);
    });
})();

