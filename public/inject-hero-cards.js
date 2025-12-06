/**
 * This script fetches Hero Cards data before React loads
 * and injects it into the window object for immediate use.
 * 
 * This provides SSR-like behavior for hero cards.
 */

(function() {
  'use strict';
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return;
  }
  
  // Try to get Supabase URL from meta tag (injected by build process)
  const supabaseUrl = document.querySelector('meta[name="supabase-url"]')?.getAttribute('content');
  const supabaseKey = document.querySelector('meta[name="supabase-key"]')?.getAttribute('content');
  
  if (!supabaseUrl || !supabaseKey) {
    // If not found, the hook will fetch on mount - that's okay
    return;
  }
  
  // Fetch initial data asynchronously (non-blocking)
  // This runs before React hydration but doesn't block page load
  fetch(`${supabaseUrl}/functions/v1/get-hero-cards`, {
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
      window.__INITIAL_HERO_CARDS__ = data;
    })
    .catch(error => {
      // Silently fail - React will fetch on mount
      console.debug('Initial hero cards fetch failed, will fetch on mount:', error);
    });
})();

