# White Screen Debugging Guide

## 🔍 Project Analysis

**Project Type:** Vite + React SPA (NOT Next.js)
- Framework: Vite 5.4.19
- React: 18.3.1
- Router: React Router v6 (client-side routing)
- Deployment: Vercel

## 🚨 Critical Issues Found

### 1. **Missing Environment Variables** (HIGH PRIORITY)
The Supabase client is initialized with potentially `undefined` values if env vars are missing:

```typescript
// src/integrations/supabase/client.ts
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL; // Could be undefined!
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY; // Could be undefined!

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {...});
```

**Impact:** If env vars are missing, `createClient(undefined, undefined)` will throw an error, preventing React from rendering.

### 2. **Script Loading Order Issue**
The `inject-now-playing.js` script runs before React, but if it fails or if meta tags are missing, it could cause issues.

### 3. **Async Initialization in main.tsx**
The async `init()` function could fail silently, preventing React from rendering.

---

## 📋 Step-by-Step Debugging Plan

### Step 1: Check Browser Console

1. **Open DevTools:**
   - Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Go to **Console** tab

2. **Look for these errors:**
   - ❌ `Uncaught TypeError: Cannot read property 'createClient' of undefined`
   - ❌ `Failed to fetch initial now playing data`
   - ❌ `Supabase environment variables not configured`
   - ❌ `Failed to render React app`
   - ❌ Any red error messages

3. **Take a screenshot** of all console errors

### Step 2: Check Network Tab

1. **Open Network tab** in DevTools
2. **Reload the page** (Cmd+R / Ctrl+R)
3. **Check for failed requests:**
   - Look for red/failed requests
   - Check if `/assets/index-*.js` loads (status 200)
   - Check if `/inject-now-playing.js` loads (status 200)
   - Check if Supabase Edge Function calls fail

4. **Check response headers:**
   - Click on `index.html`
   - Check if it's being served correctly (status 200)
   - Check Content-Type: should be `text/html`

### Step 3: Check Vercel Deployment Logs

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project: `heady-nextjs2`

2. **Check Latest Deployment:**
   - Click on the latest deployment
   - Go to **"Build Logs"** tab
   - Look for:
     - ❌ Build errors
     - ❌ Missing environment variables warnings
     - ❌ Failed build steps

3. **Check Environment Variables:**
   - Go to **Settings** → **Environment Variables**
   - Verify these are set:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **Important:** Make sure they're set for **Production** environment

4. **Check Function Logs:**
   - Go to **Functions** tab
   - Check if Edge Functions are being called
   - Look for errors in function logs

### Step 4: Check HTML Source

1. **View Page Source:**
   - Right-click → "View Page Source"
   - Or press `Cmd+Option+U` / `Ctrl+U`

2. **Look for:**
   - ✅ `<div id="root"></div>` exists
   - ✅ `<script src="/inject-now-playing.js"></script>` exists
   - ✅ `<script type="module" src="/assets/index-*.js"></script>` exists
   - ✅ Meta tags for Supabase (if env vars were set during build):
     ```html
     <meta name="supabase-url" content="..." />
     <meta name="supabase-key" content="..." />
     ```

3. **If meta tags are missing:**
   - Environment variables weren't available during build
   - This is OK - the app should still work, but initial data fetch will fail

---

## 🔧 Hypothesis List

### Most Likely Causes (in order):

1. **Missing Environment Variables** (90% likely)
   - `VITE_SUPABASE_URL` or `VITE_SUPABASE_PUBLISHABLE_KEY` not set in Vercel
   - Supabase client fails to initialize
   - React app crashes before rendering

2. **Supabase Client Initialization Error** (80% likely)
   - Client created with `undefined` values
   - Error thrown during module import
   - Prevents React from mounting

3. **Build Output Not Served Correctly** (30% likely)
   - Vercel not serving `dist/` folder
   - Assets not loading (404 errors)
   - Check `vercel.json` configuration

4. **Script Loading Order Issue** (20% likely)
   - `inject-now-playing.js` blocking React
   - Async initialization failing
   - Check `main.tsx` error handling

5. **React Router Base Path Issue** (10% likely)
   - Incorrect base path configuration
   - Routes not matching
   - Check `BrowserRouter` configuration

---

## 🛠️ Fixes to Apply

See the code changes below for fixes to:
1. Add error handling to Supabase client initialization
2. Improve error handling in `main.tsx`
3. Add fallback for missing environment variables
4. Ensure React always renders, even if initialization fails

---

## 📊 What to Report Back

After checking the above, report:
1. **Console errors** (copy/paste all red errors)
2. **Network tab** - which requests failed (if any)
3. **Vercel build logs** - any build errors
4. **Environment variables** - are they set? (don't share the values!)
5. **HTML source** - are meta tags present?

This will help narrow down the exact issue.

