# Quick Supabase Setup Checklist

## ✅ Already Done

- ✅ Supabase client installed (`@supabase/supabase-js`)
- ✅ Client configured in `src/integrations/supabase/client.ts`
- ✅ `.env.local` file created with your credentials

## 🚀 Next Steps

### 1. Test Locally

```bash
# Restart your dev server
npm run dev
```

**Check:**
- Browser console should NOT show: `⚠️ Supabase environment variables are missing!`
- App should load normally
- Supabase features should work

### 2. Set Environment Variables in Vercel

1. Go to: https://vercel.com/dashboard
2. Select project: `heady-nextjs2`
3. Settings → Environment Variables
4. Add these two variables:

   **Variable 1:**
   - Key: `VITE_SUPABASE_URL`
   - Value: `https://xpqwujjglvhadlgxotcv.supabase.co`
   - Environment: Production (and Preview/Development)

   **Variable 2:**
   - Key: `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwcXd1ampnbHZoYWRsZ3hvdGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDQ1OTgsImV4cCI6MjA3NDc4MDU5OH0.MCiLDMiTqXXzHuJ1B9s-yd1gCjrZHlV33H4oMg6wP-s`
   - Environment: Production (and Preview/Development)

5. **Redeploy** your project

### 3. Verify

- ✅ Production app loads without white screen
- ✅ No Supabase errors in browser console
- ✅ Database queries work

---

## 📝 Important Notes

**This is a Vite project (NOT Next.js):**
- ✅ Use `VITE_` prefix (not `NEXT_PUBLIC_`)
- ✅ No `@supabase/ssr` needed
- ✅ Client-side only

**Environment Variables:**
- Local: `.env.local` (already created)
- Production: Set in Vercel Dashboard

---

## 🐛 If Something's Wrong

1. **White screen?** → Check Vercel env vars are set
2. **Console errors?** → Check env var names match exactly
3. **Database not working?** → Check RLS policies in Supabase Dashboard

See `SUPABASE_SETUP.md` for detailed troubleshooting.

