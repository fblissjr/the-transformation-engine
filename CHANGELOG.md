# Changelog

All notable changes to The Transformation Engine will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project uses x.x.x versioning.

---

## [2.0.4] - 2025-11-10

### Added
- **"Assign to All Tasks" Button**: Added to Model Selection tab
  - Prominently placed right after model selection for immediate visibility
  - Applies current global default to all 9 tasks with one click
  - Fixes issue where changing models didn't affect existing task assignments
  - Solves task assignment caching problem reported in debug logs
- **Vision/Multimodal Support**: Media analysis now routes through task assignment system
  - Added `executeVisionTask()` method to taskRouter with vision capability checking
  - Extended `GenerateRequest` interface to support multimodal content (text + images)
  - Media description now uses `MEDIA_DESCRIPTION` task (configurable in Task Assignment tab)
  - Throws helpful error if selected model doesn't support vision
  - GeminiProvider updated to handle multimodal content (text + base64 images)

### Changed
- **Default Model for New Gemini Providers**: Now uses `gemini-flash-latest`
  - When adding a new Gemini provider with "Set as default" checked
  - Prefers `gemini-flash-latest` over preview models (was using first model in list)
  - Fallback to first model if `flash-latest` not available
- **MediaContext**: Migrated from legacy `geminiService` to `taskRouter`
  - Now respects task assignments for media analysis
  - Uses proper multi-provider architecture
  - Maintains conversation history and token tracking

### Removed
- **"Set Default" Button**: Removed from Providers tab
  - Was causing unintended global task assignment overrides
  - Users should manage task assignments via Task Assignment tab for granular control
  - Removed related confirmation panel and handler functions
- **Dead Code Cleanup**: Removed unused legacy code
  - Deleted `services/geminiService.ts` (superseded by multi-provider architecture)
  - Removed hardcoded `GEMINI_MODEL_NAME` fallbacks from CenterPanel
  - Removed unused `availableModels` state and model caching logic
  - Cleaned up unused `options.modelName` parameter from `generateIntermediate()`
  - Removed model name initialization defaults (now managed by task assignments)

### Fixed
- **CRITICAL**: Fixed remaining obsolete `apiKey` checks in `GenerationContext.tsx`
  - Removed `apiKey` check from `mixPrompts()` (line 301) - "Mix Prompts" now works
  - Removed `apiKey` check from `inferSchema()` (line 409) - "Suggest/Regenerate" schema buttons now work
  - Removed `apiKey` check from `refineLastOutput()` (line 467) - Refinement now works
  - Removed `apiKey` check from `answerRevisionRequest()` (line 525) - Veo 3.1 revisions now work
  - All functions delegate API key validation to `taskRouter` per multi-provider architecture
- **CRITICAL**: Fixed "undefined is not valid JSON" error in field refinement
  - `executeTaskJson()` returns parsed JSON directly, not a `ConversationTurn` object
  - Removed incorrect `.response` property access and double `JSON.parse()` in `IntermediateRefinementPanel.tsx`
  - "Refine" button in Structured View now works correctly
- **Fixed**: `normalize()` empty system prompt bug
  - Was passing empty string `''` as system prompt, bypassing fragment composition system
  - Now correctly uses composed prompt from `generateNormalizePrompt()` as system prompt
  - User prompt is now a simple instruction instead of the full composed template
  - Export format transforms (Sora 2, Veo 3, Generic) now work without 503 errors
- **Fixed**: Structure Fields clipping in CenterPanel
  - Added `flex-shrink-0` to Schema Designer container to prevent collapse
  - Added `max-h-[400px] overflow-y-auto` to collapsible content for proper scrolling
  - All schema keys now visible and scrollable when expanded

### Added
- **Fragment Template**: Created `/public/core/refinement_suggestions.md`
  - Uses fragment composition system with `expert_role_template.md`
  - Generates creative alternative suggestions for field-level refinements
  - Follows project philosophy of modular, reusable prompt fragments
- **Prompt Service**: Added `generateRefinementPrompt()` helper
  - Composes refinement system prompts using fragment loader
  - Consistent with other prompt generators (`generateSchemaInferencePrompt`, `generateNormalizePrompt`)
  - Enables user customization via fragment files

### Changed
- **Refinement System**: Migrated from hardcoded prompts to fragment-based composition
  - `suggestRefinement()` now uses `generateRefinementPrompt()` helper
  - System prompts loaded from `/public/core/refinement_suggestions.md`
  - Maintains consistency with existing prompt architecture
- **Mix Options**: Now apply during intermediate generation (v2.0 structured JSON)
  - Added `@include[instructions/format_constraints.md]` to `primary_intermediate.md`
  - `generateIntermediate()` now passes all required format_constraints variables
  - Fixed fragment variable inheritance - included fragments now receive parent variables
  - Mix transformations (Reverse, Compress, Expand, Technical, Custom) affect intermediate layer
  - Aligns with project philosophy: "All transformations happen in intermediate/structured layer"
  - **UX**: Mix Options and Structure Fields sections now expanded by default
- **System Prompts**: Removed leading newlines from fragment templates
  - Fixed blank line after frontmatter in `primary_intermediate.md`, `refinement_suggestions.md`, `schema_inference.md`
  - System prompts now start cleanly without extra whitespace

---

## [2.0.3] - 2025-11-09

### Changed
- **Default Gemini Model**: Changed to `gemini-flash-latest`
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
- **Providers Tab UX**: Improved "Set Default" button clarity
  - Replaced popup alert with inline confirmation panel
  - Shows which tasks will be affected (all 9 tasks listed)
  - Displays provider name and explains first model will be used
  - Confirm/Cancel buttons instead of intrusive alert
  - Gemini now first provider in dropdown (was OpenRouter)

### Added
- **Model Selection UX**: "Go to Providers Tab" button when no providers configured
  - Appears in ModelSelectionTab when providers.length === 0
  - Directly navigates to Providers tab via callback
  - Improves onboarding flow for new users
- **Screenshot Automation**: Automated screenshot capture system
  - Playwright-based script for desktop (1920x1080) and mobile (390x844) viewports
  - Captures 6 key screens: main interface, intermediate refinement, prompt preview, providers, model selection, privacy dashboard
  - npm scripts: `npm run screenshots`, `npm run screenshots:desktop`, `npm run screenshots:mobile`
  - Documentation in `docs/SCREENSHOT_AUTOMATION.md`
  - Designed for CI/CD integration and visual regression testing
- **Internal Documentation Audit**: Comprehensive privacy review for public sharing
  - Created `PUBLIC_SHARING_AUDIT.md` with file-by-file classification
  - Created `REDACTION_GUIDE.md` with specific line removal instructions
  - Created `SHARING_SUMMARY.md` with executive summary
  - Result: 97% safe as-is, only 36 lines in 2 files need redaction

### Removed
- **Preview Prompt Label**: Removed "(Full transparency)" subtitle from CenterPanel

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
