# The Transformation Engine - Project Overview

> **Last Updated**: 2025-11-08 | **Status**: Phase 11 Complete + Bug Fixes (Schema Keys + Structured Tab)

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
- Troubleshooting
- File structure
- Roadmap & next steps

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

---

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind v4
- **Storage**: IndexedDB v9 (multi-provider architecture)
- **LLM Providers**: Gemini 2.5 Flash (default), OpenRouter (with OpenAI + local servers ready)
- **Testing**: Vitest (setup, minimal coverage)

---

**Always read this file to get up to speed. For detailed info, see [living-docs](./internal/living-docs/). This is a hobbyist project - aim for simplicity and extensibility.**
