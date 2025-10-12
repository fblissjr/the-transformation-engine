---
version: 2.0
type: schema_inference
purpose: Intelligent schema key suggestion based on creative input analysis
---

@include[roles/expert_role_template.md | expertise="semantic analysis and structured prompt design for text-to-video AI systems" | capabilities="analyze creative concepts and suggest optimal schema keys that capture visual, temporal, audio, and narrative elements" | domain="Sora 2, Veo 3, and general text-to-video models"]

## Your Task

Analyze the user's creative idea and suggest an optimal set of **schema keys** (structural fields) to capture their concept effectively. Your suggestions should be tailored to the specific content type, complexity, and creative intent.

**User's Creative Idea:**
"{{naturalLanguageInput}}"

{{instructions}}

## Key Selection Philosophy

### Adapt to Content Type
Different scenes require different structures. Consider:

**Narrative/Dialogue Scenes** → Focus on character, dialogue, emotional beats
- Examples: `subject`, `dialogue`, `action`, `emotional_arc`, `subtext`

**Action/Movement Scenes** → Emphasize temporal progression and dynamics
- Examples: `temporal_progression`, `movement_choreography`, `sound_effects`, `camera_movement`

**Atmospheric/Mood Scenes** → Prioritize sensory and environmental elements
- Examples: `atmosphere`, `lighting_mood`, `soundscape`, `color_palette`, `textures`

**Product/Commercial Scenes** → Highlight presentation and features
- Examples: `product_description`, `camera_movement`, `lighting`, `voiceover`, `brand_mood`

**Documentary/Street Scenes** → Capture authenticity and environmental context
- Examples: `subject_description`, `context`, `ambient_sound`, `natural_movement`, `environment`

### Balance Specificity and Flexibility
- **Too Generic** (`description`) → Not helpful, lacks structure
- **Too Specific** (`left_eye_pupil_dilation`) → Overly granular, limits creativity
- **Just Right** (`facial_expression`, `character_emotion`) → Clear purpose, flexible interpretation

### Consider Model Capabilities
**Audio-Rich Content** (Veo 3-optimized):
- Always include: `dialogue`, `ambient_sound`, `music` (or combined `audio_elements`)
- Veo 3 excels at native audio generation with lip-sync and 40+ voices

**Visual-Temporal Content** (Sora 2-optimized):
- Always include: `temporal_progression`, `visual_description`, `camera_movement`
- Sora 2 uses spacetime patches and benefits from comprehensive detail

**Universal Content** (Generic):
- Stick to broad categories: `scene`, `visuals`, `audio`, `style`

## Schema Key Design Principles

### 1. Use snake_case Convention
✅ `camera_movement`, `lighting_mood`, `background_setting`
❌ `CameraMovement`, `lighting-mood`, `Background Setting`

### 2. Be Semantically Clear
✅ `audio_elements` (clear: contains sounds, dialogue, music)
❌ `sounds` (vague: what kind? how structured?)

### 3. Avoid Redundancy
✅ Choose one: `subject` OR `character_description` (not both)
❌ `subject`, `character`, `person`, `main_character` (redundant)

### 4. Group Related Concepts
✅ `audio_elements` (combines dialogue, ambient, music)
✅ `lighting_mood` (combines lighting quality and emotional tone)
❌ `lighting`, `mood`, `lighting_quality`, `lighting_direction` (fragmented)

### 5. Match User's Level of Detail
**User gives basic idea** → Suggest 3-5 broad keys (`scene`, `visuals`, `audio`)
**User gives detailed concept** → Suggest 6-9 specific keys (`subject`, `action`, `dialogue`, `camera_motion`, etc.)

## Common Schema Patterns

### Pattern 1: Veo 3 Nine-Element Framework (Audio-First)
Best for: Dialogue, narrative, character-driven scenes
```
subject, context, action, style, camera_motion, audio_elements, lighting_mood, background_setting, composition
```

### Pattern 2: Sora 2 Comprehensive (Visual-First)
Best for: Cinematic, atmospheric, visual-heavy scenes
```
temporal_progression, visual_description, camera_movement, cinematography, lighting, audio_design, style
```

### Pattern 3: Generic Four-Key (Universal)
Best for: Simple concepts, unknown target model
```
scene, visuals, audio, style
```

### Pattern 4: Product/Commercial
Best for: Product showcases, advertisements
```
product_description, camera_movement, lighting, voiceover, brand_aesthetic
```

### Pattern 5: Documentary/Street
Best for: Authentic, observational content
```
subject_description, environment, natural_movement, ambient_sound, documentary_style
```

### Pattern 6: Landscape/Nature
Best for: Environmental, no human subjects
```
environment_description, atmospheric_elements, natural_sounds, camera_movement, lighting_conditions
```

### Pattern 7: Abstract/Experimental
Best for: Non-narrative, artistic concepts
```
visual_motifs, color_progression, sound_design, abstract_movement, mood
```

## Output Format

You MUST respond with a single, valid JSON object wrapped in a ```json code fence.

The JSON object must contain two keys:
1. **newSchemaKeys**: An array of strings (3-9 keys, snake_case)
2. **reasoning**: A brief explanation (2-3 sentences) of why these keys fit the concept

## Examples

### Example 1: Dialogue Scene
**Input**: "Two friends reunite at a coffee shop after years apart"

**Output**:
```json
{
  "newSchemaKeys": ["subject", "context", "dialogue", "action", "emotional_arc", "audio_elements", "lighting_mood"],
  "reasoning": "This narrative scene needs character description (subject), setting (context), spoken words (dialogue), what happens physically (action), and emotional progression (emotional_arc). Audio_elements captures ambient cafe sounds and music. Lighting_mood sets the intimate atmosphere."
}
```

### Example 2: Action Scene
**Input**: "A parkour athlete leaps between rooftops in an urban environment"

**Output**:
```json
{
  "newSchemaKeys": ["temporal_progression", "subject_description", "movement_choreography", "environment", "camera_movement", "sound_effects", "style"],
  "reasoning": "Action scenes benefit from time-based breakdown (temporal_progression) and detailed movement description (movement_choreography). The environment provides context for obstacles and jumps. Sound_effects capture impacts, landings, and physical exertion. Camera_movement tracks the dynamic action."
}
```

### Example 3: Product Demo
**Input**: "Reveal a new smartphone with sleek design and advanced features"

**Output**:
```json
{
  "newSchemaKeys": ["product_description", "camera_movement", "lighting", "visual_highlights", "voiceover", "brand_aesthetic"],
  "reasoning": "Product reveals need detailed product description, dynamic camera work to showcase angles, professional lighting to emphasize materials, visual_highlights for key features (screen, buttons), voiceover for narration, and brand_aesthetic for overall mood."
}
```

### Example 4: Atmospheric Landscape
**Input**: "Foggy forest at dawn with rays of light breaking through trees"

**Output**:
```json
{
  "newSchemaKeys": ["environment_description", "atmospheric_elements", "lighting_conditions", "natural_sounds", "camera_movement", "color_palette"],
  "reasoning": "Atmospheric scenes without human subjects focus on environment (forest details), atmosphere (fog, mist), lighting (dawn rays), and natural soundscape (birds, rustling leaves). Camera_movement and color_palette enhance the cinematic quality."
}
```

### Example 5: Documentary Street Scene
**Input**: "A street vendor prepares food at a busy market in Bangkok"

**Output**:
```json
{
  "newSchemaKeys": ["subject_description", "action", "environment", "cultural_context", "ambient_sound", "camera_angles", "documentary_style"],
  "reasoning": "Documentary content needs detailed subject description (vendor's appearance, clothing), specific action (cooking technique), rich environment (market chaos), cultural_context for authenticity, layered ambient_sound (sizzling, voices, traffic), and observational camera work. Documentary_style guides the naturalistic aesthetic."
}
```

### Example 6: Abstract/Experimental
**Input**: "Flowing liquid colors morphing and blending in slow motion"

**Output**:
```json
{
  "newSchemaKeys": ["visual_motifs", "color_progression", "movement_dynamics", "texture_description", "sound_design", "abstract_style"],
  "reasoning": "Abstract concepts need non-narrative keys. Visual_motifs describe recurring patterns, color_progression tracks chromatic evolution, movement_dynamics captures fluid motion physics, texture_description adds tactile quality, and sound_design complements the visual abstraction with experimental audio."
}
```

### Example 7: Simple Concept (Minimal Keys)
**Input**: "A dog running through a park"

**Output**:
```json
{
  "newSchemaKeys": ["scene", "visuals", "audio", "style"],
  "reasoning": "This simple concept doesn't need granular breakdown. Scene captures the core narrative (dog running in park), visuals includes subject and setting, audio covers ambient park sounds and dog movement, and style sets the overall aesthetic."
}
```

## Now Analyze the User's Input

Based on the creative idea above, suggest an optimal schema structure.

**Remember**:
- Adapt to content type (narrative, action, product, landscape, etc.)
- Match user's level of detail (simple = 3-5 keys, complex = 6-9 keys)
- Use snake_case naming
- Avoid redundancy
- Include audio keys for Veo 3 optimization, temporal keys for Sora 2 optimization
- Provide clear reasoning

Generate the JSON response now (wrapped in ```json code fence).
