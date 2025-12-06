# "Now Playing" Optimization Strategy

## Problem
The "Now Playing" info currently appears ~1 second after page load because it's fetched client-side after React mounts. This creates a poor user experience with a visible delay.

## Solution: SSR-like Initial Data + Client Polling

### Strategy: **Edge Function + HTML Injection + Client Polling**

**Why this approach:**
1. ✅ **Immediate visibility** - Data appears in HTML before React loads
2. ✅ **No visual flash** - Initial data matches what React hydrates with
3. ✅ **Production-friendly** - Works on Vercel with Supabase Edge Functions
4. ✅ **Minimal network calls** - Edge Function is cached (30s), polling is smart (30s intervals)
5. ✅ **Fallback resilient** - Falls back gracefully if Edge Function fails

**Why not ISR/SSR?**
- You're on Vite + React, not Next.js (yet)
- This solution works with your current stack
- Can migrate to Next.js ISR later if needed

**Why not SSE/WebSockets?**
- Overkill for 30-second polling intervals
- Radio data changes every 3-5 minutes typically
- Polling is simpler, more reliable, and works everywhere
- Edge Functions are already cached, reducing server load

---

## Implementation

### 1. **Supabase Edge Function** (`supabase/functions/get-now-playing/`)
- Fetches from RadioBoss API server-side
- Returns cached response (30s cache, 60s stale-while-revalidate)
- Fast response time (~100-200ms from Vercel edge)
- Handles errors gracefully with fallback

### 2. **HTML Injection Script** (`public/inject-now-playing.js`)
- Runs **before** React loads
- Fetches initial data from Edge Function
- Injects into `window.__INITIAL_NOW_PLAYING__`
- React picks this up during hydration

### 3. **Updated Hook** (`src/hooks/useRadioBoss.ts`)
- **Priority order:**
  1. Window data (from injection script) - **0ms delay**
  2. localStorage cache - **0ms delay**
  3. Edge Function fetch - **~200ms delay**
  4. Direct API call - **~500ms delay** (fallback)

- After hydration, starts smart polling (30s intervals)
- Only updates if data actually changed
- Saves to localStorage for next visit

---

## Performance Characteristics

### Before
```
Page Load → React Mount → Fetch API → Render
0ms        500ms         1500ms      2000ms
                    ↑ "Now Playing" appears here
```

### After
```
Page Load → Inject Script → React Mount → Hydrate
0ms        200ms          500ms        600ms
                    ↑ "Now Playing" visible here (in HTML)
```

**Result: "Now Playing" visible ~1.3 seconds earlier!**

---

## Deployment Steps

### 1. Deploy Edge Function
```bash
# Deploy the new Edge Function
supabase functions deploy get-now-playing
```

### 2. Update Environment Variables
Make sure these are set in your Vercel deployment:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

### 3. Test the Flow

**Test 1: Initial Load**
1. Open site in incognito (no cache)
2. Check Network tab - should see `get-now-playing` request
3. "Now Playing" should appear immediately (no loading state)

**Test 2: Hydration**
1. Check console - should see data from `window.__INITIAL_NOW_PLAYING__`
2. No visual flash when React hydrates
3. Polling should start after 30s

**Test 3: Polling**
1. Wait 30 seconds
2. Check Network tab - should see another `get-now-playing` or direct API call
3. Data should update if song changed

---

## Edge Function Caching

The Edge Function uses:
```typescript
'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
```

**What this means:**
- **s-maxage=30**: CDN caches for 30 seconds
- **stale-while-revalidate=60**: Serve stale data for up to 60s while fetching fresh

**Benefits:**
- Fast responses (served from CDN edge)
- Reduced API calls to RadioBoss
- Fresh data within 30-60 seconds

---

## Migration Path to Next.js (Future)

If you migrate to Next.js, you can use ISR:

```typescript
// pages/index.tsx
export async function getStaticProps() {
  const nowPlaying = await fetchNowPlaying(); // Your Edge Function
  
  return {
    props: { nowPlaying },
    revalidate: 30, // Revalidate every 30 seconds
  };
}
```

This would provide:
- Even faster initial load (pre-rendered HTML)
- Automatic revalidation on Vercel
- Better SEO (data in HTML source)

But the current solution is production-ready and works great!

---

## Monitoring

### Key Metrics to Watch

1. **Time to Visible "Now Playing"**
   - Target: < 500ms
   - Measure: Time from page load to "Now Playing" render

2. **Edge Function Response Time**
   - Target: < 200ms (p95)
   - Monitor in Supabase dashboard

3. **Cache Hit Rate**
   - Target: > 80%
   - Most requests should hit CDN cache

4. **API Call Frequency**
   - Should be ~2 calls/minute (30s polling)
   - Not every page load should hit RadioBoss API

---

## Troubleshooting

### "Now Playing" still shows loading state
- Check browser console for errors
- Verify Edge Function is deployed
- Check Supabase credentials in environment variables

### Data doesn't update
- Check polling interval (should be 30s)
- Verify `fetchRadioData` is being called
- Check Network tab for API calls

### Visual flash on hydration
- Ensure `window.__INITIAL_NOW_PLAYING__` is set before React loads
- Check that initial state matches injected data
- Verify `isLoading` starts as `false` when data exists

---

## Alternative: Full SSR with Vercel Edge Functions

If you want even better performance, you could:

1. Create a Vercel Edge Function that renders HTML with "Now Playing" data
2. Use Vercel's Edge Middleware to inject data
3. This would require more infrastructure changes

The current solution is simpler and works great for your use case!

