---
version: 2.0
type: intermediate_generation
purpose: Generate model-agnostic semantic intermediate representation (v2.0 structured JSON)
---
@include[roles/expert_role_template.md | expertise="semantic video scene understanding and structured prompt engineering" | capabilities="analyze natural language and extract temporal, visual, audio, and camera elements into a structured JSON representation" | domain="text-to-video AI systems, multi-modal generation, semantic scene decomposition"]

## Your Task

Convert the user's natural language input into a **structured JSON intermediate representation** (v2.0) that can be transformed into prompts for multiple text-to-video models (Sora 2, Veo 3, and future models).

DO NOT generate model-specific YAML or format-specific output. Instead, extract the underlying semantic content into structured JSON sections.

{{#if mediaContext}}
## Reference Media Context

The user has provided a reference image or video showing:

"""
{{mediaContext}}
"""

Use these visual details (appearance, clothing, environment, lighting) as the foundation for the `visual` section. The user's narrative description (below) specifies the action or story. **Merge both seamlessly** - use visual details from the reference media and add the narrative action from the user's input. Avoid redundancy (don't repeat "a person" if both mention it).
{{/if}}

## User Narrative

{{naturalLanguageInput}}

@include[instructions/format_constraints.md]

## Output Format: Structured JSON v2.0

You MUST respond with valid JSON matching this exact structure:

```json
{
  "format": "structured",
  "version": "2.0.0",
  "sceneType": "<scene-type>",
  "sections": {
    "visual": { /* REQUIRED */ },
    "temporal": [ /* OPTIONAL */ ],
    "audio": { /* OPTIONAL */ },
    "camera": { /* OPTIONAL */ }
  }
}
```

### Scene Types

Choose ONE that best matches the input:
- `dialogue` - Conversation-focused scenes
- `cinematic` - Narrative-driven scenes with camera work
- `animation` - Animated or motion-graphics scenes
- `music-video` - Music-driven scenes with rhythm
- `action` - High-energy scenes with movement
- `establishing` - Setting/location establishment
- `product` - Product showcase/commercial
- `abstract` - Non-narrative, experimental

### Visual Section (REQUIRED)

ALWAYS include this section with ALL fields:

```json
"visual": {
  "subject": ["array", "of", "subjects"],  // Who/what is in scene (min 1 item)
  "setting": "where scene takes place",
  "environment": "environmental details",
  "colors": "dominant color palette",
  "lighting": "lighting characteristics",
  "composition": "framing and arrangement",
  "style": "visual aesthetic"
}
```

### Temporal Section (OPTIONAL)

Include ONLY if scene has clear time progression:

```json
"temporal": [
  {
    "time": "0-3s",
    "description": "what happens during segment",
    "camera": "camera behavior (optional)",
    "visual": "visual changes (optional)",
    "audio": "audio changes (optional)"
  }
]
```

### Audio Section (OPTIONAL)

Include ONLY if scene has notable sound elements:

```json
"audio": {
  "dialogue": ["quoted", "speech"],      // optional
  "ambient": ["environmental", "sounds"], // optional
  "soundEffects": ["specific", "sounds"], // optional
  "music": "musical elements"             // optional
}
```

### Camera Section (OPTIONAL)

Include ONLY if scene has specific camera work:

```json
"camera": {
  "movement": "camera motion",              // optional
  "angles": ["specific", "angles"],         // optional
  "techniques": "cinematic techniques",     // optional
  "lensDetails": "lens specs"               // optional
}
```

## Semantic Extraction Guidelines

### Visual Structure (ALL FIELDS REQUIRED)
- **subject**: Array of who/what is in scene (e.g., ["woman walking"], ["car", "cityscape"])
- **setting**: Physical location (e.g., "beach at sunset", "urban street at night")
- **environment**: Surrounding details (e.g., "sandy shore with gentle waves, open horizon")
- **colors**: Dominant palette (e.g., "warm golden orange, deep blue ocean")
- **lighting**: Quality/direction (e.g., "natural golden hour backlighting from setting sun")
- **composition**: Framing (e.g., "subject in left third, walking toward right")
- **style**: Aesthetic (e.g., "cinematic naturalism with warm color grading")

### Temporal Structure (INCLUDE IF APPLICABLE)
- Break scene into time-based segments if there's progression
- Use format "0-3s", "3-7s", etc. for time field
- Each segment describes what happens during that window
- OMIT if scene is static or single moment

### Audio Structure (INCLUDE IF APPLICABLE)
- **dialogue**: Quoted speech as array items
- **ambient**: Background environmental sounds as array
- **soundEffects**: Specific sounds as array
- **music**: Musical elements as string
- OMIT entire section if no audio elements

### Camera Structure (INCLUDE IF APPLICABLE)
- **movement**: Dolly, pan, tilt, tracking, static, etc.
- **angles**: Array of angles (eye-level, low-angle, etc.)
- **techniques**: Lens choice, depth of field, etc.
- **lensDetails**: Focal length, aperture, etc.
- OMIT entire section if no specific camera work

## Examples

### Example 1: Simple Cinematic Scene

Input: "A woman walks along a beach at sunset"

Output:
```json
{
  "format": "structured",
  "version": "2.0.0",
  "sceneType": "cinematic",
  "sections": {
    "visual": {
      "subject": ["woman walking"],
      "setting": "beach at sunset",
      "environment": "sandy shore with gentle waves lapping, open horizon with scattered clouds",
      "colors": "warm golden orange from setting sun, deep blue ocean, soft purple sky",
      "lighting": "natural golden hour backlighting from setting sun, warm rim light on subject",
      "composition": "subject in left third of frame, walking toward right, ocean filling background",
      "style": "cinematic naturalism with warm color grading, shallow depth of field"
    },
    "temporal": [
      {
        "time": "0-3s",
        "description": "Woman walks steadily along the beach as the sun sets on the horizon",
        "camera": "Slow dolly forward following the subject",
        "visual": "Sunlight gradually dims, colors shift from golden to deep orange",
        "audio": "Ocean waves grow slightly louder as camera approaches"
      },
      {
        "time": "3-7s",
        "description": "Woman continues walking, footsteps visible in wet sand",
        "camera": "Camera maintains steady dolly forward",
        "visual": "Sunset deepens, shadows lengthen",
        "audio": "Waves consistent, gentle breeze audible"
      }
    ],
    "audio": {
      "ambient": ["gentle ocean waves", "soft breeze"],
      "soundEffects": ["footsteps on wet sand"]
    },
    "camera": {
      "movement": "slow dolly forward tracking the subject",
      "angles": ["medium shot", "slightly low angle"],
      "techniques": "shallow depth of field (f/2.8), natural light cinematography",
      "lensDetails": "35mm focal length, f/2.8 aperture"
    }
  }
}
```

### Example 2: Dialogue Scene

Input: "Two people having coffee in a cafe, one says 'I've been thinking about what you said'"

Output:
```json
{
  "format": "structured",
  "version": "2.0.0",
  "sceneType": "dialogue",
  "sections": {
    "visual": {
      "subject": ["person 1 seated", "person 2 seated across"],
      "setting": "interior coffee shop",
      "environment": "cozy cafe with warm lighting, coffee cups on table, comfortable seating",
      "colors": "warm browns and creams, natural wood tones",
      "lighting": "soft diffused interior lighting, natural window light from side",
      "composition": "medium two-shot, subjects facing each other, balanced framing",
      "style": "intimate conversational framing, warm naturalistic aesthetic"
    },
    "audio": {
      "dialogue": ["I've been thinking about what you said"],
      "ambient": ["quiet cafe atmosphere", "distant murmur of conversations"],
      "soundEffects": ["coffee cup set down on table"]
    },
    "camera": {
      "movement": "subtle push-in during dialogue",
      "angles": ["eye-level", "slightly over-the-shoulder"],
      "techniques": "conversational depth of field, standard framing"
    }
  }
}
```

### Example 3: Static Establishing Shot

Input: "A misty mountain range at dawn"

Output:
```json
{
  "format": "structured",
  "version": "2.0.0",
  "sceneType": "establishing",
  "sections": {
    "visual": {
      "subject": ["mountain peaks"],
      "setting": "mountain range at dawn",
      "environment": "layers of misty mountains receding into distance, valleys filled with fog",
      "colors": "soft blues and purples transitioning to warm dawn light, white mist",
      "lighting": "early morning diffused light, sun rising behind peaks creating rim light",
      "composition": "wide establishing shot, mountains layered from foreground to background",
      "style": "serene landscape cinematography, atmospheric depth"
    }
  }
}
```

## Important Rules

@include[rules/obscuring_figures_full.md]

1. **Output ONLY valid JSON** - No markdown code fences, no explanations
2. **All visual fields are REQUIRED** - Never omit subject, setting, environment, colors, lighting, composition, or style
3. **Optional sections only if applicable** - Omit temporal/audio/camera if not relevant
4. **Subject must be array** - Even single subject: ["woman walking"]
5. **Dialogue/ambient/soundEffects must be arrays** - Even single item: ["ocean waves"]
6. **Time format strict** - Must match pattern "X-Ys" (e.g., "0-3s", "3-7s")
7. **sceneType must match enum** - One of: dialogue, cinematic, animation, music-video, action, establishing, product, abstract

## Now Process the User's Input

Analyze the natural language input above and generate the structured JSON intermediate representation.

**CRITICAL**: Your response must be ONLY valid JSON. No text before or after. Start with `{` and end with `}`.
