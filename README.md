# The Transformation Engine

<p align="center">
  <img src="assets/logo_256x256.png" alt="The Transformation Engine" width="256">
</p>

LLM-powered structured prompts and transformations and other random wackiness for video generation models

## Features

- **Generate**: Natural language → structured prompts (YAML, JSON, XML, Markdown)
- **Transform**: Convert between formats with mix options (reverse, compress, expand, technical, custom)
- **Mix**: Blend multiple prompts into hybrids
- **Library**: Local prompt management with search, favorites, versions
- **Media**: Image/video conditioning via vision API
- **Transparency**: Preview and edit all prompts before sending, customize system prompts
- **Settings**: Model parameters, API key management, cache control

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:1847 (or custom port via `npm run dev -- --port 12345`)

**API Key Setup** (choose one):
1. Environment variable: Copy `.env.example` to `.env.local`, add your key
2. In-app: Enter when prompted

Get API key: [Google AI Studio](https://aistudio.google.com/app/apikey)

**Documentation:** [User Guide](./docs/user_guide.md) - includes installation, features, and advanced usage

## Storage

- **Prompts/versions/media**: IndexedDB (browser-local)
- **API key**: Environment variable (optional) or session memory
- **Cache & custom system prompts**: localStorage (models list, API responses, edited prompts)

Data only sent to Google Gemini API when you explicitly trigger generation/transformation.

## Tech Stack

- React 19 + TypeScript + Vite + Tailwind v4
- IndexedDB (idb library)
- Gemini API (gemini-2.5-pro default)

## Requirements

- Node.js 18+
- Modern browser
- Gemini API key

## License

Apache License 2.0
