# The Transformation Engine - Project Overview

> **Last Updated**: 2025-11-17 | **Status**: v2.1.0-alpha (Veo 3.1 Integration In Progress)

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

#### Recent Documentation Updates (2025-11-10)

**Comprehensive Veo 3.1 Research**:
- **[internal/veo3/VEO31_COMPREHENSIVE_PROMPTING_GUIDE.md](./internal/veo3/VEO31_COMPREHENSIVE_PROMPTING_GUIDE.md)** - Definitive Veo 3.1 prompting guide
  - All generation methods (text-to-video, first frame, interpolation, ingredients, extend)
  - Timestamp vs continuous narrative strategies
  - Nano Banana + Imagen 4 integration
  - Scene type optimization
  - 50+ example prompts

**Prompting System Architecture**:
- **[internal/living-docs/17_PROMPTING_SYSTEM.md](./internal/living-docs/17_PROMPTING_SYSTEM.md)** - Fragment-based architecture
- **[internal/living-docs/18_FRAGMENT_DEVELOPMENT.md](./internal/living-docs/18_FRAGMENT_DEVELOPMENT.md)** - Creating fragments guide
- **[internal/living-docs/19_BEST_PRACTICES_DERIVATION.md](./internal/living-docs/19_BEST_PRACTICES_DERIVATION.md)** - Research methodology

**UX Design Specifications**:
- **[internal/living-docs/21_CENTER_PANEL_UX_REDESIGN.md](./internal/living-docs/21_CENTER_PANEL_UX_REDESIGN.md)** - Center panel improvements
- **[internal/living-docs/22_SCENE_CLASSIFICATION_UX.md](./internal/living-docs/22_SCENE_CLASSIFICATION_UX.md)** - Multi-dimensional scene classification (5 dimensions × 100+ tags)
- **[internal/living-docs/23_SCENE_EXTENSION_PHASE1_UX.md](./internal/living-docs/23_SCENE_EXTENSION_PHASE1_UX.md)** - Scene extension Phase 1 MVP

**Schema Key Architecture**:
- **[internal/living-docs/19_SCHEMA_KEY_ARCHITECTURE.md](./internal/living-docs/19_SCHEMA_KEY_ARCHITECTURE.md)** - Global presets, custom sets, auto-suggestion

**Updated Guiding Principles** (2025-11-17):
- **[internal/living-docs/02_GUIDING_PRINCIPLES.md](./internal/living-docs/02_GUIDING_PRINCIPLES.md)** - **Principle #0: Structured Data Above All Else** (foundational principle)
  - LLMs as transformation engines operating on structured data
  - Any-to-Any architecture: objects can be characters, backgrounds, props, camera setups, audio, abstract concepts
  - LLM-derived schemas for universal object editing
  - Comprehensive examples and anti-patterns

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

### Intermediate v3.0 & Object System (NEW - 2025-11-17)
**Status**: Phase 4 Complete (Transformers) ✅ | Phase 5 Next (UI Components)

**Architecture Change (v11 → v12)**: Added universal object library with 10 new stores for structured, reusable objects.

**🚀 START HERE for Next Claude**:
- **[internal/intermediate-v3/PHASE5_QUICKSTART.md](./internal/intermediate-v3/PHASE5_QUICKSTART.md)** - **START HERE** for Phase 5 (UI Components)

**Phase Guides** (Quickstart documentation):
- **[internal/intermediate-v3/PHASE3_QUICKSTART.md](./internal/intermediate-v3/PHASE3_QUICKSTART.md)** - Phase 3 reference (services complete)
- **[internal/intermediate-v3/PHASE4_QUICKSTART.md](./internal/intermediate-v3/PHASE4_QUICKSTART.md)** - Phase 4 reference (transformers complete)
- **[internal/intermediate-v3/PHASE5_QUICKSTART.md](./internal/intermediate-v3/PHASE5_QUICKSTART.md)** - Phase 5 guide (UI components)
- **[internal/intermediate-v3/PHASE6_QUICKSTART.md](./internal/intermediate-v3/PHASE6_QUICKSTART.md)** - Phase 6 guide (testing & polish)
- **[internal/intermediate-v3/PHASE7_QUICKSTART.md](./internal/intermediate-v3/PHASE7_QUICKSTART.md)** - Phase 7 guide (Image Studio integration, optional)
- **[internal/intermediate-v3/PHASE8_QUICKSTART.md](./internal/intermediate-v3/PHASE8_QUICKSTART.md)** - Phase 8 guide (collaboration features, optional)

**Design References**:
- **[internal/living-docs/IMPLEMENTATION_CHECKLIST_V3.md](./internal/living-docs/IMPLEMENTATION_CHECKLIST_V3.md)** - Complete implementation plan with task breakdown
- **[internal/living-docs/OBJECT_SYSTEM_SCHEMA.md](./internal/living-docs/OBJECT_SYSTEM_SCHEMA.md)** - Complete API reference
- **[internal/living-docs/TRANSFORMER_PSEUDOCODE_V3.md](./internal/living-docs/TRANSFORMER_PSEUDOCODE_V3.md)** - Transformer pseudocode

**Design Documents**:
- **[internal/living-docs/STRUCTURED_DATA_ARCHITECTURE.md](./internal/living-docs/STRUCTURED_DATA_ARCHITECTURE.md)** - Any-to-Any philosophy and patterns
- **[internal/living-docs/INTERMEDIATE_V3_INTERFACES.md](./internal/living-docs/INTERMEDIATE_V3_INTERFACES.md)** - TypeScript interface specs

**What's Done** (Phase 1, 2, 3 & 4):
- ✅ Complete design & documentation (7 docs, 8-week plan)
- ✅ Database v12 with 10 new stores (characterObjects, locationObjects, cameraObjects, propObjects, audioObjects, conceptObjects, customObjects, objectVersions, objectChangelogs, objectRelationships)
- ✅ TypeScript types (5 new files: componentTypes, audioTypes, objectTypes, promptingTypes, IntermediateV3)
- ✅ ObjectLibraryService (800+ lines, full CRUD + versioning + linking + relationships)
- ✅ ObjectSearchService (350+ lines, 5 search methods + statistics)
- ✅ 3 LLM tasks (deriveSchemaTask, extractObjectTask, editObjectTask)
- ✅ Task IDs registered (LLM_DERIVE_SCHEMA, LLM_EXTRACT_OBJECT, LLM_OBJECT_EDIT)
- ✅ TransformerUtils (400+ lines, shared formatting + resolution utilities)
- ✅ 8 Transformers (IntermediateV3 → Model-Specific):
  - Veo3ContinuousTransformer, Veo3AttributeValueTransformer, Veo3TimestampTransformer
  - Veo3AudioTransformer, Veo3StructuredTransformer
  - Sora2NarrativeTransformer, Sora2TechnicalTransformer
  - GenericTransformer
- ✅ Unit test skeleton (24 test cases for ObjectLibraryService)
- ✅ Build passes, no TypeScript errors

**What's Next** (Phase 5 - UI Integration, ~25-30 hours):
- 🔨 Object Library UI (browse, create, edit, delete objects)
- 🔨 Object Picker components (select objects for scene components)
- 🔨 Version History UI (view/revert object versions)
- 🔨 Transformer Selection UI (choose output format)
- 🔨 Scene Builder UI (compose scenes with object references)

### Image Studio (NEW - 2025-11-16)
**Status**: Phase 1 Complete (Database Consolidated) ✅ | Phase 2 Next (UI Components)

**Architecture Change (v10 → v11)**: Consolidated from dual-database to single Main DB with image stores.

**Quick Start for Next Claude**:
- **[docs/IMAGE_STUDIO_README.md](./docs/IMAGE_STUDIO_README.md)** - Quick overview and where to start (5 min read)
- **[internal/image-gen-edit/IMPLEMENTATION_STATUS.md](./internal/image-gen-edit/IMPLEMENTATION_STATUS.md)** - Complete implementation guide (15 min read)

**Dataset & Research**:
- **[internal/image-gen-edit/pico_data/INDEX.md](./internal/image-gen-edit/pico_data/INDEX.md)** - Pico-Banana-400K dataset navigation
- **[internal/image-gen-edit/pico_data/QUICK_REFERENCE.md](./internal/image-gen-edit/pico_data/QUICK_REFERENCE.md)** - 35 editing operations, statistics
- **[internal/image-gen-edit/pico_data/DATASET_ANALYSIS.md](./internal/image-gen-edit/pico_data/DATASET_ANALYSIS.md)** - Complete technical analysis

**What's Done**:
- ✅ Single unified database (Main DB v11: video + image stores)
- ✅ Unified schema patterns (Date objects, `title`, `created/modified`)
- ✅ Complete service layer (imageDbService, imageGenerationService)
- ✅ Task router integration (executeImageGeneration, executeImageEdit)
- ✅ Deleted crossWorkspaceService (native IndexedDB transactions instead)

**What's Next** (Phase 2):
- **[internal/image-gen-edit/PHASE2_QUICKSTART.md](./internal/image-gen-edit/PHASE2_QUICKSTART.md)** - Quick start guide (5 min read)
- **[internal/image-gen-edit/NEXT_STEPS.md](./internal/image-gen-edit/NEXT_STEPS.md)** - Comprehensive roadmap (15 min read)
- Update test mocks for consolidated database
- Build 5 React components (ImageLibraryPanel, ImageGenerateForm, ImageOutputPanel)
- Import 10 Pico-Banana templates (optional)
- Wire up image → video first frame workflow
- Achieve 65% test coverage

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

---

## Current Implementation Status (v2.1.0-alpha)

### Completed Features (100%)

**Veo 3.1 Backend Integration**:
- 8 schema key presets (Veo 3.1 Standard/Timestamp/Dialogue/Cinematic/Animation, Sora 2, Generic)
- 20 transition patterns across 6 categories (Camera-Based, Natural, Match-Cut, Environmental, Creative, Compound)
- 5D scene classification system (Genre, Format, Visual Style, Camera, Narrative - 100+ tags)
- Auto-suggestion engine with 7 rules (scene type to optimal preset)
- Fragment-based transition system (26 fragment files in `/public/veo3/`)

**Services** (3 new, 273+355+189 lines):
- `services/schemaKeyService.ts` - Preset management, auto-suggestion, custom preset CRUD (273 lines)
- `services/transitionPatternService.ts` - Pattern search, fragment loading, 20 patterns (355 lines)
- `contexts/SceneClassificationContext.tsx` - React state management, localStorage persistence (189 lines)

**UI Components** (5 new, 83% complete):
- `TransitionPatternSelector` - Pattern browser with search/preview (350 lines)
- `SchemaKeyPresetSelector` - Preset management with auto-suggestions (420 lines)
- `SceneClassificationPanel` - 5D accordion with 100+ tags (380 lines)
- `TimestampPromptToggle` - Prompting strategy selector (200 lines)
- `SceneTree` - Hierarchical scene visualization (280 lines)

**Fragment Files** (26 total):
- 20 transition patterns (`/public/veo3/transitions/01-20_*.md`)
- 1 timestamp template (`timestamp_template_8s.md`)
- 3 scene type templates (dialogue, cinematic, animation)
- 1 schema presets JSON (`schema_presets.json`)

### In Progress (Integration Work Pending)

**UI Integration** (4 chunks remaining):
- Update `IntermediateCard` with "Extend This Scene" button
- Integrate components into `CenterPanel` Advanced Settings section
- Integrate `SceneTree` into `LeftPanel` Scenes tab
- Integrate `TransitionPatternSelector` into `SceneExtensionDialog`
- Replace component mock data with real services

**Phase 3** (Not Started):
- Automated testing suite (E2E + integration, 45% coverage target)
- One-shot generation (intermediate + final output simultaneously)
- Clean YAML output (remove code fences from transformers)
- Documentation updates (user guide, implementation notes)

**Implementation Roadmap**: `/docs/plans/2025-11-11-complete-implementation-roadmap.md`

---

## Recent Changes (v2.0.6 - Bug Fixes & Testing Sprint)

**Critical Bug Fixes** (2025-11-11):
- **Fixed Structured View Persistence**: Changes in Structured View now save to database and regenerate Final Output
  - Implemented `onUpdate` handler in `RightPanel.tsx` (was TODO stub)
  - Updates call `updateIntermediate()` and `transformToModel()`
  - Local state tracks changes for immediate UI feedback
- **Fixed Transform Buttons**: Model-specific transforms (→ Sora 2, → Veo 3, → Generic) now work correctly
  - Buttons use `structuredViewData` (Phase 2 JSON) instead of `structuredOutput` (Phase 1 string)
  - Auto-switch to Final Output tab after transformation
- **Verified Working**: Mix Options, Extend button feedback, Refine suggestions all confirmed functional

**Automated Testing Suite** (2025-11-11):
- **Test Infrastructure**: Vitest + fake-indexeddb + React Testing Library
  - `vitest.config.ts` - Full coverage reporting setup
  - `tests/setup.ts` - Mocked Gemini API, browser APIs (matchMedia, clipboard)
  - `tests/utils/test-utils.tsx` - React component test utilities
- **19 Unit Tests Passing**:
  - Transformer tests (6) - Format transformations, edge cases
  - Intermediate service tests (13) - CRUD operations, metadata, errors
  - IndexedDB tests (5 existing) - Database operations
- **Test Scripts**: `npm run test:run`, `npm run test:ui`, `npm run test:coverage`
- **Implementation Plan**: `docs/plans/2025-11-11-automated-testing-suite.md` - E2E and integration tests ready to implement

**Scene Extension Phase 1** (Complete - 2025-11-10):
- **UI Integration**: LeftPanel tabs (Prompts | Scenes), IntermediatesView, IntermediateCard
- **Delete System**: DeleteWithChildrenDialog with orphan/cascade options
- **Toast Notifications**: Success/error feedback for all operations
- **Tree View**: Parent/child indicators (↳ S2), orphaned scene warnings

See [CHANGELOG.md](./CHANGELOG.md) for complete details.

---

## Previous Changes (v2.0.5 - Documentation Sprint)

**Major Documentation Overhaul** (2025-11-10):
- **Comprehensive Veo 3.1 Research**: Complete prompting guide with 50+ examples, all generation methods, scene type optimization
- **Prompting System Documentation**: Fragment architecture, development guide, best practices derivation methodology
- **UX Design Specifications**: Center panel redesign, multi-dimensional scene classification (5D taxonomy with 100+ tags), scene extension Phase 1
- **Schema Key Architecture**: Global presets (Veo 3.1 Standard/Timestamp, Sora 2, Generic), custom sets, auto-suggestion system
- **Updated Guiding Principles**: Added Principle #13 (Intermediate is Model-Agnostic and Unconstrained)
- **Living Docs Expansion**: 7 new documentation files, comprehensive cross-referencing

**Key Features Designed** (implementation pending):
- Multi-dimensional scene classification with preset + custom tag combinations
- Scene extension (Continue/Cut To/Transition methods) with smart preservation
- Schema key auto-suggestion based on scene type + output format
- Timestamp vs continuous narrative prompting strategies

## Previous Changes (v2.0.4)

- **Vision/Multimodal Support**: Media analysis now fully integrated with task assignment system
  - `MEDIA_DESCRIPTION` task configurable in Task Assignment tab
  - Checks if selected model supports vision, throws helpful error if not
  - All 9 tasks now route through taskRouter with proper provider/model selection
- **"Assign to All Tasks" Button**: Fixes model selection not taking effect
  - One-click button in Model Selection tab to apply global default to all tasks
  - Solves task assignment caching issue
- **Dead Code Cleanup**: Removed ~500 lines of unused legacy code
  - Deleted `services/geminiService.ts` (superseded by multi-provider architecture)
  - Removed hardcoded model fallbacks and unused parameters
  - All generation paths now validated to use task assignments
- **Default Model Selection**: New Gemini providers default to `gemini-flash-latest` instead of preview models

## Previous Changes (v2.0.2-v2.0.3)

- Fixed remaining obsolete `apiKey` checks blocking generation
- Removed "Set Default" button from Providers tab (was causing unintended overrides)
- Updated default temperature/top-P for all tasks
- Privacy dashboard improvements

See [CHANGELOG.md](./CHANGELOG.md) for complete version history.
