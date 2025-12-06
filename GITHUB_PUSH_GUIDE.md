# Push to GitHub - Step by Step

## ✅ Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `heady-fm` (or your preferred name)
3. Description: "HEADY.FM - Commercial-Free Indie Rock Radio"
4. Choose: **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

## ✅ Step 2: Copy Repository URL

After creating the repo, GitHub will show you commands. Copy the repository URL:
- It will look like: `https://github.com/yourusername/heady-fm.git`
- Or SSH: `git@github.com:yourusername/heady-fm.git`

## ✅ Step 3: Push to GitHub

Run these commands in your terminal:

```bash
cd /Users/johan/Downloads/heady2-main

# Add the remote (replace with your actual GitHub URL)
git remote add origin https://github.com/yourusername/heady-fm.git

# Push to GitHub
git push -u origin main
```

## Alternative: Use GitHub CLI

If you have GitHub CLI installed:

```bash
gh repo create heady-fm --public --source=. --remote=origin --push
```

---

## 🎉 Done!

Your code is now on GitHub! You can:
- View it at: `https://github.com/yourusername/heady-fm`
- Connect it to Vercel for automatic deployments
- Share it with others

---

## Next: Deploy to Vercel

Once pushed to GitHub:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add environment variables
4. Deploy!

See `QUICK_START_VERCEL.md` for details.

