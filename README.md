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

## Screenshots

### Main Interface
Three-panel layout with prompt library, input controls, and structured output.

<img src="assets/main-interface.png" alt="Main Interface" width="800">

### Prompt Preview & Transparency
View and edit system + user prompts before sending to the API.

<img src="assets/prompt-preview.png" alt="Prompt Preview" width="800">

### Media Conditioning & Mixing
Upload images/videos, mix multiple prompts, and use AI vision analysis.

<img src="assets/media-conditioning.png" alt="Media Conditioning" width="800">

### Model Selection
Choose from all available Gemini models with real-time availability.

<img src="assets/model-selector.png" alt="Model Selector" width="800">

### Settings: Model Parameters
Configure temperature, Top P, and max output tokens.

<img src="assets/settings-model.png" alt="Model Settings" width="600">

### Settings: System Prompts
Customize all 4 core system prompts with live preview.

<img src="assets/settings-system-prompts.png" alt="System Prompts" width="600">

### Settings: Data & Cache
Manage storage and clear cached API responses.

<img src="assets/settings-data.png" alt="Data Management" width="600">

### Privacy Dashboard
Real-time network monitoring, audit logs, and privacy verification.

<img src="assets/privacy-dashboard.png" alt="Privacy Dashboard" width="800">

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:1847 (or custom port via `npm run dev -- --port 12345`)

**API Key Setup**: Enter your API key when prompted (stored encrypted with configurable TTL)

Get API key: [Google AI Studio](https://aistudio.google.com/app/apikey)

**Documentation:** [User Guide](./docs/user_guide.md) - includes installation, features, and advanced usage

## Storage

- **Prompts/versions/media**: IndexedDB (browser-local)
- **API key**: Encrypted storage (AES-GCM, configurable TTL, default 7 days)
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
