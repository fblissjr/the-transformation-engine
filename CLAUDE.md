# The Transformation Engine - Project Overview

> **Last Updated**: 2025-10-11 | **Status**: Privacy & Multi-Tenant Ready

---

## What This Is

A **local-first, client-side web application** for engineering multi-modal prompts for text-to-video AI models (8-10 second clips with audio). Built with React + TypeScript + Vite, using IndexedDB for storage and Gemini API for generation.

**Key Philosophy**: Privacy-first, no backend, no accounts. Everything runs in the browser.

---

## Quick Start

```bash
npm install
npm run dev    # Development server
npm run build  # Production build
```

**Requirements**: Gemini API key (enter in-app, stored encrypted)

---

## Current Architecture (Post Phase 1)

### Context Structure (Split for Performance)
- **PromptLibraryContext** - Prompt CRUD, search, favorites
- **ActivePromptContext** - Current prompt, settings, versions
- **GenerationContext** - LLM calls, loading states
- **MediaContext** - Image/video uploads, vision API

*Backward-compatible `usePrompts()` hook available*

### Storage
- **IndexedDB** (via idb library) - DB v6
  - `prompts` - Prompt library
  - `versions` - Version history
  - `promptConfigs` - System prompts
  - `appSettings` - User settings
  - `media` - Blob storage for images/videos
- **localStorage**
  - `gemini_models_cache` - Models list (24hr TTL)
  - `custom_primary_prompt` - Custom Primary system prompt
  - `custom_mixer_prompt` - Custom Mixer system prompt
  - `custom_normalizer_prompt` - Custom Normalizer system prompt
  - `custom_schema_inference_prompt` - Custom Schema system prompt
  - API response cache (5min TTL)

### Performance Optimizations (Phase 1 Complete)
- Context splitting → 60-80% reduction in re-renders
- Blob storage → 33% reduction in media storage size
- API caching → 40-60% reduction in API costs

### Privacy & Security Architecture

**100% Client-Side Guarantee**:
- All API calls: Browser → Google Gemini (direct, no proxy)
- All data storage: Browser IndexedDB (never uploaded)
- All processing: Client-side JavaScript (no server backend)
- Host sees: Only static file requests (HTML/JS/CSS)

**Encrypted API Key Storage**:
- `services/encryptedStorage.ts` - AES-GCM encryption via Web Crypto API
- Keys encrypted with browser fingerprint (user-agent + language)
- Configurable TTL (default: 7 days, user can adjust)
- Automatic expiration and cleanup
- Never stored in plaintext

**Network Monitoring**:
- `services/networkMonitor.ts` - Intercepts all fetch() calls
- Real-time audit log (last 100 requests)
- Approved domains whitelist (`generativelanguage.googleapis.com` only)
- Detects unexpected network activity
- Export audit logs for verification

**Privacy Dashboard**:
- `components/PrivacyDashboard.tsx` - Transparency UI
- Network activity monitoring (by domain, purpose, media presence)
- Storage usage tracking (IndexedDB quota)
- API key expiration status
- Export audit logs (JSON)
- Verification instructions for users

**Content Security Policy**:
- Strict CSP in `index.html` and `netlify.toml`
- Only whitelists: self + `generativelanguage.googleapis.com`
- Blocks: object-src, frame-ancestors, base-uri hijacking
- Allows: blob/data URIs for media (local only)

**Multi-Tenant Deployment**:
- Users provide their own API keys (encrypted client-side storage)
- Static-only hosting (Netlify/Cloudflare/AWS S3)
- Zero server-side data collection
- GDPR/CCPA compliant by architecture
- See `DEPLOYMENT.md` for full guide

---

## Core Features

### Prompt Generation
- Natural language input → structured output
- Multi-modal support (image/video conditioning)
- Dynamic schema keys with presets (Video Scene, Music, Art Direction)
- AI-powered schema inference (suggest additional keys or full schema)
- Mix options (Reverse, Compress, Expand, Technical, Custom)
- Multiple output formats (YAML, JSON, XML, Markdown)

### Output Transformation
- Flexible transformation engine (not just normalization)
- Presets: Plain English, JSON, Markdown
- Custom transformations via prompt
- No automatic transformation back to plain English unless you request it, since it's another API call

### Prompt Management
- Local-first prompt library
- Search and favorites
- Version history with restore
- Synesthetic mixer (blend 2+ prompts)

### Transparency & Control
- **Prompt Preview**: View assembled system + user prompts before sending
- **Inline Editing**: Edit prompts on-the-fly for one-off changes
- **System Prompt Customization**: Edit all 4 core prompts in Settings
- **Export/Import**: Save and load configurations (settings, mix options, schema keys)
- **Privacy Dashboard**: Real-time network monitoring, audit logs, storage tracking
- **Encrypted Storage**: API keys encrypted with AES-GCM, configurable TTL
- **Privacy-First**: 100% client-side, zero server-side data collection

### Recently Completed

**Phase 1 (Transparency Features)**:
- [x] Settings UI modal (API Key, Model Settings, System Prompts, Data & Cache tabs)
- [x] Full configuration export/import (settings, mix options, schema keys, model)
- [x] System Prompts editing (all 4 prompts editable in Settings)
- [x] Prompt Preview with inline editing (full transparency)
- [x] Models list caching (24hr TTL, prevents disappearing dropdown)
- [x] Mix options system (replaced forwards/backwards with flexible transformations)
- [x] Documentation consolidation (user_guide.md includes everything)

**Phase 2 (Privacy & Multi-Tenant)**:
- [x] Encrypted API key storage (AES-GCM, configurable TTL)
- [x] Network monitoring service (fetch interception, audit logging)
- [x] Privacy Dashboard UI (network activity, storage tracking, audit export)
- [x] Content Security Policy (strict CSP headers)
- [x] Multi-tenant deployment guide (Netlify/Cloudflare/AWS configs)
- [x] Architecture redesign proposals (modular prompts + version control)

### Recent Bug Fixes
- **Models dropdown disappearing**: Fixed useEffect dependency array to include `availableModels.length`, ensuring models reload from cache when state clears
- **Textarea losing focus on edit**: Split useEffect to prevent re-sync during typing in RightPanel
- **System prompts not being used**: Updated promptService to check localStorage for custom prompts before using defaults

### Missing Features (Per Spec)
- [ ] Sharing protocol (URL generation, `/share` route)

---

## Key Files & Documentation

### Core Application
- `App.tsx` - Main layout (3-panel design), network monitor initialization
- `components/` - UI components
  - `LeftPanel.tsx` - Prompt library, search, Import/Export, Privacy button
  - `CenterPanel.tsx` - Input, settings, generation controls
  - `RightPanel.tsx` - Output, versions, transformations
  - `SettingsModal.tsx` - API Key, Model Settings, System Prompts, Data & Cache
  - `PrivacyDashboard.tsx` - Network monitoring, audit logs, privacy verification
- `context/` - Split contexts (4 files)
  - `ApiKeyContext.tsx` - Encrypted key storage with TTL
- `services/` - DB, API, prompt generation, config management
  - `encryptedStorage.ts` - AES-GCM encryption for sensitive data
  - `networkMonitor.ts` - Fetch interception and audit logging

### Configuration
- `constants.ts` - System prompts, defaults, settings
- `types.ts` - TypeScript interfaces
- `vite.config.ts` - Build config
- `netlify.toml` - Netlify deployment config with CSP headers
- `index.html` - CSP meta tags

### Documentation

**Deployment & Privacy**:
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Multi-tenant deployment guide (Netlify/Cloudflare/AWS)

**User Documentation**:
- **[docs/user_guide.md](./docs/user_guide.md)** - Complete user guide (installation, features, settings, troubleshooting)

**Technical Documentation**:
1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical deep dive
2. **[FUNCTIONAL_GUIDE.md](./FUNCTIONAL_GUIDE.md)** - User-focused guide
3. **[ANALYSIS_SUMMARY.md](./ANALYSIS_SUMMARY.md)** - Executive summary
4. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Developer cheat sheet
5. **[TODO.md](./TODO.md)** - Comprehensive optimization roadmap
6. **[PLAN.md](./PLAN.md)** - Phase 1 implementation plan
7. **[PHASE1_TODO.md](./PHASE1_TODO.md)** - Phase 1 task checklist

**Architecture Proposals** (internal/):
1. **[VERSION_CONTROL_ARCHITECTURE.md](./internal/VERSION_CONTROL_ARCHITECTURE.md)** - Git-inspired branching system design
2. **[PROMPT_ARCHITECTURE.md](./internal/PROMPT_ARCHITECTURE.md)** - Modular prompt system design
3. **[JOINT_ARCHITECTURE_PROPOSAL.md](./internal/JOINT_ARCHITECTURE_PROPOSAL.md)** - Unified proposal combining both

---

## System Prompts

Four core prompts (defaults in `constants.ts`, customizable in Settings → System Prompts):

1. **PRIMARY_GENERATION_PROMPT** - Main generation
   - Takes natural language input + settings
   - Outputs structured prompt
   - Enforces "obscuring known figures" rule

2. **MIX_PROMPTS_SYSTEM_PROMPT** - Synesthetic mixer
   - Blends 2+ prompts into hybrid scene
   - User-guided synthesis

3. **NORMALIZE_PROMPT_SYSTEM_PROMPT** - Transformation engine
   - Converts structured → plain language
   - Supports custom transformations

4. **SCHEMA_INFERENCE_PROMPT** - Schema suggestions
   - Suggests additional keys based on input
   - Generates full schemas from scratch

**Customization**: All prompts editable in Settings → System Prompts tab. Custom versions stored in localStorage. Use `{{placeholder}}` syntax for variables. See [docs/user_guide.md](./docs/user_guide.md) for details.

---

## Development Guidelines

### State Management
- Use specific context hooks where possible:
  - `usePromptLibrary()` - LeftPanel
  - `useActivePrompt()` - CenterPanel, RightPanel
  - `useGeneration()` - Generation buttons
  - `useMedia()` - Media uploads
- Fall back to `usePrompts()` for backward compatibility

### Adding Features
1. Check if DB schema change needed (bump `DB_VERSION`)
2. Add types to `types.ts`
3. Add service functions to `services/`
4. Update relevant context
5. Update components

### Performance Considerations
- Contexts are split to minimize re-renders
- Media stored as Blobs (not base64)
- API responses cached (5min-1hr TTL)
- Always consider re-render implications

---

## API Integration

### Gemini API
- Model: `gemini-2.5-pro` (configurable)
- Key from encrypted storage (user-provided, AES-GCM)
- Direct browser → Google API calls
- Cached responses (see `services/apiCache.ts`)

### Cache Strategy
| Operation | TTL | Key Components | Storage |
|-----------|-----|----------------|---------|
| Models List | 24 hours | N/A | localStorage |
| Generation | 5 min | input + settings + media | apiCache |
| Schema Inference | 1 hour | input + existing keys + mode | apiCache |
| Transformation | 5 min | output + instruction | apiCache |

---

## Next Steps

### Phase 2 (TODO.md - Issues #3, #6, #7)
- Implement pagination (unbounded data loading)
- Optimize search with IndexedDB indexing
- Migrate version service to IndexedDB

### Phase 3 (TODO.md - Issue #5)
- Implement sharing protocol (per spec)

### Phase 4 (TODO.md - Issues #8, #9, #10)
- Add input validation (Zod)
- Improve error handling (Error Boundaries)
- Write automated tests (target 70% coverage)

---

## Troubleshooting

### Build Issues
- Ensure `node_modules` installed: `npm install`
- Clear cache: `rm -rf node_modules/.vite`
- Check TypeScript: `npx tsc --noEmit`

### Runtime Issues
- Clear IndexedDB: Dev Tools → Application → IndexedDB → Delete
- Check console for errors
- Verify API key is set

### Storage Issues
- IndexedDB quota: ~50-100MB typical
- Blob storage more efficient than base64
- Run cleanup: `cleanupOrphanedBlobs()` on init

### Models Dropdown Issues
- **Disappearing models list**: Fixed in CenterPanel.tsx with proper useEffect dependencies
- Check localStorage for `gemini_models_cache` (24hr TTL)
- Clear cache: Settings → Data & Cache → Clear Cache
- Models reload automatically when cache expires or state clears

---

## Tech Stack

- **Framework**: React 19.2.0 + TypeScript
- **Build**: Vite 6.3.6
- **Styling**: Tailwind CSS v4
- **Storage**: IndexedDB (idb library)
- **API**: Google Gemini 1.5 Flash
- **Testing**: Vitest (setup, minimal coverage currently)

---

## File Structure

```
the-transformation-engine/
├── components/          # React components
│   ├── LeftPanel.tsx   # Prompt library
│   ├── CenterPanel.tsx # Input & controls
│   ├── RightPanel.tsx  # Output & history
│   └── SettingsModal.tsx # Settings UI (4 tabs)
├── context/            # React contexts (split)
│   ├── PromptContext.tsx (composition)
│   ├── PromptLibraryContext.tsx
│   ├── ActivePromptContext.tsx
│   ├── GenerationContext.tsx
│   └── MediaContext.tsx
├── services/           # Business logic
│   ├── dbService.ts
│   ├── geminiService.ts
│   ├── promptService.ts
│   ├── configService.ts  # Export/import config
│   ├── apiCache.ts
│   └── db/indexedDbService.ts
├── constants.ts        # System prompts, defaults
├── types.ts            # TypeScript interfaces
└── App.tsx             # Main layout

Documentation:
├── CLAUDE.md           # This file
├── docs/user_guide.md  # User documentation
├── ARCHITECTURE.md     # Technical details
├── TODO.md             # Optimization roadmap
└── PLAN.md             # Phase 1 plan
```

---

## Important Notes

1. **No Emojis**: Per user preference, avoid emojis in code/docs
2. **Local-First**: No backend, no accounts, privacy-first
3. **API Key**: User-provided, stored encrypted (AES-GCM, configurable TTL)
4. **Blob Storage**: Use Blobs for media, not base64
5. **Cache-First**: Check apiCache before API calls
6. **Context Splitting**: Use specific hooks to minimize re-renders
7. **Models List Caching**: 24hr localStorage cache with dependency array fix to prevent dropdown disappearing
8. **System Prompts**: Custom prompts in localStorage override constants.ts defaults
9. **Transparency**: All prompts viewable/editable before sending to API

---

## Resources

- [Gemini API Docs](https://ai.google.dev/docs)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

---

**For detailed technical architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
**For optimization roadmap**: See [TODO.md](./TODO.md)
**For Phase 1 details**: See [PLAN.md](./PLAN.md)
- Always read @CLAUDE.md to get up to speed when you lack context. Ask yourself beforehand if you lack context to any request from me. Be concise in your edits and documentation. Aim for simplicity and extensibility. This is a hobbyist project, not a commercial one.