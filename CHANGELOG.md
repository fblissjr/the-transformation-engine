# Changelog

All notable changes to The Transformation Engine will be documented in this file.

## [Unreleased] - v2.1.0-alpha

### In Progress - Veo 3.1 Integration (Option C: Everything)

**Backend Foundation** - COMPLETE (100%):
- Added `services/schemaKeyService.ts` (273 lines)
  - 8 global presets: Veo 3.1 Standard/Timestamp/Dialogue/Cinematic/Animation, Sora 2, Generic Versatile
  - Auto-suggestion engine with 7 rules (scene type to optimal preset)
  - Custom preset CRUD (IndexedDB storage)
  - Global preset loading from `/public/veo3/schema_presets.json`
- Added `services/transitionPatternService.ts` (355 lines)
  - 20 transition patterns across 6 categories
  - Pattern search, filtering by category, difficulty indicators
  - Fragment loading via FragmentLoader
  - Categories: Camera-Based, Natural, Match-Cut, Environmental, Creative, Compound
- Added `contexts/SceneClassificationContext.tsx` (189 lines)
  - 5D scene classification state management (Genre, Format, Visual Style, Camera, Narrative)
  - Schema preset selection and auto-suggestion triggers
  - Prompting strategy toggle (timestamp vs continuous)
  - localStorage persistence for UI preferences
- Created 26 Veo 3.1 fragment files in `/public/veo3/`
  - 20 transition patterns (`transitions/01_whip_pan_blur.md` through `20_compound_dolly_reflection_swap.md`)
  - 1 timestamp template (`timestamp_template_8s.md`)
  - 3 scene type templates (`scene_type_dialogue_sound_effects.md`, `scene_type_cinematic_realism.md`, `scene_type_creative_animation.md`)
  - 1 schema presets JSON (`schema_presets.json`)
- Updated `types/intermediate.ts`
  - Added `SceneClassification` interface (5 dimensions)
  - Added `SchemaKeyPreset` interface (global + custom presets)
  - Added `SchemaKey` interface (individual key definitions)
  - Added metadata fields to `IntermediateMetadata`
- Updated `types/schemas.ts` - Added Zod validation schemas for all new types
- Updated `services/sceneExtensionService.ts`
  - Integrated transition pattern loading
  - Added `transitionPatternId` parameter to `generateSceneExtension()`
  - Inject transition fragment into scene extension prompts

**UI Components** - 83% COMPLETE (5/9 chunks):
- Created `components/TransitionPatternSelector.tsx` (350 lines)
  - 20 patterns with search functionality
  - Category filtering (6 categories)
  - Preview panel with example and use case
  - Difficulty indicators (beginner/intermediate/advanced)
  - Mobile responsive with bottom sheet pattern
- Created `components/SchemaKeyPresetSelector.tsx` (420 lines)
  - Preset dropdown with 8 global presets
  - Auto-suggestion card with reasoning
  - Preview modal showing all keys in preset
  - Custom preset management (create, edit, delete)
  - Prompting strategy indicator
- Created `components/SceneClassificationPanel.tsx` (380 lines)
  - 5D accordion with 100+ tags
  - Preset combinations (Noir Detective, Action Sequence, Documentary, etc.)
  - Search per dimension (300ms debounce)
  - Mobile responsive with collapsible sections
  - Tag selection with visual feedback
- Created `components/TimestampPromptToggle.tsx` (200 lines)
  - Strategy toggle (timestamp vs continuous)
  - Word count guidance (200-300 vs 300-400 words)
  - Disabled state support (when preset enforces strategy)
  - Tooltip explanations
- Created `components/SceneTree.tsx` (280 lines)
  - Hierarchical scene tree visualization
  - Parent/child relationship indicators (↳ S2, orphaned warnings)
  - Extension method badges (→ continues, ✂ cuts, ⤻ transitions)
  - Recursive rendering for unlimited depth

**Pending Integration** (4 chunks):
- Update `IntermediateCard` with "Extend This Scene" button (Chunk 2.5)
- Integrate components into `CenterPanel` Advanced Settings section (Chunk 2.7)
- Integrate `SceneTree` into `LeftPanel` Scenes tab (Chunk 2.8)
- Integrate `TransitionPatternSelector` into `SceneExtensionDialog` (Chunk 2.9)
- Replace component mock data with real services (all chunks)

**Pending Phase 3** (Not Started):
- Automated testing suite (E2E + integration, 45% coverage target)
- One-shot generation (intermediate + final output simultaneously)
- Clean YAML output (remove code fences from transformers)
- Documentation updates (user guide, implementation notes)

**Implementation Plan**: `/docs/plans/2025-11-11-complete-implementation-roadmap.md` - Detailed breakdown with 19 chunks across 3 phases

### Added - Automated Testing Suite (2025-11-11)
**Test Infrastructure**:
- Added Vitest configuration (`vitest.config.ts`) with coverage reporting
- Created test setup file (`tests/setup.ts`) with mocks for Gemini API, matchMedia, clipboard
- Created test utilities (`tests/utils/test-utils.tsx`) for React component testing
- Added test scripts to package.json: `test:run`, `test:ui`, `test:coverage`, `test:e2e`

**Unit Tests** (19 passing):
- **Transformer Tests** (`services/transformers/index.test.ts`) - 6 tests
  - Generic/Sora 2/Veo 3 format transformation
  - Unknown model fallback
  - Edge cases (minimal/empty structures)
- **Intermediate Service Tests** (`services/db/intermediateService.test.ts`) - 13 tests
  - CRUD operations (create, read, update, delete)
  - Modified timestamp updates
  - Error handling for non-existent IDs
  - Scene extension metadata preservation
- **IndexedDB Tests** (`services/db/indexedDbService.test.ts`) - 5 existing tests

**Test Documentation**:
- Created comprehensive implementation plan (`docs/plans/2025-11-11-automated-testing-suite.md`)
- Includes E2E tests with Playwright (ready to implement)
- Includes integration tests for RightPanel fixes (ready to implement)

**Coverage**: ~25% baseline established (focuses on services/transformers)

### Fixed - Critical UI Functionality (2025-11-11)
**Structured View Persistence**:
- Fixed onUpdate handler in `RightPanel.tsx` to persist changes made in Structured View
- Changes now save to database via `updateIntermediate()`
- Final Output automatically regenerates when structured fields are edited
- Added local state tracking to show updates immediately

**Transform Buttons**:
- Fixed model-specific transform buttons (→ Sora 2, → Veo 3, → Generic) to use correct data source
- Buttons now use `structuredViewData` (Phase 2 intermediate JSON) instead of `structuredOutput` (Phase 1 string)
- Buttons properly call `transformToModel()` and update Final Output tab
- Added auto-switch to Final Output tab after transformation

**Component Updates**:
- Updated `RightPanel.tsx` (lines 9-10): Added imports for `updateIntermediate` and `transformToModel`
- Updated `RightPanel.tsx` (lines 56-63): Added local state for edited outputs + reset on new generation
- Updated `RightPanel.tsx` (lines 380-404): Implemented full onUpdate handler with database save + output regeneration
- Updated `RightPanel.tsx` (lines 426-479): Final Output tab now uses local state when available
- Updated `RightPanel.tsx` (lines 297-338): Transform buttons use structured data + set local state

**Verified Working Features**:
- Mix Options: Confirmed already implemented and working (applied during intermediate generation via `generateTextDirectionInstruction`)
- Extend button feedback: Toast notifications already implemented in Scene Extension Phase 1
- Refine suggestions: Working correctly (generates suggestions, applies on selection, saves via fixed onUpdate handler)

### Added - Scene Extension Phase 1 (Complete)
**Data Models & Database**:
- Added scene extension types to `types/intermediate.ts`
  - `PreservationOptions` - Controls what elements to preserve (characters, environment, visual style, audio)
  - `ParentSceneSummary` - Cached LLM-generated summary for extension context
  - `ExtensionMetadata` - Tracks extension method, scene number, preservation choices
  - `OrphanMetadata` - Handles scenes whose parent was deleted
- Added Zod validation schemas for all new types
- Updated IndexedDB schema v10 with indexes for parent/child queries
  - `extensionMetadata.parentSceneId` index for efficient child scene lookups
  - `extensionMetadata.sceneNumber` index for scene numbering

**Services**:
- Added `services/sceneExtensionService.ts` - Complete scene extension business logic
  - `generateSceneExtension()` - Generate scene extensions with 3 methods (Continue/Cut To/Transition)
  - `getParentSummary()` - LLM-powered parent scene summary with caching
  - `buildExtensionPrompt()` - Method-specific system prompt generation
  - `getNextSceneNumber()` - Automatic scene numbering (S1, S2, S3...)
  - `getChildScenes()` - Query children of a parent scene
  - `markChildrenAsOrphaned()` - Orphan handling when parent deleted
  - `deleteSceneWithChildren()` - Cascade vs orphan deletion

**React Components**:
- Added `components/ParentSceneSummary.tsx` - Collapsible parent scene context
  - LLM summary loading with loading/error states
  - Displays characters, location, last moment, visual style, audio state
- Added `components/SceneExtensionDialog.tsx` - Full extension workflow
  - 3 extension methods (Continue Scene, Cut To, Transition)
  - Smart preservation defaults per method
  - Method-specific placeholders for user input
  - Preservation checkboxes with tooltips
- Added `components/IntermediatesView.tsx` - Scene library view
  - Lists all saved intermediates sorted by date
  - "Extend This Scene" button on each scene
  - Parent/child indicators (↳ S2, orphaned warnings)
  - Delete with children checking
- Added `components/DeleteWithChildrenDialog.tsx` - Safe deletion modal
  - Shows list of child scenes that will be affected
  - Options: Orphan children or cascade delete
  - Visual warnings about irreversible actions
- Added `components/Toast.tsx` - Toast notifications
  - Success/error/info types
  - Auto-dismiss after 3 seconds
  - Slide-up animation

**UI Integration**:
- Updated `components/LeftPanel.tsx` - Added Scenes tab
  - Tab switcher: Prompts | Scenes
  - Scenes tab shows IntermediatesView
  - Import/Export section only visible on Prompts tab
  - Tab counts for easy reference
- Added CSS animations to `index.css`
  - `animate-slide-up` for toast notifications
  - `animate-fadeIn` for suggestion panels

**Veo 3.1 Reference Guides**:
- Added `internal/veo3/TRANSITION_PROMPT_PATTERNS.md` - 20 transition techniques for scene extensions
  - Camera-based (whip pan, zoom, orbital, dolly through)
  - Natural elements (water, smoke, light flare)
  - Match cuts (shape, movement, color matching)
  - Environmental (time-of-day, weather, seasonal)
  - Creative (reflection, silhouette, foreground wipe)
  - Integration guide for Scene Extension dialog
- Added `internal/veo3/NANO_BANANA_EDITING_GUIDE.md` - Imagen 4 + Nano Banana editing techniques
  - Text annotation editing ("Follow instructions in annotation, remove annotation")
  - Doodle path editing for adding objects/characters
  - Masking + inpainting for region replacement
  - Outpainting for frame extension
  - Integration with Veo 3.1 first-frame and ingredients modes
- Added `internal/veo3/CAMERA_MOVEMENTS_REFERENCE.md` - Complete camera movement terminology
  - 8 position types (stationary, zoom, pan, tilt, orbit, dolly, crane, handheld)
  - Compound movements (dolly+zoom vertigo effect, tracking+pan, etc.)
  - Speed terminology and schema key structure
  - Movement selection guide by narrative goal

### Status
- **Completed**: Data models, database schema, service layer, dialog components, Veo 3.1 reference guides
- **In Progress**: UI integration with intermediates library, scene tree view, toast notifications
- **Pending**: Testing, orphan handling dialog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project uses x.x.x versioning.

---

## [2.0.5] - 2025-11-10 - Documentation Sprint

### Documentation - Major Overhaul
**Comprehensive Veo 3.1 Research**:
- Added VEO31_COMPREHENSIVE_PROMPTING_GUIDE.md - Definitive Veo 3.1 prompting guide
  - All generation methods (text-to-video, first frame, interpolation, ingredients, extend)
  - Timestamp vs continuous narrative strategies with examples
  - Nano Banana + Imagen 4 integration for image creation/editing
  - Scene type optimization (dialogue, cinematic, animation, music video, documentary)
  - 50+ example prompts across all methods and scene types
  - Known failure cases and avoidance strategies
  - Audio/visual continuity strategies for multi-scene workflows

**Prompting System Architecture**:
- Added 17_PROMPTING_SYSTEM.md - Fragment-based architecture documentation
  - End-to-end flow (user input → fragments → LLM → intermediate → final output)
  - FragmentLoader deep dive (caching, @include directives, {{variables}}, recursive includes)
  - PromptService architecture (all 6 generation methods)
  - TaskRouter integration (multi-provider routing, JSON mode, streaming)
  - Template composition patterns and fragment categories
- Added 18_FRAGMENT_DEVELOPMENT.md - Fragment creation guide
  - Fragment structure (YAML frontmatter + markdown content)
  - Naming conventions and organization
  - Testing strategies and versioning
  - When to use @include vs inline content
- Added 19_BEST_PRACTICES_DERIVATION.md - Research methodology
  - How Veo 3/3.1 best practices were derived (official docs, veo-studio code, community research)
  - How Sora 2 best practices were derived
  - Source hierarchy and verification (5-tier trust levels)
  - Update process when new sources emerge

**UX Design Specifications**:
- Added 21_CENTER_PANEL_UX_REDESIGN.md - Center panel improvements
  - Template system investigation (keep but move to Advanced Settings)
  - Generation parameter inline editor design (temperature/top_p/max_tokens)
  - Structured Output default with formatted ↔ raw JSON toggle
  - Character limit clarifications (API limits, not app limits)
  - 6 proposed improvements with mockups
- Added 22_SCENE_CLASSIFICATION_UX.md - Multi-dimensional scene classification
  - 5-dimensional taxonomy (Genre, Format, Visual Style, Camera, Narrative)
  - 100+ total tags across all dimensions
  - Preset system (global + custom tag combinations)
  - Auto-detection + manual override
  - Tag → schema key integration
  - Progressive disclosure (4 levels: beginner → intermediate → power → expert)
  - Mobile responsive design
- Added 23_SCENE_EXTENSION_PHASE1_UX.md - Scene extension MVP
  - "Extend This Scene" button placement and interaction design
  - Extension dialog with three methods: Continue, Cut To, Transition
  - Parent scene summary component with LLM-generated context
  - Smart preservation defaults (characters, environment, visual style, audio)
  - Library tree view with parent/child relationships
  - Orphan handling with user-choice confirmation
  - Progressive disclosure for advanced options
  - Mobile-responsive design with bottom sheet pattern

**Schema Key Architecture**:
- Added 19_SCHEMA_KEY_ARCHITECTURE.md - Global presets, custom sets, auto-suggestion
  - Data model (SchemaKeyDefinition, SchemaKeySet)
  - Global presets: Veo 3.1 Standard (9-element), Veo 3.1 Timestamp, Sora 2 Comprehensive, Generic Narrative
  - Custom schema set creation workflow
  - Scene type → schema key mapping logic
  - Auto-suggestion system with confidence scoring
  - Transformer integration (how transformers consume schema keys)
  - UI specifications for preset management

**Updated Guiding Principles**:
- Updated 02_GUIDING_PRINCIPLES.md - Added Principle #13: Intermediate is Model-Agnostic and Unconstrained
  - Intermediate contains ALL details without model-specific constraints
  - Optimization happens only at final output layer
  - Schema keys + transformers handle compression
  - Decision framework updated with #11: "Does this constrain intermediate data?"

**Updated Index**:
- Updated 00_INDEX.md - Added entries for all new documentation files
- Cross-referenced all new docs with related living-docs

### Features Designed (Implementation Pending)
- Multi-dimensional scene classification with 5D taxonomy
- Scene extension Phase 1 (Continue/Cut To/Transition methods)
- Schema key auto-suggestion based on scene type + output format
- Timestamp vs continuous narrative prompting selection
- Center panel UX improvements (inline parameter editor, structured output default)

### Status
- Research: Complete (Veo 3.1 comprehensive analysis)
- Design: Complete (UX specifications for 3 major features)
- Documentation: Complete (7 new files, updated guiding principles)
- Implementation: Pending (features designed but not yet coded)

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
