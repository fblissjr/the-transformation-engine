# The Transformation Engine - Project Overview

> **Last Updated**: 2025-11-10 | **Status**: Phase 2 Complete (v2.0.4 - Vision Support + Dead Code Cleanup)

---

## What This Is

A **local-first, client-side web application** for engineering multi-modal prompts for text-to-video AI models. Built with React + TypeScript + Vite, using IndexedDB for storage and multi-provider LLM support.

**Key Philosophy**: Privacy-first, no backend, no accounts, modular LLM providers. Everything runs in the browser.

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

### For Developers (Start Here)
**[internal/living-docs/00_INDEX.md](./internal/living-docs/00_INDEX.md)** - Complete technical documentation

The living-docs contain 16 modular files covering:
- Architecture & system design
- Features & capabilities
- Development guidelines
- API integration
- Privacy & security
- Phase history
- **Troubleshooting** (including known bugs)
- File structure
- Roadmap & next steps

### Version History
**[CHANGELOG.md](./CHANGELOG.md)** - Version history and notable changes

### For Users
**[docs/user_guide.md](./docs/user_guide.md)** - User-facing guide

### For Operations
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Multi-tenant deployment
- **[OPERATIONS.md](./docs/OPERATIONS.md)** - Operations guide
- **[TESTING_CHECKLIST.md](./docs/TESTING_CHECKLIST.md)** - Testing procedures
- **[AUTOMATED_TESTING.md](./docs/AUTOMATED_TESTING.md)** - Test automation

---

## Research & Analysis

### Model Research
- **[internal/sora/](./internal/sora/)** - Sora 2 + GPT-5 methodology research
- **[internal/veo3/](./internal/veo3/)** - Veo 3 + Veo 3.1 research

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
7. **NO MIGRATIONS**: Database v9 is fresh-install only - users must export/import for schema changes

---

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind v4
- **Storage**: IndexedDB v9 (multi-provider architecture, no migrations)
- **LLM Providers**: Gemini 2.5 Flash (default), OpenRouter (with OpenAI + local servers ready)
- **Testing**: Vitest (setup, minimal coverage)

---

**Always read this file to get up to speed. For detailed info, see [living-docs](./internal/living-docs/). This is a hobbyist project - aim for simplicity and extensibility.**

## Recent Changes (v2.0.4)

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

---
- Always update our @internal docs after code changes are complete and tested, according to our guiding principles, and ensuring no migration related code is created or exists. Then update @CLAUDE.md with any links that are needed. All docs should be created within @internal in an organized manner, then propagated down to @CLAUDE.md as the index / starting point for Claude.

Then finally, propagated down to the @README.md and @docs folder.

Both @internal and @docs markdown docs should be consolidated when it makes sense to avoid duplication of docs. Modularity is important, but not to an extreme level.
- All transformations should happen in the intermediate / structured layer. The final output layer is for formatting for models (veo3.1, sora, etc) or for post-processing or ad-hoc things.