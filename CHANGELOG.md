# Changelog

All notable changes to The Transformation Engine will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project uses x.x.x versioning.

---

## [2.0.3] - 2025-11-09

### Changed
- **Default Gemini Model**: Changed from `gemini-2.5-flash-latest` to `gemini-flash-latest`
  - Updated in both `GEMINI_MODEL_NAME` constant and `DEFAULT_MODEL_SETTINGS`
- **Default Temperature & Top-P**: Updated for all task types
  - All 9 tasks in `TASK_METADATA` now default to `temperature: 1.0` (was 0.3-0.8)
  - All task assignments now default to `topP: 0.95` (was 1.0)
  - Applies to all providers (Gemini, OpenRouter, OpenAI, local)
- **Privacy Dashboard**: Changed "Privacy Guarantees" to "Privacy Features"
  - Replaced absolute statements ("100% Client-Side", "Never uploaded") with factual descriptions
  - Changed icon color from green (checkmarks) to blue (info icons)
  - Removed certainty language, replaced with "is designed to" and "are stored locally"
  - Updated text to reflect multi-provider architecture (not just Gemini)

### Added
- **Model Selection UX**: "Go to Providers Tab" button when no providers configured
  - Appears in ModelSelectionTab when providers.length === 0
  - Directly navigates to Providers tab via callback
  - Improves onboarding flow for new users

### Removed
- **Preview Prompt Label**: Removed "(Full transparency)" subtitle from CenterPanel
  - Line 994 in `components/CenterPanel.tsx`

---

## [2.0.2] - 2025-11-09

### Fixed
- **CRITICAL**: Fixed "No provider configured" error despite active provider showing
  - Removed obsolete `apiKey` check in `GenerationContext.tsx`
  - Removed unused `apiKey` parameter from `generateIntermediate()` function
  - Function already routes through `taskRouter` which handles providers internally
  - Generation now works immediately after adding a provider
- **Fixed**: "providerService.fetchModels is not a function" error
  - Corrected to use `useProviders()` hook → `fetchModels()` instead of non-existent service method
  - Updated `ProvidersTab.tsx` to properly destructure `fetchModels` from context
- **Fixed**: "Cannot read properties of undefined (reading 'substring')" during generation
  - `executeTaskJson()` returns parsed JSON directly, NOT a turn object with `.response` property
  - Updated `promptService.ts` to use the return value directly instead of accessing `.response`
  - Improved error handling for null/undefined responses

### Added
- **"Set as Default"** checkbox when adding new providers
  - Automatically sets provider as global default for all tasks
  - Checked by default for convenience
  - Uses first available model from provider
- **"Set Default"** button for existing providers in provider list
  - Allows quick re-assignment of global default without navigating to Task Assignment tab
  - One-click setup for new users
- **Quick Reference Guide** (`internal/living-docs/00_QUICK_REFERENCE.md`)
  - Fast lookup for service vs context methods
  - Prevents wrong assumptions (like the `providerService.fetchModels` mistake)
  - Includes anti-patterns, decision tree, and common patterns
  - Integrated into docs index as "Start Here for Implementation"

---

## [2.0.1] - 2025-11-09

### Fixed
- **BREAKING**: Removed all database migration code per project philosophy
  - Deleted `services/db/migrations/schema_v9.ts` (archived)
  - Deleted `services/migrations/promptToIntermediate.ts` (archived)
  - Deleted `scripts/test-migration.js` (archived)
  - Created `services/db/schema.ts` with fresh-only schema creation
  - Updated `indexedDbService.ts` to reject database upgrades from old versions
  - Users with existing databases must export data, clear DB, and import
  - Fresh installations now show "Creating fresh database schema v9" instead of migration logs

### Changed
- Updated `config/database.ts` comments to clarify NEVER increment version policy
- Database upgrade callback now throws error if `oldVersion !== 0`

### Archived
- Moved migration-related files to `internal/archived/migrations/`
- Moved test scripts to `internal/archived/scripts/`

### Documented
- Created bug report for generation error: `internal/bugs/generation_error_no_provider_2025-11-09.md`
  - Issue: Obsolete apiKey check blocking generation
  - Root cause: Legacy parameter never removed after taskRouter migration
  - Status: FIXED in v2.0.2

---

## [2.0.0] - 2025-11-08

### Added
- **Phase 2 Complete**: Structured JSON Intermediates
  - New type system: `types/intermediate.ts` (257 lines)
  - Zod validation schemas: `types/schemas.ts` (186 lines)
  - JSON Schema for LLM JSON mode: `types/jsonSchemas.ts` (300 lines)
  - Intermediate refinement UI: `IntermediateRefinementPanel.tsx` (360 lines)
  - Native JSON generation with `executeTaskJson()` and Zod validation
  - AI-powered field suggestions for intermediate refinement

### Changed
- Updated `generateIntermediate()` to use JSON mode instead of Markdown parsing
- Created `primary_intermediate.md` template (265 lines) with JSON output format
- Integrated refinement UI into RightPanel as default view

### Infrastructure
- HTTPS support for development and production (mkcert + nginx)
- Build bundle: 624.75 kB (includes new schemas)

### Documentation
- 6 Architecture Decision Records (ADRs) in `internal/living-docs/13_ADR.md`
- Intermediate format specification v2.0
- Transformation engine specification
- HTTPS setup documentation

---

## [Previous Versions]

See `internal/history/` for phase completion reports from earlier versions.
