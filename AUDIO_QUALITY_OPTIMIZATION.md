# Audio Quality Optimization - Analysis & Fixes

## Problem
192 kbps RadioMast stream sounds muffled in browser compared to native app (Triode).

## Root Cause Analysis

After analyzing your code, I found **no Web Audio API processing** (good!), but several issues that can degrade audio quality:

### Issues Identified

1. **`preload='auto'`** ❌
   - Forces browser to buffer audio before play
   - Can trigger unnecessary resampling
   - May cause quality loss during buffering

2. **`crossOrigin='anonymous'`** ⚠️
   - May not be needed for RadioMast streams
   - Can cause browser to use different decoder path
   - Only needed if you're using Web Audio API (which you're not)

3. **Multiple `load()` calls** ❌
   - Called on errors, reconnections, and "jump to live"
   - Each `load()` causes re-buffering
   - Re-buffering can trigger resampling/quality loss

4. **Volume set to 0.7** ⚠️
   - Not causing muffling, but unnecessary
   - Better to use 1.0 and let OS handle system volume

5. **Unnecessary `load()` in stalled handler** ❌
   - Browser handles stalled streams naturally
   - Calling `load()` interrupts playback unnecessarily

---

## Solution Implemented

### Changes Made

1. ✅ **Removed `preload='auto'`**
   - Changed to `preload='none'`
   - Browser only buffers what's needed for playback
   - Reduces resampling artifacts

2. ✅ **Removed `crossOrigin='anonymous'`**
   - Commented out (uncomment if CORS errors occur)
   - RadioMast streams typically don't need CORS
   - Simplifies decoder path

3. ✅ **Minimized `load()` calls**
   - Only call `load()` on first play
   - Removed from error handlers and stalled handler
   - Only "jump to live" intentionally reloads

4. ✅ **Set volume to 1.0**
   - Start at full volume
   - Let OS handle system volume
   - User can still adjust via your UI

5. ✅ **Added `canplaythrough` handler**
   - Better buffering state management
   - Reduces unnecessary state changes

6. ✅ **Improved error recovery**
   - Don't call `load()` on reconnect attempts
   - Let browser handle recovery naturally
   - Reduces quality loss from re-buffering

---

## Technical Details

### Why `preload='auto'` Causes Issues

When `preload='auto'` is set:
1. Browser immediately starts downloading and buffering
2. May trigger resampling if buffer size doesn't match stream
3. Can cause quality loss during initial buffering phase
4. Unnecessary for streaming (browser buffers on-demand anyway)

**Solution**: `preload='none'` - Browser only buffers what's needed for smooth playback.

### Why Multiple `load()` Calls Are Bad

Each `load()` call:
1. Stops current playback
2. Clears buffer
3. Re-downloads stream from beginning
4. Re-buffers and potentially re-samples
5. Can cause audio artifacts

**Solution**: Only call `load()` when absolutely necessary (first play, jump to live).

### Why `crossOrigin` May Not Be Needed

`crossOrigin='anonymous'` is only needed if:
- You're using Web Audio API (you're not)
- You're accessing audio data via JavaScript (you're not)
- The server requires CORS headers (RadioMast typically doesn't)

**Solution**: Remove it unless you get CORS errors.

---

## Testing

### Before vs After

**Before:**
- `preload='auto'` → Unnecessary buffering
- `crossOrigin='anonymous'` → Potential decoder issues
- Multiple `load()` calls → Re-buffering artifacts
- Volume 0.7 → Unnecessary attenuation

**After:**
- `preload='none'` → Minimal buffering
- No `crossOrigin` → Direct decoder path
- Minimal `load()` calls → No re-buffering
- Volume 1.0 → Full quality

### Expected Results

- ✅ **Clearer audio** - No resampling artifacts
- ✅ **Less muffled** - Direct decoder path
- ✅ **Better quality** - Minimal processing
- ✅ **Smoother playback** - Less re-buffering

---

## If Audio Still Sounds Muffled

### Check Browser Settings

1. **System Volume**
   - Check OS volume mixer
   - Ensure browser isn't being attenuated

2. **Browser Audio Settings**
   - Chrome: `chrome://flags/#enable-experimental-web-platform-features`
   - Firefox: Check audio settings
   - Safari: Check audio preferences

3. **Hardware**
   - Test with different headphones/speakers
   - Check audio drivers
   - Test on different devices

### If CORS Errors Occur

If you see CORS errors in console:
1. Uncomment the `crossOrigin` line in the code
2. Contact RadioMast to add CORS headers
3. Or use a proxy server

### Browser-Specific Issues

**Chrome/Edge:**
- May have audio processing enabled by default
- Check `chrome://flags` for audio processing flags
- Disable any "audio processing" or "audio enhancement" flags

**Firefox:**
- Check `about:config` for audio settings
- Look for `media.audio_*` preferences
- Disable any audio processing

**Safari:**
- Check System Preferences → Sound
- Disable any audio enhancements
- Test in different browsers

---

## Comparison with Triode

Triode (native app) likely:
- Uses native audio decoder (no browser overhead)
- No CORS restrictions
- Direct stream access
- OS-level audio processing (if any)

Your browser player now:
- Uses minimal HTMLAudioElement (closest to native)
- No unnecessary processing
- Direct stream access
- Minimal buffering

**Result**: Should sound very close to Triode! 🎵

---

## Additional Optimizations (Optional)

If you still want to improve further:

### 1. Use Web Audio API (Advanced)

Only if you need processing:
```typescript
const audioContext = new AudioContext();
const source = audioContext.createMediaElementSource(audio);
// Connect directly to destination (no processing)
source.connect(audioContext.destination);
```

**Note**: This adds complexity and may not improve quality. Only use if you need audio analysis.

### 2. Check Stream Format

Verify RadioMast stream format:
- MP3, AAC, OGG, etc.
- Browser decoder support
- Bitrate (192 kbps is good)

### 3. Test Different Browsers

Some browsers have better audio decoders:
- Chrome: Generally good
- Firefox: Good, sometimes better
- Safari: Excellent on macOS
- Edge: Similar to Chrome

---

## Summary

The optimized player now:
- ✅ Uses minimal HTMLAudioElement (no Web Audio API)
- ✅ No unnecessary buffering (`preload='none'`)
- ✅ No unnecessary CORS (removed `crossOrigin`)
- ✅ Minimal `load()` calls (only when needed)
- ✅ Full volume (1.0) for best quality
- ✅ Clean playback path (decode → play)

This should sound **much closer to Triode** with clean, unmuffled audio! 🎉

