# Supabase Setup Guide for Vite + React

## ✅ Project Status

Your project is already configured for Supabase! Here's what's set up:

- ✅ `@supabase/supabase-js` is installed
- ✅ Supabase client is configured in `src/integrations/supabase/client.ts`
- ✅ Environment variables are set up for Vite (uses `VITE_` prefix, not `NEXT_PUBLIC_`)

---

## 🔧 Step 1: Local Development Setup

### Create `.env.local` file

I've created a `.env.local` file in your project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://xpqwujjglvhadlgxotcv.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwcXd1ampnbHZoYWRsZ3hvdGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDQ1OTgsImV4cCI6MjA3NDc4MDU5OH0.MCiLDMiTqXXzHuJ1B9s-yd1gCjrZHlV33H4oMg6wP-s
```

**Note:** The `.env.local` file is already in `.gitignore`, so it won't be committed to Git.

### Test Local Development

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Check the browser console:**
   - You should NOT see: `⚠️ Supabase environment variables are missing!`
   - The app should load normally
   - Supabase features should work

---

## 🚀 Step 2: Vercel Production Setup

### Set Environment Variables in Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project: `heady-nextjs2`

2. **Navigate to Settings:**
   - Click **Settings** → **Environment Variables**

3. **Add these variables for Production:**
   - Click **Add New**
   - **Key:** `VITE_SUPABASE_URL`
   - **Value:** `https://xpqwujjglvhadlgxotcv.supabase.co`
   - **Environment:** Select **Production** (and Preview/Development if needed)
   - Click **Save**

   - Click **Add New** again
   - **Key:** `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwcXd1ampnbHZoYWRsZ3hvdGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDQ1OTgsImV4cCI6MjA3NDc4MDU5OH0.MCiLDMiTqXXzHuJ1B9s-yd1gCjrZHlV33H4oMg6wP-s`
   - **Environment:** Select **Production** (and Preview/Development if needed)
   - Click **Save**

4. **Redeploy:**
   - Go to **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger automatic deployment

---

## 📊 Step 3: Verify Supabase Connection

### Test in Browser Console

1. **Open your app** (local or production)
2. **Open DevTools** (F12)
3. **Go to Console tab**
4. **Run this command:**
   ```javascript
   // Import supabase (if using in console)
   // Or check if it's working by looking at network requests
   ```

5. **Check Network tab:**
   - Look for requests to `supabase.co`
   - Should see successful API calls (status 200)

### Test Database Queries

Your app already has hooks that use Supabase. Test them:

- **Now Playing:** Should fetch from `transmissions` table
- **Hot Songs:** Should fetch from `transmissions` table
- **User Auth:** Should work if you have auth set up

---

## 🗄️ Step 4: Database Tables Available

Your Supabase project has these tables:

| Table | Purpose |
|-------|---------|
| `transmissions` | Song play history (artist, title, album, album_art_url, play_started_at) |
| `profiles` | User profiles (id, username, display_name, avatar_url) |
| `saved_songs` | User's saved songs (requires auth) |
| `chat_rooms` | Chat room definitions |
| `chat_messages` | Chat messages |
| `direct_messages` | Private DMs between users |
| `shows` | Scheduled shows/events |
| `mixtapes` | Mixtape content |
| `notifications` | User notifications |
| `live_chat_messages` | Live chat (public chat room) |

---

## 🔌 Step 5: Using Supabase in Your Code

### Import the Client

```typescript
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';

// Check if Supabase is configured before using
if (isSupabaseConfigured) {
  // Use supabase client
  const { data, error } = await supabase
    .from('transmissions')
    .select('*')
    .limit(10);
}
```

### Example Queries

**Fetch Recent Transmissions:**
```typescript
const { data: transmissions, error } = await supabase
  .from('transmissions')
  .select('*')
  .order('play_started_at', { ascending: false })
  .limit(50);
```

**Fetch Now Playing (Latest):**
```typescript
const { data: nowPlaying } = await supabase
  .from('transmissions')
  .select('*')
  .order('play_started_at', { ascending: false })
  .limit(1)
  .single();
```

**Fetch User Profile:**
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

### Edge Functions

Your project has several Edge Functions. Call them like this:

```typescript
const { data, error } = await supabase.functions.invoke('fetch-genius-data', {
  body: { artist: 'Phish', title: 'Tweezer' }
});
```

**Available Edge Functions:**
- `get-now-playing` - Get current song playing
- `album-art` - Fetch album artwork
- `fetch-genius-data` - Get Genius song data
- `fetch-lastfm-artist` - Get Last.fm artist info
- `log-transmission` - Log new song plays
- `find-concerts` - Find upcoming concerts
- `create-donation-checkout` - Create donation checkout
- `post-guest-message` - Post guest message
- `update-playlist` - Update playlist

---

## 🔐 Step 6: Authentication (Optional)

If you need authentication, your Supabase client is already configured for it:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

**Auth Redirect URLs:**
- Add your Vercel domain to allowed redirect URLs in Supabase Dashboard
- Go to: Authentication → URL Configuration → Redirect URLs

---

## ⚠️ Important Notes

### Vite vs Next.js

**This is a Vite project, NOT Next.js!**

- ✅ Use `VITE_` prefix for environment variables (not `NEXT_PUBLIC_`)
- ✅ Client-side only (no server-side rendering)
- ✅ No need for `@supabase/ssr` package
- ✅ No middleware needed

### Row Level Security (RLS)

Most tables have RLS enabled:
- **Public tables** (transmissions, shows, profiles): Read access for everyone
- **User tables** (saved_songs, direct_messages): Require authentication

### Realtime (Optional)

If you need real-time updates:

```typescript
const channel = supabase
  .channel('transmissions')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'transmissions' },
    (payload) => console.log('New transmission:', payload)
  )
  .subscribe();
```

---

## ✅ Verification Checklist

- [ ] `.env.local` file created with correct values
- [ ] Local dev server runs without Supabase errors
- [ ] Environment variables set in Vercel Dashboard
- [ ] Vercel deployment successful
- [ ] Production app loads without white screen
- [ ] Browser console shows no Supabase errors
- [ ] Database queries work (check Network tab)

---

## 🐛 Troubleshooting

### White Screen After Deployment

1. **Check Vercel Environment Variables:**
   - Make sure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set
   - Make sure they're set for **Production** environment

2. **Check Browser Console:**
   - Look for: `⚠️ Supabase environment variables are missing!`
   - If you see this, env vars aren't set correctly in Vercel

3. **Redeploy:**
   - After setting env vars, trigger a new deployment

### "Supabase environment variables are missing" Warning

- **Local:** Check `.env.local` file exists and has correct values
- **Production:** Check Vercel Dashboard → Environment Variables

### Database Queries Failing

- Check RLS policies in Supabase Dashboard
- Verify table names match exactly
- Check browser console for specific error messages

---

## 📚 Additional Resources

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 🎉 You're All Set!

Your Supabase connection is now configured. The app should work both locally and in production!

