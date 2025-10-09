# User Guide

Complete documentation for The Transformation Engine

---

## Quick Start

### Prerequisites

1. **Node.js 18+** ([download](https://nodejs.org/))
2. **Gemini API key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

```bash
cd the-transformation-engine
npm install
npm run dev
```

Open http://localhost:1847 (or custom port via `npm run dev -- --port 12345`)

### First Run

1. **Set API Key**: Click Settings (bottom left) → API Key tab → paste key → Set
2. **Create Prompt**: Enter idea in center panel → Generate Prompt
3. **View Output**: Structured prompt appears in right panel (YAML default)

Example:
```
Input: A chef teaches a cooking class in a busy kitchen

Output:
scene: "A professional chef demonstrates knife skills..."
sound_effects: "Sizzling pans, chopping sounds, students chatting"
speech: "CHEF: 'The key is in the wrist motion'"
```

---

## Core Features

### Generation

**Basic**:
1. Enter text in Creative Idea
2. Select format (YAML, JSON, XML, Markdown)
3. Customize schema keys (optional)
4. Generate Prompt

**With Media**:
1. Add Image/Video → select files (max 10MB each)
2. Optional: Describe with AI (adds descriptions to input)
3. Generate with visual context

**Schema Customization**:
- Add keys manually or use presets (Video Scene, Music, Art Direction)
- AI: Suggest Keys - adds to existing
- AI: Full Schema - replaces all keys

**Prompt Preview**:
1. Expand "Preview Prompt" section before generating
2. View assembled system prompt and user input
3. Click "Edit Prompts" to modify before sending
4. Changes apply to current generation only
5. Reset to Default clears edits

### Mix Options

Enable transformations applied during generation:
- **Reverse**: Reverses keys and content
- **Compress**: Removes filler words
- **Expand**: Adds descriptive detail
- **Technical**: Uses precise terminology
- **Custom**: Define your own with instructions

Multiple options can be enabled simultaneously.

### Transformations

**Format Conversions** (Right panel buttons):
- → Plain English: Flowing paragraph
- → YAML, → XML, → JSON, → Markdown: Format conversion
- ✨ Custom: Free-form instruction (e.g., "Make it poetic", "Add technical jargon")

Transformations use current structured output as input.

### Prompt Mixing

**Synesthetic Mixer**:
1. Select 2+ prompts (checkboxes in library)
2. Mix button appears at top
3. Enter guidance or leave default
4. Generates hybrid prompt

Example guidance: "Combine the mood of the first with the setting of the second"

### Version History

- Auto-saved on every edit
- Access via History tab (right panel)
- Click Restore to revert
- Versions stored per-prompt

---

## Settings

**Access**: Click Settings at bottom of left sidebar

### API Key Tab

- Status indicator (Set/Not Set, Valid/Invalid)
- Set new key or change existing
- Remove key button
- Validation on save
- **Security**: Key stored in session memory only (not persisted to disk)

### Model Settings Tab

- **Default Model**: Model used for new prompts
- **Temperature** (0-2): Randomness/creativity (higher = more creative)
- **Top P** (0-1): Diversity control (lower = more focused)
- **Max Output Tokens** (1-8192): Response length limit
- Reset to Defaults button

**Note**: The AI Model dropdown in the center panel is the active model. When you load a saved prompt, it shows the model used for that prompt. Changes persist across generations until you create a new prompt or change it in Settings.

### System Prompts Tab

Edit the core prompts that drive generation behavior. Full transparency into how the AI works.

**4 Editable Prompts**:
1. **Primary** - Main generation prompt (natural language → structured output)
2. **Mixer** - Synesthetic mixer prompt (blends multiple prompts)
3. **Normalizer** - Transformation prompt (structured → plain English or custom format)
4. **Schema** - Schema inference prompt (suggests structure keys)

**How to Edit**:
1. Click sub-tabs (Primary, Mixer, Normalizer, Schema)
2. Edit in large monospace textarea
3. Save Prompts to apply changes
4. Reset to Defaults to restore originals

**Placeholders**: Use `{{variable}}` syntax:
- Primary: `{{naturalLanguageInput}}`, `{{format}}`, `{{schemaKeys}}`, `{{textDirectionInstruction}}`
- Mixer: `{{sourcePrompts}}`, `{{userGuidance}}`, `{{format}}`, `{{schemaKeys}}`
- Normalizer: `{{structuredOutput}}`, `{{language}}`
- Schema: `{{naturalLanguageInput}}`, `{{instructions}}`

Changes stored in localStorage and used for all subsequent generations.

### Data & Cache Tab

- **Clear Cache**: Removes API responses, model lists (localStorage)
- **Clear All Data**: Deletes everything (prompts, versions, settings, custom system prompts) - permanent

---

## Library Management

### Search & Organization

- Type in search bar (instant filter by title/content)
- Star prompts for favorites
- Delete via trash icon (confirms first)
- Click prompt to load in editor

### Import/Export

**Prompt Library** (Bottom of left sidebar):
- **Import Prompts**: Load JSON backup
- **Export Prompts**: Save all prompts (or selected if checkboxes active)

**Configuration** (Center panel bottom bar):
- **Export Config**: Save settings (format, mix options, schema keys, model, custom system prompts)
- **Import Config**: Load previous configuration
- Note: Excludes API key and prompts (export those separately)

### Editing

1. Click prompt in library to load
2. Edit directly in right panel (Structured tab)
3. Save Changes button
4. Previous version auto-saved to History tab
5. View/restore old versions anytime

---

## Schema Keys

Define output structure. Default: `scene`, `sound_effects`, `speech`

**Custom Examples**:
- `camera_movement`: "Slow dolly in, handheld shake during action"
- `lighting`: "High-contrast chiaroscuro, neon accents"
- `mood`: "Nostalgic dread, dreamlike atmosphere"
- `music`: "Jazz-infused synth, ambient noise"
- `dialogue_delivery`: "Slow, cryptic, unnaturally formal"

**Add Keys**:
- Type in "custom_field" input → Enter
- Use presets (Video Scene, Music, Art Direction)
- AI: Suggest Keys (based on input)
- AI: Full Schema (replaces current)

Keys are saved with each prompt and can be configured per-generation.

---

## Tips

**Generation**:
- Specific input = better output (describe details, not just concepts)
- Visual references improve accuracy (use Add Image/Video)
- Experiment with mix options (combine multiple for interesting effects)
- Cache speeds up repeat operations (same input = instant result)

**Transparency**:
- Use Prompt Preview to see exactly what gets sent to API
- Edit system prompts in Settings to customize behavior
- Edit prompts inline before generation for one-off changes
- All data stored locally, nothing sent without explicit trigger

**Organization**:
- Descriptive titles (auto-generated from first line of input)
- Star frequently used prompts
- Export backups regularly (Settings → Data & Cache → Export)
- Delete test prompts to keep library clean

**Performance**:
- Models list cached 24 hours
- API responses cached 5 minutes
- Keep library under 1000 prompts for best performance
- Clear cache if seeing stale data (Settings → Data & Cache)

---

## Storage Details

**IndexedDB** (browser-local):
- Prompts and versions
- Uploaded media (Blob storage)
- App settings and preferences

**localStorage**:
- Model list cache (24 hour TTL)
- API response cache (5 minute TTL)
- Custom system prompts

**Session Memory**:
- API key only (re-enter after closing tab)

**Limits**:
- IndexedDB: ~50-100MB (browser-dependent)
- File uploads: 10MB max per file
- No backend, no accounts

Clear all: Settings → Data & Cache → Clear All Data

---

## Troubleshooting

**"Invalid API Key"**:
- Check key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Verify no spaces or extra characters
- Try removing and re-setting in Settings

**Generation fails**:
- Check API key validity (Settings → API Key)
- Check browser console (F12) for errors, cuz this is a hobbyist project and there will be some surely

**Storage full**:
- Export library (left sidebar → Export Prompts)
- Clear data (Settings → Data & Cache → Clear All Data)
- Re-import library

**Slow performance**:
- Clear cache (Settings → Data & Cache → Clear Cache)
- Reduce library size (delete old prompts)
- Check if browser is low on memory

**Missing prompts**:
- Browser may have cleared IndexedDB (check auto-clear settings)
- Always keep backups via Export Prompts

**Build fails**:
```bash
rm -rf node_modules
npm install
npm run build
```

**TypeScript errors**:
```bash
npx tsc --noEmit
```

**Console errors**:
- F12 → Console tab for details
- Include errors in bug reports

---

## Advanced Usage

### Custom System Prompts

Create specialized behaviors by editing system prompts:

**Example - Poetic Style**:
Edit Primary prompt, change output instructions:
```
Instead of technical descriptions, use poetic metaphors and sensory language.
```

**Example - Technical Precision**:
Edit Primary prompt, add constraint:
```
Use precise technical terminology. Include camera specifications, lighting ratios, and audio dB levels.
```

**Example - Minimalist**:
Edit Primary prompt, modify length instruction:
```
Each key should have exactly 5 words, no more, no less. Be extremely concise.
```

### Inline Prompt Editing

For one-off changes without modifying system prompts:

1. Enter your creative idea
2. Expand "Preview Prompt" section
3. Click "Edit Prompts"
4. Modify system or user prompt as needed
5. Generate Prompt (uses your edited version)

Changes only apply to current generation, don't affect defaults.

### Caching Strategy

Understand what gets cached:

- **Models list**: 24 hours (avoids repeated API calls for dropdown)
- **Generation**: 5 minutes (repeated input = instant response)
- **Schema inference**: 1 hour (same input + keys = cached suggestions)
- **Transformations**: 5 minutes (same output + instruction = cached)

Clear cache if you want fresh results for same input.

---

## Keyboard Shortcuts

- **Ctrl/Cmd + Enter**: Generate prompt (when textarea focused)
- **Ctrl/Cmd + S**: Save changes (when editing prompt in right panel)
- **Esc**: Close modals
