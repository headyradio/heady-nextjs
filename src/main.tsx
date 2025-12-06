import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { getInitialNowPlaying } from "./lib/getInitialNowPlaying";

// Fetch initial "Now Playing" data before React renders
// This provides immediate data on first load (SSR-like behavior)
async function init() {
  // Ensure root element exists before doing anything
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error('❌ Root element not found! Cannot render app.');
    return;
  }

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
  
  // Now render React - it will have initial data available
  try {
    createRoot(rootElement).render(<App />);
  } catch (error) {
    console.error('❌ Failed to render React app:', error);
    // Show error message to user
    rootElement.innerHTML = `
      <div style="padding: 2rem; font-family: system-ui; text-align: center;">
        <h1>⚠️ Application Error</h1>
        <p>Failed to load the application. Please refresh the page.</p>
        <p style="color: #666; font-size: 0.9rem; margin-top: 1rem;">
          Error: ${error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `;
  }
}

// Ensure init runs even if there's an error
init().catch((error) => {
  console.error('❌ Fatal error during app initialization:', error);
  // Try to render anyway
  const rootElement = document.getElementById("root");
  if (rootElement) {
    try {
      createRoot(rootElement).render(<App />);
    } catch (renderError) {
      console.error('❌ Failed to render React app after error:', renderError);
      // Show error message
      rootElement.innerHTML = `
        <div style="padding: 2rem; font-family: system-ui; text-align: center;">
          <h1>⚠️ Application Error</h1>
          <p>Failed to load the application. Please check the console for details.</p>
          <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; cursor: pointer;">
            Reload Page
          </button>
        </div>
      `;
    }
  }
});
