# The Transformation Engine - Project Overview

> **Last Updated**: 2025-11-23 | **Status**: v2.2.1-alpha (Phase 2.5 Complete - Image Studio Fixed)

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
  - **Data Safety:** Main DB v12 / Image DB v1. Fresh-install only (NO MIGRATIONS). Breaking schema changes are acceptable; old data will be lost.
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
- **Image Studio (Current Focus):** `internal/living-docs/25_IMAGE_STUDIO.md`
  - *Context:* Phase 2.5 Complete. Generates structured intermediates.
- **Veo 3.1 Integration:** `internal/veo3/PHASE2.3_COMPLETION_SUMMARY.md`
- **Database Schema:** `internal/living-docs/26_IMAGE_DATABASE.md` (and check code for Main DB v12).

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
- **Stack:** React 19.2, Vite 6.3.6, Tailwind v4, IndexedDB v12/v1.
- **Start:** `npm run dev`
- **Build:** `npm run build`
