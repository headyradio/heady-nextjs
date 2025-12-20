# MusicBrainz Integration Setup Guide

## ✅ What Has Been Created

I've created all the local files you need:

### Edge Functions (in `supabase/functions/`)
- ✅ `fetch-musicbrainz-data/index.ts` - Fetches artist & song data from MusicBrainz
- ✅ `fetch-listenbrainz-data/index.ts` - Fetches listening stats from ListenBrainz

### React Hooks (in `src/hooks/`)
- ✅ `useMusicBrainzArtistData.ts` - Hook for MusicBrainz artist data
- ✅ `useListenBrainzData.ts` - Hook for ListenBrainz stats
- ✅ `useCombinedArtistData.ts` - **Main hook that combines all data sources**

### Updated Pages
- ✅ `src/pages/ArtistPage.tsx` - Now uses `useCombinedArtistData` hook

---

## 🔧 Manual Steps You Need to Complete

### Step 1: Create Database Tables (5 minutes)

1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard/project/xpqwujjglvhadlgxotcv

2. Click **SQL Editor** in the left sidebar

3. Click **New Query**

4. Paste this SQL and click **RUN**:

```sql
-- MusicBrainz Artist Data Table
CREATE TABLE IF NOT EXISTS musicbrainz_artist_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_name TEXT NOT NULL UNIQUE,
  mbid TEXT,
  full_data JSONB NOT NULL,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_musicbrainz_artist_name ON musicbrainz_artist_data(LOWER(artist_name));
CREATE INDEX idx_musicbrainz_mbid ON musicbrainz_artist_data(mbid);
CREATE INDEX idx_musicbrainz_cached_at ON musicbrainz_artist_data(cached_at);

-- ListenBrainz Data Table
CREATE TABLE IF NOT EXISTS listenbrainz_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_name TEXT,
  mbid TEXT,
  full_data JSONB NOT NULL,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(artist_name, mbid)
);

CREATE INDEX idx_listenbrainz_artist_name ON listenbrainz_data(LOWER(artist_name));
CREATE INDEX idx_listenbrainz_mbid ON listenbrainz_data(mbid);
CREATE INDEX idx_listenbrainz_cached_at ON listenbrainz_data(cached_at);

-- Enable Row Level Security
ALTER TABLE musicbrainz_artist_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE listenbrainz_data ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to MusicBrainz data"
  ON musicbrainz_artist_data FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to ListenBrainz data"
  ON listenbrainz_data FOR SELECT
  USING (true);
```

---

### Step 2: Set Environment Variables (2 minutes)

1. Go to **Supabase Dashboard** → **Settings** → **Edge Functions**

2. Scroll to **Function Secrets**

3. Add these secrets:

   - **Key**: `LISTENBRAINZ_TOKEN`
   - **Value**: Your ListenBrainz API token (get it from https://listenbrainz.org/profile/)

4. Verify `LASTFM_API_KEY` is set:
   - If not, add it with your Last.fm API key

---

### Step 3: Deploy Edge Functions (3 minutes)

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref xpqwujjglvhadlgxotcv

# Deploy the new functions
supabase functions deploy fetch-musicbrainz-data
supabase functions deploy fetch-listenbrainz-data
```

#### Option B: Through Git + Lovable

1. Commit the new edge function files to git:
```bash
git add supabase/functions/fetch-musicbrainz-data/
git add supabase/functions/fetch-listenbrainz-data/
git commit -m "Add MusicBrainz and ListenBrainz integration"
git push
```

2. Ask Lovable to deploy them, or wait for automatic deployment

---

### Step 4: Test Locally (Optional, 2 minutes)

```bash
# Start your dev server
npm run dev

# Visit an artist page, e.g.:
# http://localhost:8081/artist/Radiohead

# Open browser console and look for:
# "Fetching from MusicBrainz API: Radiohead"
# "Cached MusicBrainz data for: Radiohead"
```

---

## 🎯 What You Get

### Priority Data Flow

**MusicBrainz** is now the **primary** data source:

1. **Image**: MusicBrainz → Last.fm → Genius
2. **Bio**: Genius → Last.fm → MusicBrainz
3. **Genres**: MusicBrainz + Last.fm (combined)
4. **MBID**: MusicBrainz canonical ID

### New Data Available on Artist Pages

- ✅ **Artist Type**: Person, Group, Orchestra, etc.
- ✅ **Country**: Where artist is from
- ✅ **Begin/End Dates**: Formation/disbandment dates
- ✅ **MusicBrainz Rating**: Community ratings
- ✅ **Canonical MBID**: Universal music identifier
- ✅ **Official Website**: From MusicBrainz relationships
- ✅ **Aliases**: Alternative artist names
- ✅ **ListenBrainz Stats**: Real listening data
- ✅ **Better Similar Artists**: Based on listening patterns

---

## 📊 Data Caching

- **MusicBrainz**: 30 days (data is stable)
- **ListenBrainz**: 7 days (stats change)
- **Last.fm**: 7 days
- **Genius**: 7 days

---

## 🔍 How to Use in Your Code

### Simple Usage (Recommended)

```typescript
import { useCombinedArtistData } from "@/hooks/useCombinedArtistData";

function ArtistComponent({ artistName }) {
  const artistData = useCombinedArtistData(artistName);

  return (
    <div>
      <img src={artistData.image} alt={artistData.name} />
      <h1>{artistData.name}</h1>
      <p>Type: {artistData.type}</p>
      <p>Country: {artistData.country}</p>
      <p>Genres: {artistData.genres.join(', ')}</p>
      <p>MusicBrainz Rating: {artistData.stats.musicbrainzRating}/5</p>
      <p>ListenBrainz Listeners: {artistData.stats.listenbrainzListeners}</p>
    </div>
  );
}
```

### Advanced Usage (Access Raw Data)

```typescript
const artistData = useCombinedArtistData(artistName);

// Access specific source data
const mbData = artistData.rawData.musicBrainz;
const lastfmData = artistData.rawData.lastfm;
const geniusData = artistData.rawData.genius;
```

---

## 🐛 Troubleshooting

### "Table doesn't exist" Error
- Make sure you ran the SQL in Step 1
- Check Supabase Dashboard → Table Editor to verify tables exist

### "Function not found" Error
- Make sure you deployed the edge functions (Step 3)
- Check Supabase Dashboard → Edge Functions to verify they're deployed

### No MusicBrainz Data Showing
- Check browser console for errors
- MusicBrainz API requires exact artist name matches
- Try searching for the artist on https://musicbrainz.org first

### API Rate Limiting
- MusicBrainz has rate limits (1 request/second)
- The caching system handles this automatically
- Data is cached for 30 days

---

## 🎉 You're Done!

Once you complete the 4 manual steps above, your artist pages will automatically start using MusicBrainz as the primary data source with rich metadata!

The integration will:
- ✅ Fetch from MusicBrainz first
- ✅ Fall back to Last.fm and Genius when needed
- ✅ Cache everything for performance
- ✅ Provide canonical MBIDs for linking
- ✅ Show real listening statistics

---

## 📚 Resources

- **MusicBrainz API**: https://musicbrainz.org/doc/MusicBrainz_API
- **ListenBrainz API**: https://listenbrainz.readthedocs.io/
- **Get ListenBrainz Token**: https://listenbrainz.org/profile/
- **MusicBrainz Rate Limiting**: https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting


