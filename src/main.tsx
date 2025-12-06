import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { getInitialNowPlaying } from "./lib/getInitialNowPlaying";

// Fetch initial "Now Playing" data before React renders
// This provides immediate data on first load (SSR-like behavior)
async function init() {
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
  
  // Now render React - it will have initial data available
  createRoot(document.getElementById("root")!).render(<App />);
}

init();
