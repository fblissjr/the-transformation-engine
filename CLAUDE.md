# The Transformation Engine - Project Overview

> **Last Updated**: 2026-01-05 | **Status**: PHASE 2 FRAGMENT SELECTOR MIGRATION COMPLETE - 80 tests passing

---

## Quick Start (New Session)

**"Let's continue where we left off"** → Read: **[internal/living-docs/SESSION_CONTINUITY.md](./internal/living-docs/SESSION_CONTINUITY.md)**

This single-page guide provides:
- Current phase and status
- What was done in the v13 refactor
- Next immediate tasks
- Essential files to read (prioritized)
- Quick commands (npm run dev, test, build)

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

## 1. CRITICAL OPERATIONAL RULES
- **NO EMOJIS:** Strictly avoid emojis in all output, code, docs, and research.
- **Tooling:**
  - **Python:** ALWAYS use `uv` (`uv add`, `uv run`, `uv sync`). Do NOT use `pip` or `python` directly.
  - **Search:** ALWAYS use `ripgrep` (`rg`) for file searches.
- **Git & Version Control:**
  - **NO Auto-Commits:** NEVER commit or stage files automatically. Rely on the user.
  - **No Internal Git Adds:** Never `git add` anything from `/internal/`.
- **Architecture Constraints:**
  - **Zero Legacy Code:** All generation routes through `taskRouter`.
  - **JSON Mode:** Use native JSON generation for structured outputs.
  - **Data Safety:** Main DB v14 (19 stores). Fresh-install only (NO MIGRATIONS). Breaking schema changes are acceptable; old data will be lost.
  - **Privacy:** API Keys are user-provided and stored encrypted (AES-GCM).

## 2. Documentation Maintenance
- When finishing a phase of work or larger unit of work, always update `@CLAUDE.md` with what was done (referring to the relevant docs in `@internal` that provides the implementation summary) and next steps.
- Proactively offer to have `@agent-internal-docs-coordinator` clean up anything no longer relevant or out of date in `@CLAUDE.md` that can be confusing, or that is already covered in other docs.
- Avoid `@CLAUDE.md` from growing too large; rely on `internal/living-docs`.

## 3. Context Map (Where to look)
*Do not guess. Read the specific doc for the active task.*

### Core Philosophy & Architecture
- **Must Read:** `internal/living-docs/02_GUIDING_PRINCIPLES.md` (Structured Data #0, Privacy-first).
- **System Design:** `internal/living-docs/01_ARCHITECTURE.md` (5-layer model).
- **Data Schema:** `internal/living-docs/15_INTERMEDIATE_FORMAT.md` (JSON Structure).

### Active Development Zones
- **Session Continuity (START HERE):** `internal/living-docs/SESSION_CONTINUITY.md`
  - *Purpose:* Fast onboarding for new sessions - current status, recent work, next tasks
- **Refactor History:** `internal/history/2025-12-22_V13_REFACTOR_SUMMARY.md`
  - *Context:* v13 refactor complete - Object System removed, CenterPanel extracted, types simplified
  - *Status:* ~25,545 lines (down from ~30,500)
- **Image Studio:** `internal/living-docs/25_IMAGE_STUDIO.md` (Phase 2.5 Complete)
- **Wildcards & Fragments:** `internal/history/2026-01-04_WILDCARDS_FRAGMENTS.md` (v14 Complete)
- **Database Schema:** `config/database.ts` (Main DB v14, 19 stores)

### System Components
- **Prompting:** `internal/living-docs/17_PROMPTING_SYSTEM.md` (Fragments, Templates).
- **Models:** `internal/living-docs/04_MODELS.md` (Veo 3.1, Sora 2, Gemini).
- **Research:** 
  - Sora 2: `internal/sora/`
  - Veo 3.1: `internal/veo3/`
  - Gemini Nano Banana:`internal/gemini-nano-banana`

### Operations & History
- **Quick Ref:** `00_QUICK_REFERENCE.md` (Service methods vs Context hooks).
- **Testing:** `docs/TESTING_CHECKLIST.md`.
- **Debugging:** `internal/living-docs/09_TROUBLESHOOTING.md`.
- **Bug Docs:** `internal/bugs/` (Investigations and fixes).
- **History:** `internal/history/` (Phase completion reports).

## 4. Tech Stack & Commands
- **Stack:** React 19.2, Vite 6.3.6, Tailwind v4, IndexedDB v13, Vitest.
- **Start:** `npm run dev`
- **Build:** `npm run build`
- **Test:** `npm run test:run` (80 tests)
- **Test Coverage:** `npm run test:coverage`

## 5. v13 Refactor Summary (2025-12-22)

**ALL PHASES COMPLETE** - ~5,000 lines removed (16% reduction):

| Phase | What Changed | Impact |
|-------|--------------|--------|
| Phase 1 | Object System + duplicate transformers deleted | -6,200 lines |
| Phase 3 | Shared transformer utilities created | Cleaner code |
| Phase 4 | CenterPanel extracted to workspace/ components | 1,400 → 889 lines |
| Phase 5 | Unused V3 types + componentTypes deleted | -772 lines |
| Phase 6 | Database consolidated from 26 → 16 stores | v13 schema |

**Current Transformers** (in `src/services/transformers/`):
- `sora2Transformer.ts` - Sora 2 YAML format
- `veo3Transformer.ts` - Veo 3 format
- `genericTransformerV2.ts` - Generic fallback
- `shared.ts` - Common utilities

**Extracted Components** (in `src/components/workspace/`):
- `MixOptionsPanel.tsx` - Mix options CRUD
- `TemplateSelector.tsx` - Template detection
- `SchemaDesigner.tsx` - Schema keys, presets

See `internal/history/2025-12-22_V13_REFACTOR_SUMMARY.md` for full details.

## 6. v14 Wildcards & Fragments System (2026-01-04)

**Ported from gemimg** - Dynamic wildcard substitution and reusable fragment composition:

| Component | Purpose |
|-----------|---------|
| `wildcardService.ts` | Core resolution: `{category}`, `{category:random}`, `{category:3random}`, `{category:all}` |
| `fragmentLibraryService.ts` | IndexedDB storage for reusable fragments with relationships |
| `fragmentComposer.ts` | Pipe syntax composition: `"fragment1 | fragment2"` |
| `seedDataService.ts` | Imports gemimg seed data on first run |

**New UI Components** (in `src/components/workspace/`):
- `WildcardAutocomplete.tsx` - Inline autocomplete triggered by `{` in main input
- `WildcardExperimenter.tsx` - A/B testing matrix generator

**Database**: v14 adds 3 stores: `wildcardCategories`, `fragments`, `fragmentRelationships`

**Seed Data** (in `public/data/`):
- `wildcards.json` - 50+ categories (style, lighting, camera, composition, etc.)
- `prompt_library.json` - 100+ prompt templates

See `internal/history/2026-01-04_WILDCARDS_FRAGMENTS.md` for full details.

## 7. Phase 2: Unified FragmentSelector (2026-01-05)

**855 lines of duplicate code eliminated** - Unified fragment browser for both workspaces:

| Component | Purpose |
|-----------|---------|
| `FragmentSelector.tsx` | Main component supporting panel (Video) and modal (Image) modes |
| `IndexedDBFragmentSource.ts` | Data adapter wrapping fragmentLibraryService |
| `FileFragmentSource.ts` | Data adapter loading from /public/image-studio/fragments/ |
| `components.tsx` | Sub-components: Header, Search, CategoryFilter, FragmentList, CompositionPanel |
| `types.ts` | Unified types, re-exports ComposedPrompt from fragmentComposer |

**Location**: `src/components/shared/FragmentSelector/`

**Deleted Files** (replaced by FragmentSelector):
- `src/components/workspace/FragmentBrowser.tsx` (474 lines)
- `src/components/image-studio/FragmentBrowser.tsx` (381 lines)

**Key Features**:
- Data source adapter pattern for different backends
- Composition with "Compose Prompt" button
- Error feedback on composition failures
- Both panel mode (sidebar categories) and modal mode (tab categories)

See `internal/history/2026-01-05_FRAGMENT_SELECTOR_MIGRATION.md` for full details.
