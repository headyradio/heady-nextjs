# Quick Start: Deploy to Vercel

## 🚀 Fastest Way to Deploy

### Step 1: Get Your Environment Variables

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project → **Settings** → **API**
3. Copy:
   - **Project URL** → This is your `VITE_SUPABASE_URL`
   - **anon public** key → This is your `VITE_SUPABASE_PUBLISHABLE_KEY`

### Step 2: Deploy to Vercel

**Option A: Via Vercel CLI (2 minutes)**
```bash
npm install -g vercel
vercel login
vercel --prod
```
When prompted, add your environment variables.

**Option B: Via GitHub (Recommended)**
1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Ready for Vercel"
   git remote add origin https://github.com/yourusername/heady-fm.git
   git push -u origin main
   ```

2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Add environment variables:
   - `VITE_SUPABASE_URL` = (from Step 1)
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = (from Step 1)
5. Click **Deploy**

### Step 3: Deploy Supabase Edge Functions

```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
supabase functions deploy get-now-playing
# Deploy other functions as needed
```

---

## ✅ That's It!

Your site will be live at `https://your-project.vercel.app`

---

## 📋 Files Ready for Deployment

✅ `vercel.json` - Vercel configuration  
✅ `package.json` - Build scripts configured  
✅ `.gitignore` - Environment files excluded  
✅ Build tested and working  

---

## 🔧 Need Help?

- **Full Guide**: See `VERCEL_DEPLOYMENT.md`
- **Checklist**: See `DEPLOYMENT_CHECKLIST.md`
- **Vercel Docs**: https://vercel.com/docs

