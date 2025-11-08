# Testing Checklist - The Transformation Engine

**Version**: Phase 9 Complete (Intermediate Architecture)
**Date**: 2025-10-12

---

## Pre-Test Setup

1. **Clean Environment**:
   ```bash
   # Clear browser data
   - Open DevTools (F12)
   - Application → Storage → Clear site data

   # Fresh build
   npm run build
   ./manage.sh start

   # Or development
   ./manage.sh dev
   ```

2. **API Key**:
   - Get fresh key from https://aistudio.google.com/app/apikey
   - Have it ready for first test

---

## 1. Core Features (Regression Tests)

### 1.1 Initial Setup & API Key
- [ ] **First Launch**: App loads without errors
- [ ] **Logo Display**: Logo visible in top-left corner (LeftPanel)
- [ ] **Favicon**: Browser tab shows logo icon
- [ ] **API Key Entry**: Settings → API Key tab
  - [ ] Enter valid key → "Valid API Key" status
  - [ ] Test with invalid key → Shows error
  - [ ] Remove key → Status updates
  - [ ] Key persists after page refresh (encrypted storage)
  - [ ] Key expires after TTL (default 7 days)

### 1.2 Basic Generation
- [ ] **Natural Language Input**: Enter "A woman walks along a beach at sunset"
- [ ] **Generate Prompt** (Legacy Mode OFF - Intermediate Mode ON by default):
  - [ ] Loading indicator shows
  - [ ] Structured output appears in RightPanel
  - [ ] Format is YAML (default)
  - [ ] Output contains expected keys
  - [ ] Intermediate saved to IndexedDB (check DevTools → Application → IndexedDB → intermediates)
- [ ] **Save to Library**: Click "Save to Library"
  - [ ] Prompt appears in LeftPanel library
  - [ ] Title auto-generated from first sentence

### 1.3 Schema Keys
- [ ] **Default Keys**: `scene`, `sound_effects`, `speech` visible
- [ ] **Add Custom Key**: Type "camera_movement" → Enter
  - [ ] Key appears in list
  - [ ] Key used in next generation
- [ ] **Remove Key**: Click X on key
  - [ ] Key removed from list
- [ ] **Presets**:
  - [ ] Click "Video Scene" → adds video-related keys
  - [ ] Click "Music" → adds music-related keys
  - [ ] Click "Art Direction" → adds art-related keys
- [ ] **AI: Suggest Keys**:
  - [ ] Button triggers schema inference
  - [ ] Suggested keys appear with reasoning
  - [ ] Can accept suggestions
- [ ] **AI: Full Schema**:
  - [ ] Replaces all keys with AI suggestions

### 1.4 Output Formats
- [ ] **YAML**: Default format, proper syntax
- [ ] **JSON**: Valid JSON structure
- [ ] **XML**: Valid XML structure
- [ ] **Markdown**: Readable markdown
- [ ] **Format Switching**: Change dropdown → output updates

### 1.5 Mix Options
- [ ] **Reverse**: Enable → output keys reversed
- [ ] **Compress**: Enable → terse output
- [ ] **Expand**: Enable → verbose output
- [ ] **Technical**: Enable → technical terminology
- [ ] **Custom**: Add custom instruction → applied
- [ ] **Multiple Options**: Enable 2+ → all applied

### 1.6 Transformations
- [ ] **→ Plain English**: Converts to flowing paragraph
- [ ] **→ YAML/JSON/XML/Markdown**: Format conversion works
- [ ] **✨ Custom**: Enter "Make it poetic" → applies transformation
- [ ] **Transformation History**: Can undo transformations

### 1.7 Library Management
- [ ] **Search**: Type in search → filters prompts
- [ ] **Click Prompt**: Loads in RightPanel
- [ ] **Star/Favorite**: Click star → prompt favorited
- [ ] **Multi-Select**: Check 2+ prompts
  - [ ] Duplicate button appears
  - [ ] Delete button appears (with confirmation)
  - [ ] Export exports only selected
- [ ] **Duplicate**: Creates copy with "(copy)" suffix
- [ ] **Delete**: Removes prompt (inline confirmation, no popup)

### 1.8 Synesthetic Mixer
- [ ] **Select 2+ Prompts**: Check boxes in library
- [ ] **Mix Button**: Appears at top of LeftPanel
- [ ] **Enter Guidance**: "Combine the mood of the first with the setting of the second"
- [ ] **Generate Mix**: Creates hybrid prompt
- [ ] **Checkboxes Clear**: Auto-clears after mixing

### 1.9 Version History
- [ ] **Edit Prompt**: Modify output in RightPanel
- [ ] **Save Changes**: Version auto-created
- [ ] **History Tab**: Shows version list
- [ ] **Restore**: Click restore → reverts to old version
- [ ] **View Old Version**: Click version → displays content

### 1.10 Media Uploads
- [ ] **Add Image**: Upload image (max 10MB)
  - [ ] Thumbnail appears
  - [ ] Can remove image
- [ ] **Add Video**: Upload video (max 10MB)
  - [ ] Thumbnail appears
  - [ ] Can remove video
- [ ] **Describe with AI**:
  - [ ] Analyzes media with vision API
  - [ ] Adds description to input
- [ ] **Generate with Media**: Uses visual context

### 1.11 Prompt Preview & Transparency
- [ ] **Expand Preview**: Shows assembled prompt
- [ ] **System Prompt Visible**: Full system prompt displayed
- [ ] **User Prompt Visible**: User input shown
- [ ] **Edit Prompts**: Click button
  - [ ] Can edit system prompt inline
  - [ ] Can edit user prompt inline
  - [ ] Changes apply to current generation only
- [ ] **Reset to Default**: Clears inline edits

### 1.12 Settings Modal
- [ ] **Open Settings**: Click gear icon in LeftPanel
- [ ] **API Key Tab**:
  - [ ] Shows current status
  - [ ] Can update key
  - [ ] Can remove key
- [ ] **Model Settings Tab**:
  - [ ] Default Model dropdown works
  - [ ] Temperature slider (0-2)
  - [ ] Top P slider (0-1)
  - [ ] Max Output Tokens (1-8192)
  - [ ] Reset to Defaults button
- [ ] **System Prompts Tab**:
  - [ ] 4 sub-tabs: Primary, Mixer, Normalizer, Schema
  - [ ] Can edit each prompt
  - [ ] Save Prompts persists changes
  - [ ] Reset to Defaults restores originals
  - [ ] Custom prompts used in generation
- [ ] **Data & Cache Tab**:
  - [ ] Clear Cache removes API responses
  - [ ] Clear All Data deletes everything (prompts, versions, settings)

### 1.13 Import/Export
- [ ] **Export Prompts**: Downloads JSON
- [ ] **Import Prompts**: Loads JSON backup
- [ ] **Export Config**: Downloads settings JSON
- [ ] **Import Config**: Restores settings (format, mix options, schema keys, model)

### 1.14 Privacy Dashboard
- [ ] **Open Dashboard**: Click "Privacy" button
- [ ] **Network Monitoring**:
  - [ ] Shows recent API calls
  - [ ] Domain shown (generativelanguage.googleapis.com)
  - [ ] Purpose shown (generation, schema, etc.)
  - [ ] Media presence indicator
- [ ] **Storage Tracking**: Shows IndexedDB usage
- [ ] **API Key Status**: Shows expiration
- [ ] **Export Audit Logs**: Downloads JSON

---

## 2. Phase 9 New Features (Intermediate Architecture)

### 2.1 Intermediate Mode (Default)
- [ ] **Toggle Visible**: "Generate as Intermediate (recommended)" checkbox
- [ ] **Toggle ON** (default):
  - [ ] Generate prompt
  - [ ] Intermediate saved to IndexedDB `intermediates` store
  - [ ] YAML displayed in RightPanel
  - [ ] Model auto-detected (check indicator)
- [ ] **Toggle OFF** (legacy mode):
  - [ ] Generate prompt
  - [ ] Saved to `prompts` store only
  - [ ] No intermediate created
  - [ ] Works exactly like Phase 8

### 2.2 Model Auto-Detection
- [ ] **Audio-Rich Input**: "A coffee shop with jazz music and people talking"
  - [ ] Detects as Veo 3 (audio-first)
  - [ ] Shows Veo 3 indicator
- [ ] **Temporal Input**: "A woman walks from left to right over 10 seconds"
  - [ ] Detects as Sora 2 (temporal progression)
  - [ ] Shows Sora 2 indicator
- [ ] **Simple Input**: "A red car"
  - [ ] Detects as Generic
  - [ ] Shows Generic indicator

### 2.3 Format Export Selector
- [ ] **Dropdown Visible**: After generation with intermediate mode
- [ ] **Sora 2 Option**: Select → YAML updates instantly
  - [ ] Uses 7 canonical keys (temporal_progression, visual_description, etc.)
  - [ ] Character counter shows (green < 2200, yellow 2200-2500, red > 2500)
  - [ ] Temporal segments use `[HH:MM-HH:MM]` format
- [ ] **Veo 3 Option**: Select → YAML updates instantly
  - [ ] Uses 9 canonical keys (subject, context, action, etc.)
  - [ ] Includes audio_elements (required)
  - [ ] No character counter (no hard limit)
- [ ] **Generic Option**: Select → YAML updates instantly
  - [ ] Uses 4 keys (scene, visuals, audio, style)
  - [ ] Simple format
- [ ] **No Re-generation**: Switching formats is instant (no loading)

### 2.4 Character Counter (Sora 2)
- [ ] **Green (< 2200 chars)**: Looks good
- [ ] **Yellow (2200-2500 chars)**: Warning shown
- [ ] **Red (> 2500 chars)**: Exceeds limit warning

### 2.5 Intermediate Editor
- [ ] **"Create from Intermediate" Button**: Visible in CenterPanel
- [ ] **Click Button**: Opens IntermediateEditor
- [ ] **Metadata Tab**: Edit title, description, tags
- [ ] **Timeline Tab**:
  - [ ] Visual timeline shows segments
  - [ ] Add segment button
  - [ ] Edit segment start/end times
  - [ ] Edit segment descriptions
  - [ ] Delete segment
- [ ] **Visual Tab**: Edit setting, subjects, environment, colors, lighting, composition, style
- [ ] **Audio Tab**: Edit dialogue, ambient, sound effects, music
- [ ] **Camera Tab**: Edit movement, angles, techniques
- [ ] **Format Export Panel** (bottom):
  - [ ] Model selector dropdown
  - [ ] Live YAML preview
  - [ ] Character counter (if Sora 2)
  - [ ] Copy to clipboard
  - [ ] Export & Save to library
- [ ] **Save Changes**: Updates intermediate
- [ ] **Cancel**: Discards changes

### 2.6 Edit Existing as Intermediate
- [ ] **RightPanel "Intermediate" Tab**: Visible when prompt loaded
- [ ] **Click Tab**: Opens IntermediateEditor
- [ ] **Existing YAML Parsed**: Converted to intermediate structure
- [ ] **Edit Structure**: Make changes
- [ ] **Export**: Saves as new prompt with new format

### 2.7 Transformer System
- [ ] **Sora 2 Transformer**:
  - [ ] Outputs 7 canonical keys
  - [ ] Temporal segments formatted as `[00:00-00:03]`
  - [ ] Warns if > 2500 chars
  - [ ] Truncates if necessary
- [ ] **Veo 3 Transformer**:
  - [ ] Outputs 9 canonical keys
  - [ ] Errors if no audio_elements
  - [ ] Subject descriptions 30-50 words
- [ ] **Generic Transformer**:
  - [ ] Outputs 4 keys
  - [ ] No validation (permissive)

### 2.8 Cache System
- [ ] **First Transform**: Takes time (API call or processing)
- [ ] **Second Transform (same format)**: Instant (cached)
- [ ] **Edit Intermediate**: Cache invalidated
- [ ] **Third Transform**: Recalculated

---

## 3. Model-Specific Features

### 3.1 Sora 2 (OpenAI) Presets
- [ ] **Cinematic Preset**: Uses 7 canonical keys
- [ ] **Social Media Preset**: Optimized for short form
- [ ] **Product Demo Preset**: Product showcase focus
- [ ] **All Exclude technical_specs**: Duration/resolution handled by UI
- [ ] **Temporal Progression**: Scenes described over 10 seconds
- [ ] **Audio Optional**: Audio descriptions enhance soundtrack

### 3.2 Veo 3 (Google) Presets
- [ ] **Narrative Scene Preset**: Uses 9 canonical keys
- [ ] **Cinematic Landscape Preset**: Epic landscape focus
- [ ] **Product Demo Preset**: Commercial style
- [ ] **All Exclude veo3_specs**: Duration/resolution handled by UI
- [ ] **Audio Required**: Always includes audio_elements
- [ ] **Subject Details**: 30-50 word descriptions

### 3.3 Model Detection UI
- [ ] **Sora 2 Detected**: Blue indicator, "Sora 2 (OpenAI)" label
- [ ] **Veo 3 Detected**: Green indicator, "Veo 3 (Google)" label
- [ ] **Generic Detected**: Gray indicator, "Generic" label
- [ ] **Manual Override**: Can change dropdown to override detection

---

## 4. Performance Tests

### 4.1 Loading Speed
- [ ] **Initial Load**: < 2 seconds
- [ ] **Generate Prompt**: < 5 seconds
- [ ] **Transform Format**: < 1 second (cached)
- [ ] **Search Library**: Instant filtering
- [ ] **Load Prompt**: < 500ms

### 4.2 Large Library
- [ ] **100+ Prompts**: Search still fast
- [ ] **Scroll Performance**: Smooth scrolling
- [ ] **Filter Performance**: No lag

### 4.3 Memory
- [ ] **DevTools Memory**: No significant leaks after 10 operations
- [ ] **IndexedDB Size**: Check Application → Storage → IndexedDB

### 4.4 Build
- [ ] **Production Build**: `npm run build` succeeds
- [ ] **Build Size**: ~420 kB main bundle, ~118 kB gzipped
- [ ] **No Console Errors**: Check browser console

---

## 5. Error Handling

### 5.1 API Errors
- [ ] **Invalid API Key**: Shows error message
- [ ] **Network Offline**: Shows network error
- [ ] **API Rate Limit**: Shows rate limit message
- [ ] **Malformed Response**: Shows parsing error

### 5.2 Input Validation
- [ ] **Empty Input**: Shows "Please enter a prompt" error
- [ ] **Too Long Input**: Warns if > 2500 chars (Sora 2)
- [ ] **Invalid JSON Import**: Shows error, doesn't break app

### 5.3 Edge Cases
- [ ] **Delete Last Prompt**: Library shows empty state
- [ ] **Mix 1 Prompt**: Disabled (requires 2+)
- [ ] **Generate Without API Key**: Prompts for key
- [ ] **Quota Exceeded**: Shows storage quota error

---

## 6. Browser Compatibility

Test in multiple browsers:
- [ ] **Chrome/Edge**: Full functionality
- [ ] **Firefox**: Full functionality
- [ ] **Safari**: Full functionality (check IndexedDB compatibility)

---

## 7. Security & Privacy

### 7.1 CSP (Content Security Policy)
- [ ] **No CSP Violations**: Check console for CSP errors
- [ ] **Images Load**: Blob URLs work for media uploads
- [ ] **Videos Load**: Blob URLs work for video uploads

### 7.2 API Key Security
- [ ] **Not in localStorage**: Check Application → Local Storage (should only see cache data)
- [ ] **Encrypted Storage**: API key stored in IndexedDB `__encrypted_keys` table
- [ ] **No Plaintext**: Key never visible in Network tab

### 7.3 Network Monitoring
- [ ] **Only Gemini API**: All fetch calls to generativelanguage.googleapis.com
- [ ] **No External Requests**: No other domains contacted
- [ ] **Audit Log Accurate**: All API calls logged correctly

---

## 8. Deployment Tests (Production)

### 8.1 PM2 Deployment
```bash
./manage.sh build
./manage.sh start
```
- [ ] **App Serves**: http://localhost:7392 loads
- [ ] **Static Assets**: Logo, CSS, JS all load
- [ ] **PM2 Status**: `./manage.sh status` shows running
- [ ] **PM2 Logs**: `./manage.sh logs` shows no errors

### 8.2 Nginx Deployment
- [ ] **HTTP → HTTPS Redirect**: http://yourdomain.com → https://yourdomain.com
- [ ] **HTTPS Loads**: Certificate valid
- [ ] **Reverse Proxy**: Proxies to port 7392
- [ ] **No 502 Errors**: App responds correctly

### 8.3 Static Hosting (Netlify/Cloudflare)
- [ ] **Build Succeeds**: `npm run build`
- [ ] **Upload dist/**: All files present
- [ ] **Site Loads**: No 404 errors
- [ ] **SPA Routing**: Direct URLs work (with redirects config)

---

## 9. Regression Checks (Breaking Changes)

### 9.1 Backward Compatibility
- [ ] **Existing Prompts Load**: Old prompts from `prompts` store still accessible
- [ ] **Custom System Prompts**: Stored in localStorage still used
- [ ] **Legacy Mode**: Toggle OFF intermediate mode → works like Phase 8

### 9.2 Migration
- [ ] **DB Upgrade**: v6 → v7 runs without errors
- [ ] **Old Prompts Migrated**: Check `intermediates` store has entries with `migrated_` prefix
- [ ] **No Data Loss**: All old prompts still in `prompts` store

---

## 10. Documentation Verification

- [ ] **README.md**: Accurate quick start instructions
- [ ] **docs/user_guide.md**: All features documented
- [ ] **OPERATIONS.md**: Deployment instructions work
- [ ] **manage.sh**: All commands work (dev, build, start, stop, logs, status)

---

## Test Environment

**OS**: __________ (macOS / Linux / Windows)
**Browser**: __________ (Chrome / Firefox / Safari / Edge)
**Node.js Version**: __________ (`node -v`)
**App Version**: Phase 9 Complete
**Date Tested**: __________

---

## Results Summary

**Total Tests**: _____ / _____
**Passed**: _____
**Failed**: _____
**Blocked**: _____

**Critical Issues**:
-

**Non-Critical Issues**:
-

**Notes**:
-

---

## Quick Smoke Test (5 minutes)

For rapid validation, run these core tests:

1. [ ] App loads, logo visible
2. [ ] Enter API key in Settings
3. [ ] Generate prompt: "A woman walks on a beach" (intermediate mode ON)
4. [ ] Output appears in RightPanel
5. [ ] Switch format: Sora 2 → Veo 3 (instant, no re-generation)
6. [ ] Save to library
7. [ ] Search library (type "beach")
8. [ ] Open intermediate editor, edit timeline
9. [ ] Export & Save
10. [ ] Check DevTools console (no errors)

If all 10 pass → core functionality working ✅

---

**Testing Complete**: __________
**Tester**: __________
**Sign-off**: __________
