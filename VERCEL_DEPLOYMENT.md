# Vercel Deployment Guide for HEADY.FM

## Pre-Deployment Checklist

### ✅ 1. Environment Variables

You need to set these in Vercel:

**Required:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon/public key

**How to find these:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_PUBLISHABLE_KEY`

### ✅ 2. Supabase Edge Functions

Your Edge Functions need to be deployed separately:

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy all Edge Functions
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

**Edge Function Environment Variables** (set in Supabase Dashboard):
- `GENIUS_API_KEY` - For Genius API integration
- `LOVABLE_API_KEY` - For AI features (if used)
- `SUPABASE_URL` - Auto-configured
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-configured

### ✅ 3. Build Configuration

Your project is already configured:
- ✅ `vercel.json` - Vercel configuration
- ✅ `package.json` - Build scripts
- ✅ `vite.config.ts` - Build optimization

---

## Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (first time - will ask questions)
vercel

# Deploy to production
vercel --prod
```

### Option 2: Deploy via GitHub (Recommended for CI/CD)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/heady-fm.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure environment variables (see below)
   - Click "Deploy"

### Option 3: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository or upload files
4. Configure settings (see below)
5. Click "Deploy"

---

## Vercel Project Settings

### Framework Preset
- **Framework Preset**: Vite
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### Environment Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `your-anon-key` | Production, Preview, Development |

**Note**: Make sure to add them for all environments (Production, Preview, Development).

---

## Post-Deployment

### 1. Verify Deployment

1. Visit your Vercel URL (e.g., `https://heady-fm.vercel.app`)
2. Check that the site loads
3. Test audio playback
4. Check browser console for errors

### 2. Configure Custom Domain (Optional)

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your domain (e.g., `heady.fm`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation

### 3. Set Up Environment Variables

Make sure all environment variables are set:
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_PUBLISHABLE_KEY`

### 4. Test Edge Functions

Verify Edge Functions are accessible:
```bash
curl https://your-project.supabase.co/functions/v1/get-now-playing \
  -H "apikey: your-anon-key"
```

---

## Troubleshooting

### Build Fails

**Error**: "Environment variable not found"
- **Fix**: Add missing environment variables in Vercel Dashboard

**Error**: "Module not found"
- **Fix**: Run `npm install` locally to verify dependencies
- **Fix**: Check `package.json` for missing dependencies

**Error**: "Build timeout"
- **Fix**: Vercel has a 45-minute timeout (shouldn't be an issue for this project)

### Site Loads But Audio Doesn't Work

**Check:**
1. Environment variables are set correctly
2. Supabase Edge Functions are deployed
3. Browser console for CORS errors
4. Network tab for failed requests

### 404 Errors on Routes

**Fix**: The `vercel.json` rewrite rule should handle this. If not:
- Check that `vercel.json` is in the root
- Verify rewrite rule is correct
- Clear Vercel cache and redeploy

---

## Performance Optimization

### Already Configured

✅ **Code Splitting** - Vendor chunks separated  
✅ **Asset Optimization** - Images, fonts optimized  
✅ **Caching Headers** - Static assets cached for 1 year  
✅ **Build Optimization** - Minified, tree-shaken  

### Vercel-Specific Optimizations

Vercel automatically provides:
- ✅ Global CDN
- ✅ Edge Network
- ✅ Automatic HTTPS
- ✅ DDoS Protection
- ✅ Analytics (if enabled)

---

## Continuous Deployment

### Automatic Deployments

If connected to GitHub:
- **Production**: Deploys on push to `main` branch
- **Preview**: Deploys on pull requests
- **Development**: Deploys on push to other branches

### Manual Deployments

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel
```

---

## Monitoring

### Vercel Analytics

1. Go to Vercel Dashboard → Project → Analytics
2. Enable Web Analytics (if desired)
3. Monitor performance metrics

### Error Tracking

- Check Vercel Dashboard → Project → Logs
- Monitor browser console errors
- Set up error tracking (Sentry, etc.) if needed

---

## Environment-Specific Configuration

### Production
- Use production Supabase project
- Production environment variables
- Custom domain (if configured)

### Preview
- Same as production (or separate Supabase project)
- Preview URLs for testing
- Automatic on pull requests

### Development
- Local development
- `.env.local` file (not committed)
- `npm run dev` for local server

---

## Quick Deploy Checklist

- [ ] Environment variables set in Vercel
- [ ] Supabase Edge Functions deployed
- [ ] `vercel.json` in root directory
- [ ] `.env.example` for reference (not committed)
- [ ] Build works locally (`npm run build`)
- [ ] Git repository ready (if using GitHub)
- [ ] Custom domain configured (optional)

---

## Deployment Commands

```bash
# First time setup
vercel login
vercel

# Production deployment
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove
```

---

## Support

If you encounter issues:
1. Check Vercel Dashboard → Logs
2. Check browser console for errors
3. Verify environment variables
4. Test build locally: `npm run build`
5. Check [Vercel Documentation](https://vercel.com/docs)

---

## Next Steps After Deployment

1. ✅ Test all features
2. ✅ Set up custom domain
3. ✅ Configure analytics
4. ✅ Set up monitoring
5. ✅ Enable Vercel Analytics (optional)
6. ✅ Set up error tracking (optional)

