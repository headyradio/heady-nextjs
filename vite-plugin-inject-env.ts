/**
 * Vite plugin to inject environment variables into HTML
 * This allows the inject-now-playing.js script to access Supabase credentials
 */

import type { Plugin } from 'vite';

export function injectEnv(): Plugin {
  return {
    name: 'inject-env',
    transformIndexHtml(html) {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY not found, skipping injection');
        return html;
      }

      // Inject meta tags before the closing </head> tag
      const metaTags = `
    <meta name="supabase-url" content="${supabaseUrl}" />
    <meta name="supabase-key" content="${supabaseKey}" />`;

      return html.replace('</head>', `${metaTags}\n  </head>`);
    },
  };
}

