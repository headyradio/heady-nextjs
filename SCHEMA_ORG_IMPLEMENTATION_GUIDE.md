# Schema.org Music Knowledge Graph Implementation Guide

## Overview

This guide explains how to implement a comprehensive Schema.org structured data knowledge graph for HEADY.FM song pages. The implementation creates a properly linked graph that helps search engines understand the relationships between songs, artists, albums, and the radio station.

## Knowledge Graph Structure

```
WebPage (song page)
  └─ mainEntity → MusicRecording (the song)
       ├─ byArtist → MusicGroup/Person (the artist)
       ├─ inAlbum → MusicAlbum (if available)
       ├─ publisher → Organization (HEADY.FM)
       └─ sameAs → [Spotify, Apple Music, YouTube, etc.]

Organization (HEADY.FM)
  └─ publisher of WebPage and MusicRecording
```

## Entity Relationships

### 1. WebPage → MusicRecording
- **Property**: `mainEntity`
- **Purpose**: Tells search engines the main content of the page
- **Implementation**: `mainEntity: { '@id': '#recording' }`

### 2. MusicRecording → Artist
- **Property**: `byArtist`
- **Purpose**: Links song to performer
- **Implementation**: `byArtist: { '@id': '#artist' }`

### 3. MusicRecording → Album
- **Property**: `inAlbum`
- **Purpose**: Links song to album (when available)
- **Implementation**: `inAlbum: { '@id': '#album' }`

### 4. MusicRecording → Station
- **Property**: `publisher`
- **Purpose**: Identifies HEADY.FM as the publisher
- **Implementation**: `publisher: { '@id': '#station' }`

### 5. WebPage → Station
- **Property**: `publisher`
- **Purpose**: Identifies HEADY.FM as the page publisher
- **Implementation**: `publisher: { '@id': '#station' }`

## Implementation in React/Next.js

### Step 1: Import the Generator

```typescript
import { generateMusicKnowledgeGraph, generateBreadcrumbList, convertDurationToISO8601 } from '@/lib/schemaOrgMusicGraph';
```

### Step 2: Prepare Your Data

```typescript
const songData = {
  trackTitle: "Song Title",
  trackUrl: "https://heady.fm/song/artist/title",
  trackDescription: "Song description...",
  trackImage: "https://heady.fm/image.jpg",
  trackDuration: "PT3M30S", // ISO 8601 format
  trackGenre: "Indie Rock",
  artistName: "Artist Name",
  artistUrl: "https://heady.fm/artist/artist-name",
  albumName: "Album Name", // Optional
  // ... other fields
};
```

### Step 3: Generate the Graph

```typescript
const musicGraph = generateMusicKnowledgeGraph(songData);
const breadcrumbs = generateBreadcrumbList([
  { name: 'Home', url: 'https://heady.fm' },
  { name: artist, url: artistUrl },
  { name: title, url: songUrl },
]);

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    ...musicGraph['@graph'],
    breadcrumbs,
  ],
};
```

### Step 4: Embed in HTML

**Using React Helmet (Current Implementation):**

```typescript
<SEO
  title={`${title} by ${artist}`}
  description={songDescription}
  structuredData={structuredData}
/>
```

**Using Next.js Head:**

```typescript
import Head from 'next/head';

<Head>
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
  />
</Head>
```

**Using Next.js Metadata (App Router):**

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const structuredData = generateMusicKnowledgeGraph(songData);
  
  return {
    title: `${title} by ${artist}`,
    description: songDescription,
    other: {
      'application/ld+json': JSON.stringify(structuredData),
    },
  };
}
```

## Complete Example

```typescript
// pages/song/[artist]/[title].tsx or app/song/[artist]/[title]/page.tsx

import { generateMusicKnowledgeGraph, generateBreadcrumbList } from '@/lib/schemaOrgMusicGraph';

export default function SongPage({ song, artist, album }) {
  // Generate structured data
  const structuredData = generateMusicKnowledgeGraph({
    trackTitle: song.title,
    trackUrl: `https://heady.fm/song/${artist.slug}/${song.slug}`,
    trackDescription: song.description,
    trackImage: song.image,
    trackDuration: convertDurationToISO8601(song.duration),
    trackGenre: song.genre,
    artistName: artist.name,
    artistUrl: `https://heady.fm/artist/${artist.slug}`,
    albumName: album?.name,
    // ... other fields
  });

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      {/* Your page content */}
    </>
  );
}
```

## Common Mistakes to Avoid

### ❌ Mistake 1: Mismatched Names
**Problem**: Page title says "Song by Artist" but schema says "Song Title"
```json
// ❌ BAD
{
  "name": "Song Title",  // Doesn't match page title
  "byArtist": { "name": "Artist" }
}
```

**Solution**: Ensure schema names match what's visible on the page
```json
// ✅ GOOD
{
  "name": "Song Title",
  "byArtist": { "name": "Artist Name" }
}
```

### ❌ Mistake 2: Missing mainEntity
**Problem**: WebPage doesn't link to MusicRecording
```json
// ❌ BAD
{
  "@type": "WebPage",
  "url": "...",
  // Missing mainEntity!
}
```

**Solution**: Always include mainEntity
```json
// ✅ GOOD
{
  "@type": "WebPage",
  "url": "...",
  "mainEntity": { "@id": "#recording" }
}
```

### ❌ Mistake 3: Missing byArtist
**Problem**: MusicRecording doesn't link to artist
```json
// ❌ BAD
{
  "@type": "MusicRecording",
  "name": "Song",
  // Missing byArtist!
}
```

**Solution**: Always include byArtist
```json
// ✅ GOOD
{
  "@type": "MusicRecording",
  "name": "Song",
  "byArtist": { "@id": "#artist" }
}
```

### ❌ Mistake 4: Wrong Duration Format
**Problem**: Using "3:30" instead of ISO 8601
```json
// ❌ BAD
{
  "duration": "3:30"  // Wrong format
}
```

**Solution**: Use ISO 8601 format
```json
// ✅ GOOD
{
  "duration": "PT3M30S"  // ISO 8601
}
```

### ❌ Mistake 5: Missing @id References
**Problem**: Entities not properly linked
```json
// ❌ BAD
{
  "byArtist": {
    "name": "Artist"  // Not linked, just inline
  }
}
```

**Solution**: Use @id for proper linking
```json
// ✅ GOOD
{
  "byArtist": {
    "@id": "#artist"  // Links to entity in graph
  }
}
```

### ❌ Mistake 6: Duplicate Entities
**Problem**: Defining same entity multiple times
```json
// ❌ BAD
{
  "@graph": [
    { "@id": "#artist", "name": "Artist" },
    { "@id": "#artist", "name": "Artist" }  // Duplicate!
  ]
}
```

**Solution**: Define each entity once, reference with @id
```json
// ✅ GOOD
{
  "@graph": [
    { "@id": "#artist", "name": "Artist" },  // Defined once
    { "byArtist": { "@id": "#artist" } }     // Referenced
  ]
}
```

## Validation

### Google Rich Results Test
1. Visit: https://search.google.com/test/rich-results
2. Enter your page URL or paste HTML
3. Check for errors/warnings
4. Verify all entities are recognized

### Schema.org Validator
1. Visit: https://validator.schema.org/
2. Paste your JSON-LD
3. Check for validation errors

### Common Validation Errors

1. **Missing required properties**
   - Fix: Ensure all required fields are present

2. **Invalid @id format**
   - Fix: Use URLs or fragment identifiers (#id)

3. **Circular references**
   - Fix: Use @id references, not nested objects

4. **Invalid date/duration formats**
   - Fix: Use ISO 8601 for dates, PT format for durations

## Best Practices

### 1. Use Stable URLs for @id
```typescript
// ✅ GOOD - URL-based IDs are stable
'@id': 'https://heady.fm/song/artist/title#recording'

// ❌ BAD - Fragile IDs
'@id': '#recording-123'
```

### 2. Include All Available Data
- External links (Spotify, Apple Music, etc.)
- Album information when available
- Play statistics
- Release dates

### 3. Keep Data Consistent
- Names should match between page and schema
- URLs should be absolute and canonical
- Images should be high quality

### 4. Test Regularly
- Validate after changes
- Check Google Search Console for errors
- Monitor rich result appearance

## Template for CMS Integration

See `src/lib/schemaOrgMusicGraph.ts` for the `SONG_PAGE_SCHEMA_TEMPLATE` with placeholder variables:

- `{{trackTitle}}` - Song title
- `{{artistName}}` - Artist name
- `{{trackUrl}}` - Full URL to song page
- `{{albumName}}` - Album name (optional)
- `{{duration}}` - Duration in MM:SS format
- `{{playCount}}` - Number of times played
- etc.

Replace placeholders with actual values from your CMS.

## Expected SEO Benefits

1. **Rich Results**: Songs may appear in Google with enhanced information
2. **Knowledge Graph**: Better understanding of music relationships
3. **Voice Search**: Better answers to "play [song] by [artist]"
4. **Music Discovery**: Better linking between related artists/albums
5. **Structured Data**: Clearer signals for search engines

## Monitoring

### Google Search Console
- Check "Enhancements" → "Music"
- Monitor for errors/warnings
- Track rich result appearance

### Schema Markup Validator
- Regular validation checks
- Fix errors promptly
- Test new features

## Next Steps

1. ✅ Implement the generator function
2. ✅ Update SongPage component
3. ✅ Validate with Google Rich Results Test
4. ✅ Monitor in Google Search Console
5. ✅ Iterate based on results

## Resources

- [Schema.org MusicRecording](https://schema.org/MusicRecording)
- [Schema.org MusicGroup](https://schema.org/MusicGroup)
- [Schema.org MusicAlbum](https://schema.org/MusicAlbum)
- [Google Music Rich Results](https://developers.google.com/search/docs/appearance/structured-data/music)
- [JSON-LD Playground](https://json-ld.org/playground/)

