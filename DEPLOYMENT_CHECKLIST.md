# Vercel Deployment Checklist

## ✅ Pre-Deployment Steps

### 1. Environment Variables

**Set these in Vercel Dashboard → Project Settings → Environment Variables:**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
```

**How to find:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project → Settings → API
3. Copy "Project URL" and "anon public" key

### 2. Supabase Edge Functions

**Deploy all Edge Functions:**

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy get-now-playing
supabase functions deploy fetch-genius-data
supabase functions deploy fetch-lastfm-artist
supabase functions deploy generate-song-content
supabase functions deploy log-transmission
supabase functions deploy album-art
supabase functions deploy lastfm-album-art
supabase functions deploy create-donation-checkout
supabase functions deploy find-concerts
supabase functions deploy post-guest-message
supabase functions deploy update-playlist
```

### 3. Test Build Locally

```bash
# Test that build works
npm run build

# Test preview
npm run preview
```

---

## 🚀 Deployment Options

### Option A: Vercel CLI (Quickest)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Option B: GitHub Integration (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   git remote add origin https://github.com/yourusername/heady-fm.git
   git push -u origin main
   ```

2. **Connect in Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

---

## 📋 Files Created for Deployment

✅ `vercel.json` - Vercel configuration  
✅ `.env.example` - Environment variable template  
✅ `VERCEL_DEPLOYMENT.md` - Complete deployment guide  
✅ `.gitignore` - Updated to exclude .env files  

---

## ⚠️ Important Notes

1. **Environment Variables**: Must be set in Vercel Dashboard (not in code)
2. **Edge Functions**: Deploy separately via Supabase CLI
3. **Build Output**: Goes to `dist/` directory
4. **SPA Routing**: `vercel.json` handles client-side routing

---

## 🧪 Post-Deployment Testing

1. ✅ Site loads
2. ✅ Audio stream plays
3. ✅ Navigation works
4. ✅ Song pages load
5. ✅ Artist pages load
6. ✅ No console errors

---

## 📚 Full Documentation

See `VERCEL_DEPLOYMENT.md` for complete deployment guide.

