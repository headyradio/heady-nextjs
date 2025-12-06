# Schema.org Music Graph - Quick Reference

## Entity Linking Pattern

```
WebPage
  ├─ @id: "{{url}}#webpage"
  ├─ mainEntity → MusicRecording
  └─ publisher → Organization

MusicRecording
  ├─ @id: "{{url}}#recording"
  ├─ byArtist → MusicGroup/Person
  ├─ inAlbum → MusicAlbum (optional)
  ├─ publisher → Organization
  └─ sameAs → [external links]

MusicGroup/Person
  ├─ @id: "{{url}}#artist"
  └─ (referenced by MusicRecording)

MusicAlbum
  ├─ @id: "{{url}}#album"
  ├─ byArtist → MusicGroup/Person
  └─ publisher → Organization

Organization
  ├─ @id: "{{url}}#station"
  └─ (referenced as publisher)
```

## Required Properties

### WebPage
- ✅ `@id` - Unique identifier
- ✅ `url` - Page URL
- ✅ `name` - Page title
- ✅ `mainEntity` - Link to MusicRecording
- ✅ `publisher` - Link to Organization

### MusicRecording
- ✅ `@id` - Unique identifier
- ✅ `name` - Song title
- ✅ `url` - Song page URL
- ✅ `byArtist` - Link to artist
- ✅ `publisher` - Link to Organization

### MusicGroup/Person
- ✅ `@id` - Unique identifier
- ✅ `name` - Artist name
- ✅ `url` - Artist page URL

### Organization
- ✅ `@id` - Unique identifier
- ✅ `name` - "HEADY.FM"
- ✅ `url` - "https://heady.fm"

## Optional Properties (Include When Available)

### MusicRecording
- `description` - Song description
- `image` - Album art
- `duration` - ISO 8601 format (PT3M30S)
- `genre` - Genre(s)
- `copyrightYear` - Release year
- `datePublished` - Release date
- `isrcCode` - ISRC code
- `inAlbum` - Link to album
- `sameAs` - External links
- `interactionStatistic` - Play count

### MusicGroup/Person
- `description` - Artist bio
- `image` - Artist image

### MusicAlbum
- `name` - Album name
- `url` - Album page URL
- `image` - Album cover
- `datePublished` - Release date

## Duration Format Conversion

```typescript
// Input formats
"3:30"     → "PT3M30S"
"03:30"    → "PT3M30S"
"1:23:45"  → "PT1H23M45S"
"PT3M30S"  → "PT3M30S" (already correct)

// Use convertDurationToISO8601() helper
```

## Date Format

Always use ISO 8601:
- ✅ `"2024-01-15"`
- ✅ `"2024-01-15T10:30:00Z"`
- ❌ `"January 15, 2024"`
- ❌ `"01/15/2024"`

## @id Best Practices

1. **Use full URLs** for stability
   - ✅ `"https://heady.fm/song/artist/title#recording"`
   - ❌ `"#recording"` (fragile)

2. **Use fragment identifiers** for same-page entities
   - ✅ `"{{url}}#recording"`
   - ✅ `"{{url}}#artist"`

3. **Keep IDs consistent** across pages
   - Same artist = same @id
   - Same album = same @id

## Common Patterns

### Minimal Song (No Album)
```json
{
  "@graph": [
    { "@id": "#webpage", "@type": "WebPage", "mainEntity": { "@id": "#recording" } },
    { "@id": "#recording", "@type": "MusicRecording", "byArtist": { "@id": "#artist" } },
    { "@id": "#artist", "@type": "MusicGroup", "name": "Artist" },
    { "@id": "#station", "@type": "Organization", "name": "HEADY.FM" }
  ]
}
```

### Full Song (With Album)
```json
{
  "@graph": [
    { "@id": "#webpage", "@type": "WebPage", "mainEntity": { "@id": "#recording" } },
    { "@id": "#recording", "@type": "MusicRecording", "byArtist": { "@id": "#artist" }, "inAlbum": { "@id": "#album" } },
    { "@id": "#artist", "@type": "MusicGroup", "name": "Artist" },
    { "@id": "#album", "@type": "MusicAlbum", "byArtist": { "@id": "#artist" } },
    { "@id": "#station", "@type": "Organization", "name": "HEADY.FM" }
  ]
}
```

## Validation Checklist

Before deploying, verify:

- [ ] All @id values are unique within the graph
- [ ] All references use @id (not inline objects)
- [ ] WebPage has mainEntity pointing to MusicRecording
- [ ] MusicRecording has byArtist pointing to artist
- [ ] All URLs are absolute and canonical
- [ ] Duration is in ISO 8601 format (PT3M30S)
- [ ] Dates are in ISO 8601 format (YYYY-MM-DD)
- [ ] Names match between page content and schema
- [ ] Publisher links to Organization entity
- [ ] External links in sameAs array

## Testing

1. **Google Rich Results Test**
   - https://search.google.com/test/rich-results
   - Paste URL or HTML
   - Check for errors

2. **Schema.org Validator**
   - https://validator.schema.org/
   - Paste JSON-LD
   - Verify structure

3. **JSON-LD Playground**
   - https://json-ld.org/playground/
   - Visualize graph structure
   - Check entity linking

## Troubleshooting

### Error: "Missing required property"
- Check that all required fields are present
- Verify property names match schema.org spec

### Error: "Invalid @id reference"
- Ensure @id exists in @graph
- Check for typos in @id values

### Error: "Circular reference"
- Use @id references, not nested objects
- Don't nest entities inside each other

### Warning: "Property not recognized"
- Check spelling of property names
- Verify property is valid for the type
- Some properties may be optional

