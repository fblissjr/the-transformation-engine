# The Transformation Engine - Project Overview

> **Last Updated**: 2025-10-12 | **Status**: Privacy & Multi-Tenant Ready | Model-Optimized (Sora 2 + Veo 3) | Modular Fragments LIVE | Version Control Branching LIVE | **Intermediate Architecture LIVE (Phase 9 Complete)**

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
**CRITICAL: Context Provider Order**
```tsx
ApiKeyProvider
  → PromptProvider (composite wrapper)
    → PromptLibraryProvider (independent)
    → ActivePromptProvider (independent)
    → MediaProvider (depends on ActivePromptContext)
    → GenerationProvider (depends on all above)
```

- **PromptLibraryContext** - Prompt CRUD, search, favorites
- **ActivePromptContext** - Current prompt, settings, versions
- **MediaContext** - Image/video uploads, vision API (uses `useActivePrompt()`)
- **GenerationContext** - LLM calls, loading states

*Backward-compatible `usePrompts()` hook available*

**Common Bug**: If MediaProvider wraps ActivePromptProvider, you'll get "useActivePrompt must be used within an ActivePromptProvider" error. MediaProvider MUST be inside ActivePromptProvider.

### Storage
- **IndexedDB** (via idb library) - DB v7
  - `prompts` - Prompt library (legacy YAML storage)
  - `intermediates` - Model-agnostic semantic prompts (NEW in v7)
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
- **Intermediate-first architecture**: Generate model-agnostic semantic structure, transform to any format
- **Instant format switching**: Change export model (Sora 2/Veo 3/Generic) without regenerating
- Multi-modal support (image/video conditioning)
- Dynamic schema keys with presets (Video Scene, Music, Art Direction)
- **Model-specific optimization**: Sora 2 (OpenAI) and Veo 3 (Google) presets
- AI-powered schema inference (suggest additional keys or full schema)
- Mix options (Reverse, Compress, Expand, Technical, Custom)
- Multiple output formats (YAML, JSON, XML, Markdown)
- **Modular fragment system**: Reusable prompt components with @include directives
- **Legacy mode**: Optional direct YAML generation (backward compatible)

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

**Phase 3 (Model-Specific Optimization + Modular Prompts)**:
- [x] Sora 2 doc analysis (spacetime patches, temporal progression, 300-500 words)
- [x] Sora 2 fragment system (4 fragments: technical specs, temporal progression, camera detail, comprehensive detail)
- [x] Sora 2 prompt templates (primary_sora2.md, mixer_sora2.md)
- [x] Sora 2 few-shot system (3 examples: beach walk, camera push, interior product)
- [x] Sora 2 few-shot service integration (keyword-based intelligent selection)
- [x] Veo 3 research and implementation (native audio, 9 elements framework)
- [x] Veo 3 fragment system (5 fragments: technical specs, 9 elements, audio integration, character consistency, cinematic language)
- [x] Veo 3 prompt templates (primary_veo3.md, mixer_veo3.md)
- [x] Veo 3 few-shot system (4 examples: coffee shop, product reveal, nature landscape, urban street)
- [x] Veo 3 few-shot service integration (feature parity with Sora 2)
- [x] MODEL_PRESETS system (generic, sora2, veo3, wan)
- [x] Automatic model detection from schema keys (technical_specs → Sora 2, veo3_specs → Veo 3)
- [x] UI presets for both models (6 Sora 2 + 3 Veo 3 presets)
- [x] Context-aware UI tips (blue for Sora 2, green for Veo 3)
- [x] Fragment composition engine (fragmentLoader.ts with @include directive support)
- [x] V2 prompt generation functions fully integrated into GenerationContext
- [x] Fragment path resolution (fixed from /prompts/ to / for public directory)
- [x] PromptContext backward compatibility (added missing setStructuredOutput, setNormalizedOutput)
- [x] End-to-end testing and verification (TypeScript compilation, build successful)

**Phase 4 (Version Control Branching System)**:
- [x] Added parentVersionId, branchName, fragmentsUsed to VersionNode structure (types.ts)
- [x] Enhanced versionService with createBranch() and getVersionTree() functions
- [x] Built VersionTree component with tree visualization (parent-child relationships)
- [x] Fragment tracking in fragmentLoader (automatic tracking during composition)
- [x] Integrated fragment tracking into GenerationContext (generate, mixPrompts)
- [x] Tree view with collapsible branches, fragment badges, and branch creation UI
- [x] Integrated VersionTree into RightPanel with toggle between list and tree view
- [x] HMR-aware API key restoration (prevents key loss during development)

**Phase 5 (UI Improvements & Model Conversion)**:
- [x] Detailed loading status indicators for all Gemini API operations (CenterPanel, RightPanel)
- [x] Progress bars with animated status messages (generate, mix, transform, schema inference, media description)
- [x] Model conversion system with fragment-based templates (Sora 2 ↔ Veo 3 ↔ Generic)
- [x] Character counter with color-coded warnings (green/yellow/red based on model limits)
- [x] Auto-condense button for prompts exceeding Sora 2's 2500 character limit
- [x] Smart model detection from schema keys (audio-first vs visual-first indicators)
- [x] Optimized schema key presets (removed redundant technical_specs/veo3_specs)
- [x] CSP update to allow blob: URLs for video/audio media (media-src directive)
- [x] Fragment loader supports optional YAML frontmatter (graceful degradation)
- [x] Removed legacy /public/prompts/ directory (consolidated to /core/ and /fragments/)

**Phase 6 (Research-Based Schema Alignment)**:
- [x] Research analysis: 3 Sora 2 docs + Veo 3 official docs
- [x] Created `CANONICAL_SCHEMA_KEYS` in constants.ts with research citations
- [x] Created `sora2_best_practices.md` with good/bad examples
- [x] Created `veo3_best_practices.md` with good/bad examples
- [x] Created `sora2_remix_prompting.md` for surgical edits with temporal targeting
- [x] Research findings: Sora 2 Docs describe future features (storyboard/blending, UIs not in Sora 2 product)
- [x] Actual Sora 2 UI confirmed: Single text input + remix/edit with temporal targeting
- [x] Template detection UI with prominent gradient section showing active model
- [x] Auto-detection from schema keys with manual override toggle
- [x] Updated all UI presets to use canonical keys (7 for Sora 2, 10 for Veo 3)

**Phase 7 (Audio Capability Correction)**:
- [x] Corrected Sora 2 audio assumption: Native video+audio generation (not visual-only)
- [x] Updated constants.ts: PRIMARY_GENERATION_PROMPT and CANONICAL_SCHEMA_KEYS comments
- [x] Updated sora2_best_practices.md: Changed "NO Audio" to "Optional but Recommended"
- [x] Updated sora2_comprehensive_detail.md: Audio guidance corrected
- [x] Updated CenterPanel.tsx: UI labels changed to "Video+Audio" from "Visual-only"
- [x] Updated CLAUDE.md: Sora 2 section reflects native audio generation
- [x] Added audio_design to all 3 Sora 2 examples (beach_walk, camera_push, interior_product)
- [x] Key distinction: Sora 2 audio automatic (optional descriptions), Veo 3 audio required (explicit control)

**Phase 8 (Remove Redundant Technical Specs)**:
- [x] Removed `technical_specs` from CANONICAL_SCHEMA_KEYS.sora2 (UI-controlled, not prompt parameters)
- [x] Removed `veo3_specs` from CANONICAL_SCHEMA_KEYS.veo3 (UI-controlled, not prompt parameters)
- [x] Rationale: Duration/resolution/aspect ratio are UI settings, not text prompt parameters
- [x] Character savings: ~50 characters per prompt (critical for 2500 char limit on Sora 2)
- [x] Updated sora2_best_practices.md: Removed "Technical Specifications" section
- [x] Removed technical_specs from all 3 Sora 2 examples
- [x] Archived sora2_technical_specs.md fragment (obsolete)
- [x] Updated CenterPanel.tsx: All Sora 2 presets (3) and Veo 3 presets (3) now exclude specs
- [x] Sora 2 canonical keys (7): temporal_progression, visual_description, camera_movement, cinematography, lighting, audio_design, style
- [x] Veo 3 canonical keys (9): subject, context, action, style, camera_motion, audio_elements, lighting_mood, background_setting, composition

**Phase 9 (Intermediate Representation Architecture)** - COMPLETE:
- [x] **Phase 9.1: Database Schema**
  - [x] Created IntermediatePrompt TypeScript interfaces (`/types/intermediate.ts`)
  - [x] Added intermediates object store to IndexedDB (DB v7)
  - [x] Created intermediateService.ts with 12 CRUD operations
  - [x] Built migration system (`/services/migrations/v7Migration.ts`)
  - [x] Auto-migration parses existing YAML prompts into intermediate structure
  - [x] Test script validates migration (15 checks, all passing)
- [x] **Phase 9.2: Transformer System**
  - [x] Built sora2Transformer (intermediate → Sora 2 YAML, 2500 char limit)
  - [x] Built veo3Transformer (intermediate → Veo 3 YAML, audio required)
  - [x] Built genericTransformer (intermediate → generic format)
  - [x] Created transformer registry with auto-detection
  - [x] LRU cache system (50 entries, timestamp-based invalidation)
  - [x] Validation checks for all transformers
  - [x] **Markdown intermediate format** - LLM-friendly, forgiving structure
  - [x] **markdownParser.ts** - Parses markdown sections (## Visual, ## Audio, etc.) into typed objects
  - [x] All transformers updated to handle both markdown and legacy JSON formats
- [x] **Phase 9.3: UI for Intermediate Editing**
  - [x] Built IntermediateEditor with tabs (Timeline/Visual/Audio/Camera)
  - [x] Created 7 sub-components (Metadata, Temporal, Visual, Audio, Camera editors)
  - [x] Built FormatExportPanel with live YAML preview
  - [x] Added model selector dropdown (Sora 2, Veo 3, Generic)
  - [x] Character counter with color-coded warnings
  - [x] Copy to clipboard and "Export & Save" to library
  - [x] IntermediateContext for state management
  - [x] Reverse migration service (YAML → Intermediate)
  - [x] Integrated into CenterPanel ("Create from Intermediate" button)
  - [x] **RightPanel Intermediate Tab** - Displays generated intermediate markdown with metadata
- [x] **Phase 9.4: Generation Pipeline Update**
  - [x] Created primary_intermediate.md system prompt (Markdown output format)
  - [x] Added generateIntermediate() to promptService
  - [x] Updated GenerationContext with intermediate mode (default: ON)
  - [x] Added toggle: "Generate as Intermediate (recommended)"
  - [x] Auto-detect target model (audio-rich → Veo 3, temporal → Sora 2)
  - [x] Model selector dropdown with instant format switching
  - [x] "Save to Library" button creates Prompt with current format
  - [x] Legacy mode preserved (toggle OFF for direct YAML generation)
  - [x] **Fragment loader fixes**: Absolute path support (/core/ and /fragments/)
  - [x] **@include parameter parsing**: Extracts variables from @include directives
  - [x] **Single API call generation**: No duplicate input, clean composition
  - [x] TypeScript compiles cleanly, build passes, end-to-end tested
- **Problem Solved**: Format lock-in eliminated - create once, export to any model
- **Architecture**: Three-stage pipeline (Sources → Markdown Intermediate → Target Formats)
- **Key Benefit**: Zero extra API calls for format conversion, instant switching, LLM-friendly format
- **Backward Compatibility**: Legacy YAML mode available, both stores coexist
- **Documentation**: See `/internal/PHASE9_*.md` files for specifications

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
- `constants.ts` - System prompts, defaults, MODEL_PRESETS
- `types.ts` - TypeScript interfaces
- `vite.config.ts` - Build config
- `netlify.toml` - Netlify deployment config with CSP headers
- `index.html` - CSP meta tags

### Modular Prompt System (V2 Fragment-Based)
**How It Works:**
1. Templates in `/public/core/` use `@include[path/to/fragment.md]` directives
2. `fragmentLoader.ts` fetches fragments from `/public/fragments/` and composes them
3. Variables like `{{naturalLanguageInput}}` are interpolated with actual values
4. GenerationContext calls V2 functions (generatePrimaryPromptV2, etc.)
5. Falls back to legacy V1 if custom prompts found in localStorage

**Directory Structure:**
- `public/core/` - Main prompt templates (primary, mixer, normalizer, schema_inference)
  - `primary.md` - Generic template
  - `primary_sora2.md` - Sora 2-optimized (includes temporal progression, few-shot)
  - `primary_veo3.md` - Veo 3-optimized (includes 9 elements, audio, few-shot)
  - `mixer_sora2.md` - Sora 2-optimized mixer
  - `mixer_veo3.md` - Veo 3-optimized mixer
  - `normalizer.md` - Transformation template
  - `schema_inference.md` - Schema suggestion template

- `public/fragments/` - Reusable prompt components
  - `rules/` - Technical specifications
    - `sora2_technical_specs.md` - Duration, resolution, aspect ratio for Sora 2
    - `veo3_technical_specs.md` - Duration, resolution, aspect ratio, fps for Veo 3
    - `obscuring_figures_full.md` - Rule to avoid celebrity names
  - `instructions/` - Guidance fragments
    - Sora 2: `sora2_temporal_progression.md`, `sora2_comprehensive_detail.md`, `sora2_camera_detail.md`, `sora2_few_shot.md`
    - Veo 3: `veo3_nine_elements.md`, `veo3_audio_integration.md`, `veo3_character_consistency.md`, `veo3_cinematic_language.md`, `veo3_few_shot.md`
    - Generic: `format_constraints.md`, `output_purity.md`
  - `examples/` - Few-shot examples (7 total)
    - Sora 2: `sora2_beach_walk.md` (outdoor/nature), `sora2_camera_push.md` (urban/city), `sora2_interior_product.md` (product showcase)
    - Veo 3: `veo3_coffee_shop.md` (dialogue/narrative), `veo3_product_reveal.md` (commercial/voiceover), `veo3_nature_landscape.md` (epic landscape), `veo3_urban_street.md` (documentary)
  - `roles/` - Expert role templates
    - `expert_role_template.md` - Defines AI persona with variables for expertise, capabilities, domain

**Services:**
- `services/fragmentLoader.ts` - Fragment composition engine
  - `loadFragment(path)` - Fetches fragment, resolves nested @includes recursively
  - `composePrompt(template, variables)` - Resolves includes + interpolates variables
- `services/fewShotService.ts` - Intelligent example selection
  - `SORA2_EXAMPLE_REGISTRY` - 3 Sora 2 examples with keyword metadata
  - `VEO3_EXAMPLE_REGISTRY` - 4 Veo 3 examples with keyword metadata
  - `selectFewShotExamples(input, maxExamples, model)` - Scores by keyword overlap, returns top N
  - `shouldUseFewShot(schemaKeys)` - Returns 'sora2' | 'veo3' | null based on detected keys

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

**Model-Specific Research** (internal/):
- **Sora 2 Research** (internal/sora/):
  1. **[SORA2_DOC_ANALYSIS.md](./internal/sora/SORA2_DOC_ANALYSIS.md)** - Doc US_2025259362_A1 (Prompt Editor)
  2. **[US_2025259361_STORYBOARD_ANALYSIS.md](./internal/sora/US_2025259361_STORYBOARD_ANALYSIS.md)** - Doc US_2025259361_A1 (Storyboard UI)
  3. **[US_2025259272_BLENDING_ANALYSIS.md](./internal/sora/US_2025259272_BLENDING_ANALYSIS.md)** - Doc US_2025259272_A1 (Blending UI)
  4. **[SORA_TODO.md](./internal/sora/SORA_TODO.md)** - Implementation roadmap based on doc analysis
- **Veo 3 Research** (internal/veo3/):
  1. **[VEO3_RESEARCH_ANALYSIS.md](./internal/veo3/VEO3_RESEARCH_ANALYSIS.md)** - Official docs + academic research

**Architecture Proposals** (internal/):
1. **[VERSION_CONTROL_ARCHITECTURE.md](./internal/VERSION_CONTROL_ARCHITECTURE.md)** - Git-inspired branching system design
2. **[PROMPT_ARCHITECTURE.md](./internal/PROMPT_ARCHITECTURE.md)** - Modular prompt system design
3. **[JOINT_ARCHITECTURE_PROPOSAL.md](./internal/JOINT_ARCHITECTURE_PROPOSAL.md)** - Unified proposal combining both

---

## System Prompts

### Legacy System Prompts (constants.ts)
Four core prompts (defaults in `constants.ts`, customizable in Settings → System Prompts):

1. **PRIMARY_GENERATION_PROMPT** - Main generation (legacy, replaced by V2 system)
2. **MIX_PROMPTS_SYSTEM_PROMPT** - Synesthetic mixer (legacy)
3. **NORMALIZE_PROMPT_SYSTEM_PROMPT** - Transformation engine
4. **SCHEMA_INFERENCE_PROMPT** - Schema suggestions

**Customization**: All prompts editable in Settings → System Prompts tab. Custom versions stored in localStorage. Use `{{placeholder}}` syntax for variables.

### V2 Modular Prompt System (Fragment-Based)

**Status**: ✅ Fully integrated and functional (Day 2 complete)

**How Prompts Are Generated**:
1. User triggers generation (Primary, Mix, Normalize, or Schema Inference)
2. `GenerationContext` calls V2 function (e.g., `generatePrimaryPromptV2`)
3. `promptService.ts` detects target model from schema keys:
   - `veo3_specs` → Veo 3
   - `technical_specs` → Sora 2
   - Default → Generic
4. Loads model-specific template from `/public/core/{templateName}{suffix}.md`
5. `fragmentLoader.composePrompt()` resolves all `@include[...]` directives recursively
6. If few-shot enabled, `fewShotService.selectFewShotExamples()` picks relevant examples based on keyword scoring
7. Variables ({{naturalLanguageInput}}, {{format}}, {{fewShotExamples}}, etc.) interpolated
8. Composed prompt sent to Gemini API

**Backward Compatibility**: If custom prompt found in localStorage, falls back to legacy V1 function (original monolithic strings).

**Model-Specific Templates**:
- `public/core/primary.md` - Generic template (fallback)
- `public/core/primary_sora2.md` - Sora 2 optimized (spacetime patches, temporal progression, few-shot)
- `public/core/primary_veo3.md` - Veo 3 optimized (native audio, 9 elements framework, few-shot)
- `public/core/mixer_sora2.md` - Sora 2 mixer
- `public/core/mixer_veo3.md` - Veo 3 mixer
- `public/core/normalizer.md` - Transformation engine
- `public/core/schema_inference.md` - Schema suggestions

**Fragment Categories**:
- **Rules** (3): Technical specs for Sora 2/Veo 3, obscuring celebrities rule
- **Instructions** (11): Model-specific guidance (temporal, audio, 9 elements, camera, etc.)
- **Examples** (7): Few-shot examples for both models (keyword-scored selection)
- **Roles** (1): Expert persona template

**Model Detection Logic** (`promptService.ts:230-248`):
```typescript
if (keys.includes("veo3_specs")) return "veo3";
if (keys.includes("technical_specs")) return "sora2";
return "generic";
```

**Few-Shot System**:
- Sora 2: 3 examples covering outdoor/urban/product scenarios
- Veo 3: 4 examples covering narrative/commercial/landscape/documentary scenarios
- Intelligent selection: Scores examples by keyword overlap (scene type: 3pts, camera: 2pts, subject: 2pts, general: 1pt)
- Returns top 2 examples by default, formatted with separator

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

## Model-Specific Optimization Details

### Sora 2 (OpenAI)
**Research Sources** (3 OpenAI docs analyzed):
- Doc US_2025259362_A1: Prompt Editor (spacetime patches, comprehensive prompts)
- Doc US_2025259361_A1: Storyboard UI (frame-by-frame temporal control) - **FUTURE FEATURE**
- Doc US_2025259272_A1: Blending UI (dual-input video blending) - **FUTURE FEATURE**

**Actual Product** (confirmed via screenshots):
- **Text-to-Video**: Single text input "Describe your video..."
- **Remix/Edit**: Single text input "Describe changes..." + video upload (supports temporal targeting)
- **No storyboard timeline, no multi-frame input, no blend curves yet**

**Key Insights**:
- **Architecture**: Diffusion-transformer with spacetime patches (4D: height × width × time)
- **Inference**: Entire video generated simultaneously (not frame-by-frame)
- **Training**: Fine-tuned on comprehensive image-to-text captions (300-500 words)
- **Audio**: Native video+audio generation (sound effects, music, dialogue generated automatically; explicit audio descriptions optional but can enhance soundtrack)
- **Optimal Prompts**: 300-500 words with embedded temporal progression (0-3s, 3-7s, 7-10s)
- **API Limit**: 2500 characters (hard limit, prompts truncated)
- **Technical Specs**: Fixed UI parameters (10s duration, 1920x1080 resolution, aspect ratio toggle) - NOT prompt parameters
- **Remix Feature**: Supports temporal targeting ("At 3 seconds, change X", "From 2-5 seconds, transform Y")

**Implementation**:
- 3 Sora 2-specific fragments (temporal progression, camera detail, comprehensive detail)
- 3 few-shot examples with keyword-based selection (all include audio_design)
- 1 best practices guide (sora2_best_practices.md) with good/bad examples
- 1 remix prompting guide (sora2_remix_prompting.md) with 6 patterns
- UI presets: Cinematic, Social Media, Product Demo (all use canonical keys)
- Canonical schema keys (7 keys): temporal_progression, visual_description, camera_movement, cinematography, lighting, audio_design, style

### Veo 3 (Google)
**Research Sources**:
- Google AI API Documentation (official prompt guide, technical specs)
- VEO3_RESEARCH_ANALYSIS.md (consolidates official docs + academic research)
- Academic papers: 1 peer-reviewed + 4 foundational papers

**Key Insights**:
- **Native Audio Generation**: Dialogue, ambient sounds, music (40+ multilingual voices with lip-sync via V2A system)
- **9 Elements Framework**: Our expansion of Google's official 6-element framework
  - Official 6: Subject, Action, Style, Camera, Composition, Ambiance
  - Our 9: Adds Context, Audio Elements, separates Lighting/Background (documented in veo3_nine_elements.md)
- **Character Consistency**: Detailed descriptions (30-50 words) maintain visual continuity across generations
- **Narrative-Driven**: Responds exceptionally well to story structure within 8-second clips (beginning/middle/end)
- **Negative Prompting**: Describe alternatives instead of using "no/don't" language
- **Resolution**: Up to 4K (default 720p @ 24fps)
- **Optimal Prompts**: 200-400 words with narrative arc, **ALWAYS include audio elements**

**Implementation**:
- 4 Veo 3-specific fragments (9 elements, audio integration, character consistency, cinematic language)
- 8 few-shot examples (4 narrative + 4 audio-focused)
- 1 best practices guide (veo3_best_practices.md) with good/bad examples
- UI presets: Narrative Scene, Cinematic Landscape, Product Demo (all use canonical keys)
- Canonical schema keys (9 keys): subject, context, action, style, camera_motion, audio_elements, lighting_mood, background_setting, composition

### MODEL_PRESETS System (constants.ts)
```typescript
{
  generic: { maxOutputTokens: 2048, recommendedLength: "1500 characters", lengthGuidance: "Be concise..." },
  sora2: { maxOutputTokens: 4096, recommendedLength: "300-500 words", lengthGuidance: "Comprehensive detail...", technicalSpecs: {...} },
  veo3: { maxOutputTokens: 3072, recommendedLength: "200-400 words", lengthGuidance: "Native audio...", technicalSpecs: {...} },
  wan: { maxOutputTokens: 2048, recommendedLength: "150-300 words", lengthGuidance: "Balanced detail..." }
}
```

### Comparison: Sora 2 vs Veo 3
| Feature | Sora 2 | Veo 3 |
|---------|--------|-------|
| **Audio** | Native video+audio (automatic) | Native audio-first (V2A, explicit) |
| **Duration** | 10 seconds | 8 seconds |
| **Resolution** | Up to 1080p | Up to 4K (default 720p) |
| **Prompt Style** | Temporal progression, spacetime | Narrative-driven, 9 elements |
| **Optimal Length** | 300-500 words | 200-400 words |
| **Key Differentiator** | Comprehensive visual detail | Audio-first storytelling |

---

## Next Steps

### Phase 4 (Version Control Branching - HIGH PRIORITY)
**Goal**: Implement git-inspired branching system for prompt experimentation
- Add parentVersionId and branchName to VersionNode structure
- Build simple tree view showing version relationships
- Basic branch creation UI
- Connect fragments to version system (track which fragments were used in each version)
- See internal/JOINT_ARCHITECTURE_PROPOSAL.md for full spec

**Estimated**: 3-5 days (simplified, incremental approach for hobbyist project)

### Phase 5 (Additional Models)
- Add Wan Video (Alibaba) optimization (fragments + presets)
- Research and implement other emerging models

### Phase 6 (Performance & Scalability - TODO.md - Issues #3, #6, #7)
- Implement pagination (unbounded data loading)
- Optimize search with IndexedDB indexing
- Migrate version service to IndexedDB

### Phase 7 (Sharing Protocol - TODO.md - Issue #5)
- Implement sharing protocol (per spec)

### Phase 8 (Quality & Polish - TODO.md - Issues #8, #9, #10)
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
- **API**: Google Gemini (Default 2.5 Flash)
- **Testing**: Vitest (setup, minimal coverage currently)

---

## File Structure

```
the-transformation-engine/
├── components/          # React components
│   ├── LeftPanel.tsx   # Prompt library
│   ├── CenterPanel.tsx # Input & controls (6 Sora 2 + 3 Veo 3 presets)
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
│   ├── promptService.ts      # V1 + V2 (fragment-based) functions
│   ├── fragmentLoader.ts     # Fragment composition engine
│   ├── fewShotService.ts     # Intelligent example selection
│   ├── configService.ts      # Export/import config
│   ├── apiCache.ts
│   └── db/indexedDbService.ts
├── public/
│   ├── core/                 # Main prompt templates
│   │   ├── primary.md
│   │   ├── primary_sora2.md
│   │   ├── primary_veo3.md
│   │   ├── mixer_sora2.md
│   │   └── mixer_veo3.md
│   └── fragments/            # Reusable prompt components
│       ├── rules/            # Technical specs (sora2, veo3)
│       ├── instructions/     # Guidance fragments
│       ├── examples/         # Few-shot examples
│       └── roles/            # Expert role templates
├── constants.ts        # System prompts, MODEL_PRESETS
├── types.ts            # TypeScript interfaces
└── App.tsx             # Main layout

Documentation:
├── CLAUDE.md                 # This file
├── docs/user_guide.md        # User documentation
├── ARCHITECTURE.md           # Technical details
├── TODO.md                   # Optimization roadmap
├── PLAN.md                   # Phase 1 plan
└── internal/
    └── sora/                 # Sora 2 analysis
    └── veo3/                 # Veo 3 analysis
```

---

## Important Notes

1. **No Emojis**: Per user preference, avoid emojis in code/docs
2. **Local-First**: No backend, no accounts, privacy-first
3. **API Key**: User-provided, stored encrypted (AES-GCM, configurable TTL)
4. **Blob Storage**: Use Blobs for media, not base64
5. **Cache-First**: Check apiCache before API calls
6. **Context Splitting**: Use specific hooks to minimize re-renders
7. **Context Provider Order**: CRITICAL - MediaProvider must be inside ActivePromptProvider (see bug fix above)
8. **Models List Caching**: 24hr localStorage cache with dependency array fix to prevent dropdown disappearing
9. **System Prompts**: Custom prompts in localStorage override constants.ts defaults (backward compatibility)
10. **Transparency**: All prompts viewable/editable before sending to API
11. **Model-Specific Optimization**: Automatic detection and template selection based on schema keys
12. **Modular Fragments**: V2 system uses @include directives in templates, fully integrated into GenerationContext
13. **Few-Shot Learning**: Intelligent keyword-based example selection for both Sora 2 and Veo 3
14. **IndexedDB Queries**: Use `getAll()` + `find()` for boolean fields, not `getAllFromIndex()` with boolean values

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
- We should never commit anything from @internal/
