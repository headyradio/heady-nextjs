import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { getInitialNowPlaying } from "./lib/getInitialNowPlaying";

// Fetch initial "Now Playing" data before React renders
// This provides immediate data on first load (SSR-like behavior)
async function init() {
  try {
    // Check if data was already injected by the script tag
    const windowData = (window as any).__INITIAL_NOW_PLAYING__;
    
    if (!windowData) {
      // If not injected, fetch it now (before React renders)
      // This is still faster than fetching after mount
      try {
        const initialData = await getInitialNowPlaying();
        (window as any).__INITIAL_NOW_PLAYING__ = initialData;
      } catch (error) {
        console.debug('Failed to fetch initial now playing data:', error);
        // Continue anyway - React will fetch on mount
      }
    }
  } catch (error) {
    console.error('Error during initialization:', error);
    // Continue to render React even if initialization fails
  }
  
  // Ensure root element exists before rendering
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error('Root element not found!');
    return;
  }
  
  // Now render React - it will have initial data available
  try {
    createRoot(rootElement).render(<App />);
  } catch (error) {
    console.error('Failed to render React app:', error);
  }
}

// Ensure init runs even if there's an error
init().catch((error) => {
  console.error('Fatal error during app initialization:', error);
  // Try to render anyway
  const rootElement = document.getElementById("root");
  if (rootElement) {
    try {
      createRoot(rootElement).render(<App />);
    } catch (renderError) {
      console.error('Failed to render React app after error:', renderError);
    }
  }
});
