# Design & Data Improvements

## ✅ Completed Updates

### 1. **Artist Page Text**
- Changed "All Songs" to **"ALL SONGS PLAYED ON EXTRATERRESTRIAL RADIO"** on the artist page.

### 2. **Cleaned Up Lists (Numbers Removed)**
- **Artist Page**: Song list no longer shows numbers on the left.
- **Song Page**:
  - "More from [Artist]" list numbers removed.
  - "Play History" timeline numbers removed.

### 3. **Consolidated Song Info Design**
- **Merged "Credits" into "Track Info"**:
  - Producers and Writers are now displayed directly within the "Track Info" card.
  - Creates a cleaner, cohesive "About the Track" section.
  - Removed the separate Credits component.

### 4. **Improved Related Artists**
- **MusicBrainz Integration**:
  - Updated the `useRelatedArtists` hook to fetch data from **ListenBrainz** (MusicBrainz ecosystem).
  - This provides much more relevant "Similar Artists" recommendations based on real listening habits.
  - Combines data from Genius (collaborators), Radio Station History (co-played), and MusicBrainz/ListenBrainz (genre/similarity).

---

## 🎨 Visual Changes

### **Song Page Layout**
```
[ About the Track ]
┌─────────────────────────┐  ┌──────────────────────────────────┐
│ 🎵 Track Info           │  │ 📖 Song Story                    │
│                         │  │                                  │
│ 📅 Release Date         │  │ "The song was written..."        │
│ 💿 Album                │  │                                  │
│ ⏱️ Duration             │  │                                  │
│ 👥 Featured Artists     │  │                                  │
│                         │  │                                  │
│ ──────── (Divider) ──── │  │                                  │
│                         │  │                                  │
│ 🎬 Producers            │  │                                  │
│ [Name] [Name]           │  │                                  │
│                         │  │                                  │
│ ✍️ Writers              │  │                                  │
│ [Name] [Name]           │  │                                  │
└─────────────────────────┘  └──────────────────────────────────┘
```

### **Related Artists Logic**
Priority order for recommendations:
1. **Featured Artists** (Most relevant)
2. **Producers/Writers** (Collaborators)
3. **Co-Played on Station** (Local context)
4. **ListenBrainz Similar Artists** (Global music data) ✅ **NEW**


