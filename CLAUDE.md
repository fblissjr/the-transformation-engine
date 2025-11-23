# The Transformation Engine - Project Overview

> **Last Updated**: 2025-11-23 | **Status**: v2.2.1-alpha (Image Studio Week 2 + UX Complete, Merged to Dev)

---

## What This Is

An **Any-to-Any transformation application** that treats LLMs as universal transformation engines operating on structured data. Built with React + TypeScript + Vite, currently focused on multi-modal prompts for text-to-video/image AI models, with the architecture designed to support any source → any output transformations.

**Core Philosophy - Structured Data First**:

```
Any Source → LLM Derives Schema → Structured Object → LLM Transforms → Any Output
     ↓                                    ↓                              ↓
  Unstructured                     Modular, Editable              Model-Specific
  (text, images)                   (characters, scenes,            (Veo, Sora,
                                    backgrounds, props,             Gemini, etc.)
                                    camera, audio, etc.)
```

**Key Insight**: LLMs excel at transforming structured data. By keeping everything structured in an intermediate layer, you gain:
- **Consistency**: Edit one character object, affects all scenes using it
- **Experimentation**: Change prompt strategy, test A/B variations
- **Composability**: Mix and match modular objects
- **Versioning**: Track what changed between outputs
- **Modularity**: Objects can be anything - characters, backgrounds, props, camera setups, audio, abstract concepts

**Current Philosophy**: Privacy-first, no accounts, client-side (open to backend if structured data requires it). All transformations happen in the intermediate/structured layer. Final output layer formats for specific models (Veo 3.1, Sora, etc.) or post-processing.

## Guiding Principles

**The most important document for our project**: **[internal/living-docs/02_GUIDING_PRINCIPLES.md](./internal/living-docs/02_GUIDING_PRINCIPLES.md)**

**Principle #0 - Structured Data Above All Else**: Every architectural decision must prioritize structured, modular data that LLMs can transform predictably. Read it, understand it, and follow it.

**For detailed architecture patterns and examples**: **[internal/living-docs/STRUCTURED_DATA_ARCHITECTURE.md](./internal/living-docs/STRUCTURED_DATA_ARCHITECTURE.md)** (coming soon)

---

## Quick Start

```bash
npm install
npm run dev    # Development server
npm run build  # Production build
```

**Requirements**: API key for at least one provider (OpenRouter, OpenAI, Gemini, or local server) - enter in Settings, stored encrypted

---

## Documentation

### For Claude and Myself
**[internal/living-docs/00_INDEX.md](./internal/living-docs/00_INDEX.md)** - Complete technical documentation

**START HERE**: **[internal/living-docs/02_GUIDING_PRINCIPLES.md](./internal/living-docs/02_GUIDING_PRINCIPLES.md)** - Principle #0: Structured Data Above All Else

The living-docs contain modular files covering:
- **Structured Data Architecture** (Any-to-Any transformations, LLM-derived schemas, universal objects) - **[STRUCTURED_DATA_ARCHITECTURE.md](./internal/living-docs/STRUCTURED_DATA_ARCHITECTURE.md)** (coming soon)
- **Architecture & system design** (5-layer model, prompting system)
- **Features & capabilities** (generation, transformations, multi-provider)
- **Development guidelines** (fragment development, best practices)
- **API integration** (multi-provider architecture, task routing)
- **Privacy & security** (client-side, open to backend for structured data)
- **Phase history** (v1.0 → v2.0 evolution)
- **Troubleshooting** (known bugs, solutions)
- **UX Design** (center panel, scene classification, scene extension)
- **Prompting System** (fragments, templates, schema keys)
- **File structure** (organized codebase map)
- **Roadmap** (Phase 3+ features, Intermediate v3.0)

#### Recent Documentation Updates

**Image Studio** (2025-11-23):
- **[internal/living-docs/25_IMAGE_STUDIO.md](./internal/living-docs/25_IMAGE_STUDIO.md)** - Week 2 MVP + UX Quick Wins complete, merged to dev
- **[internal/image-gen-edit/WEEK1_MVP_COMPLETION.md](./internal/image-gen-edit/WEEK1_MVP_COMPLETION.md)** - Week 1 implementation (7 components)
- **[internal/image-gen-edit/WEEK2_COMPLETION_SUMMARY.md](./internal/image-gen-edit/WEEK2_COMPLETION_SUMMARY.md)** - Week 2 implementation (FragmentBrowser, CharacterSelector, 46 fragments)
- **[internal/image-gen-edit/UX_QUICK_WINS_SUMMARY.md](./internal/image-gen-edit/UX_QUICK_WINS_SUMMARY.md)** - UX improvements (keyboard nav, mobile responsive, "Coming Soon" pattern)
- **[internal/gemini_ux_research/](./internal/gemini_ux_research/)** - Gemini's strategic research + experimental POCs (preserved for Phase 4-5)

**Veo 3.1 Integration** (2025-11-20):
- **[internal/veo3/PHASE2.3_COMPLETION_SUMMARY.md](./internal/veo3/PHASE2.3_COMPLETION_SUMMARY.md)** - Phase 2.3 implementation summary (89 new typed options)
- **[internal/veo3/VEO31_DIRECTOR_ARCHITECTURE_ANALYSIS.md](./internal/veo3/VEO31_DIRECTOR_ARCHITECTURE_ANALYSIS.md)** - Architectural analysis (15,000+ words)
- **[internal/veo3/20251120_VEO31_GCP_ANALYSIS.md](./internal/veo3/20251120_VEO31_GCP_ANALYSIS.md)** - Google Cloud prompting guide with examples
- **[internal/veo3/VEO31_COMPREHENSIVE_PROMPTING_GUIDE.md](./internal/veo3/VEO31_COMPREHENSIVE_PROMPTING_GUIDE.md)** - Complete Veo 3.1 prompting reference

**Prompting & UX**:
- **[internal/living-docs/17_PROMPTING_SYSTEM.md](./internal/living-docs/17_PROMPTING_SYSTEM.md)** - Fragment-based architecture
- **[internal/living-docs/22_SCENE_CLASSIFICATION_UX.md](./internal/living-docs/22_SCENE_CLASSIFICATION_UX.md)** - 5D scene classification
- **[internal/living-docs/19_SCHEMA_KEY_ARCHITECTURE.md](./internal/living-docs/19_SCHEMA_KEY_ARCHITECTURE.md)** - Schema key presets & auto-suggestion

### Version History
**[CHANGELOG.md](./CHANGELOG.md)** - Version history and notable changes

### For Users
**[docs/user_guide.md](./docs/user_guide.md)** - User-facing guide

### For Operations
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Multi-tenant deployment
- **[OPERATIONS.md](./docs/OPERATIONS.md)** - Operations guide
- **[TESTING_CHECKLIST.md](./docs/TESTING_CHECKLIST.md)** - Testing procedures
- **[AUTOMATED_TESTING.md](./docs/AUTOMATED_TESTING.md)** - Test automation

### Maintaining Internal Documentation and User Documentation
1. Always update our `./internal` docs after code changes are complete and tested, according to our guiding principles, and ensuring no migration related code is created or exists. Then update @CLAUDE.md with any links that are needed. All docs should be created within `./internal` in an organized manner, then propagated down to `CLAUDE.md` as the index / starting point for Claude.
2. Then finally, propagated down to the `README.md` and `./docs` folder.
3. Both `./internal` (internal docs for Claude and myself) and `./docs` (user-facing documentation for end users) markdown docs should be consolidated when it makes sense to avoid duplication of docs. Modularity is important, but not to an extreme level.

---

## Research & Analysis

### Model Research
- **[internal/sora/](./internal/sora/)** - Sora 2 + GPT-5 methodology research
- **[internal/veo3/](./internal/veo3/)** - Veo 3 + Veo 3.1 research
  - **[20251120_VEO31_GCP_ANALYSIS.md](./internal/veo3/20251120_VEO31_GCP_ANALYSIS.md)** - NEW: Google Cloud official guide analysis with 10 example prompts

### Intermediate v3.0 & Object System
**Status**: Phase 2.3 Complete ✅ | **Phase 5 Next** (UI Components, ~25-30 hours)

**Architecture**: Database v12 with universal object library (10 stores for characters, locations, cameras, props, audio, concepts, etc.)

**Phase 2.3 Complete** (2025-11-20):
- Added 89 typed options across 8 taxonomies (camera angles, lens types, optical effects, cinematic techniques, lighting quality, mood/tone, temporal speed, transitions)
- Created display label infrastructure (95 exhaustive mappings in displayLabels.ts)
- See **[PHASE2.3_COMPLETION_SUMMARY.md](./internal/veo3/PHASE2.3_COMPLETION_SUMMARY.md)** for details

**Implementation Guides**:
- **[PHASE5_QUICKSTART.md](./internal/intermediate-v3/PHASE5_QUICKSTART.md)** - **START HERE** for Phase 5 (UI Components)
- **[IMPLEMENTATION_CHECKLIST_V3.md](./internal/living-docs/IMPLEMENTATION_CHECKLIST_V3.md)** - Complete implementation plan
- **[OBJECT_SYSTEM_SCHEMA.md](./internal/living-docs/OBJECT_SYSTEM_SCHEMA.md)** - API reference
- **[STRUCTURED_DATA_ARCHITECTURE.md](./internal/living-docs/STRUCTURED_DATA_ARCHITECTURE.md)** - Any-to-Any philosophy

### Image Studio
**Status**: Week 2 MVP + UX Quick Wins Complete ✅ | Merged to Dev ✅ | Phase 3 Backend Integration Next

**Architecture**: Consolidated to single Main DB v12 (video + image stores)

**What's Complete**:
- Week 1 MVP: 3-panel workspace, Video|Image mode switcher, 7 components (1,085 lines)
- Week 2 MVP: FragmentBrowser (56 fragments), CharacterSelector (6 characters), progressive disclosure UI (950 lines)
- UX Quick Wins: "Coming Soon" badges, keyboard nav, mobile responsive, test fixes
- Branch: Merged to `dev` (commit 92a4bef), pushed to origin
- Tests: 82/85 passing (3 CenterPanel tests skipped)

**Implementation Guides**:
- **[internal/living-docs/25_IMAGE_STUDIO.md](./internal/living-docs/25_IMAGE_STUDIO.md)** - Complete guide (updated 2025-11-23)
- **[internal/image-gen-edit/WEEK1_MVP_COMPLETION.md](./internal/image-gen-edit/WEEK1_MVP_COMPLETION.md)** - Week 1 summary
- **[internal/image-gen-edit/WEEK2_COMPLETION_SUMMARY.md](./internal/image-gen-edit/WEEK2_COMPLETION_SUMMARY.md)** - Week 2 summary
- **[internal/image-gen-edit/UX_QUICK_WINS_SUMMARY.md](./internal/image-gen-edit/UX_QUICK_WINS_SUMMARY.md)** - UX improvements

**Gemini Research** (Preserved for Future):
- **[internal/gemini_ux_research/](./internal/gemini_ux_research/)** - Strategic research + experimental components (Timeline Editor, Visual Cinematographer, Entity Graph) on `option2-ux` branch for Phase 4-5 reference

**Dataset**: Pico-Banana-400K (35 editing operations) - See **[pico_data/INDEX.md](./internal/image-gen-edit/pico_data/INDEX.md)**

**Next Steps**: Phase 3 - Backend integration (reference images API, advanced settings, character library connection)

### Historical Documentation
- **[internal/history/](./internal/history/)** - Phase completion reports, architecture proposals, planning docs organized by phase and topic

### Bug Documentation
- **[internal/bugs/](./internal/bugs/)** - Documented bugs with investigations, fixes, and diagrams

---

## Important Notes

1. **No Emojis**: Per user preference, avoid emojis in code/docs
2. **API Keys**: User-provided, encrypted storage (AES-GCM)
3. **No Internal Git Adds**: Never git add anything from `/internal/`
4. **NO GIT COMMITS**: Never commit anything to git or stage it, always rely on the developer for this
5. **ZERO Legacy Code**: All generation routes through taskRouter
6. **JSON Mode**: Native JSON generation for structured outputs
7. **NO MIGRATIONS**: Database v11 is fresh-install only - breaking schema changes are acceptable, old data will be lost

---

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind v4
- **Storage**: IndexedDB v11 (unified database: video + image stores, no migrations)
- **LLM Providers**: Gemini 2.5 Flash (default), OpenRouter (with OpenAI + local servers ready)
- **Testing**: Vitest + Playwright (19 unit tests, 25% coverage, E2E ready)

---

**Always read this file to get up to speed. For detailed info, see [living-docs](./internal/living-docs/). This is a hobbyist project - aim for simplicity and extensibility.**
- When finishing a phase of work or larger unit of work, always update @CLAUDE.md with what was done (referring to the relevant docs in @internal that provides the implementation summary) and next steps. Proactively offer to have @agent-internal-docs-coordinator clean up anything no longer relevant or out of date in @CLAUDE.md that can be confusing, or that is already covered in other docs. We should avoid @CLAUDE.md from growing too large, especially if we're keeping good docs in @internal/living-docs and other places.