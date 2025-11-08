---
id: veo3_best_practices
version: 1.0.0
model: veo3
category: instruction
description: Research-backed best practices for Veo 3 prompts with good/bad examples
---

**VEO 3 BEST PRACTICES**

## Critical Constraints

**Duration**: 8 seconds (fixed)
**Optimal Length**: 200-400 words
**Input Limit**: Up to 1,024 tokens (~800-850 words maximum, rarely needed)
**Framework**: 9-element structure (expansion of official 6-element)
**Audio**: **NATIVE GENERATION** - V2A system generates dialogue, ambient sounds, music
**Resolution**: 720p or 1080p
**Frame Rate**: 24fps

## What Veo 3 Needs

### 1. Technical Specifications
Always specify at the start:

✅ **REQUIRED**:
```
Duration: 8s | Resolution: 720p | Aspect Ratio: 16:9 | Frame Rate: 24fps
```

### 2. Audio Elements (CRITICAL - Veo 3's Key Differentiator)
**ALWAYS include audio**. Even ambient silence is a choice worth describing.

❌ **BAD** (no audio):
```yaml
subject: A woman in a coffee shop
action: She sits and drinks coffee
```

✅ **GOOD** (audio integrated):
```yaml
audio_elements: |
  Dialogue: Woman's voice, calm and measured: "I've thought about this moment for three years."
  Ambient: Muted café chatter (indistinct), gentle clinking of cups and plates, distant jazz piano (Miles Davis style), espresso machine hiss in distance
```

**Audio Formatting Rules:**
- Use quotation marks for dialogue: `"Character: 'exact words'"`
- Specify voice characteristics: `"gravelly voice", "cheerful tone"`
- Layer ambient sounds: dialogue + ambient + music/effects
- Keep dialogue short (lip sync challenges with longer speech)

### 3. Character Consistency (30-50 Words Minimum)
For any scene with people, provide DETAILED character descriptions.

❌ **BAD** (too vague):
```
A woman in her 30s
```

✅ **GOOD** (detailed for consistency):
```
Woman in her early 30s, shoulder-length wavy dark brown hair tucked behind one ear, warm brown eyes, wearing a charcoal turtleneck sweater and simple gold necklace. Slight smile lines around her eyes.
```

### 4. Narrative Structure (8-Second Arc)
Frame your scene as a mini-story: beginning → middle → end

❌ **BAD** (no progression):
```
A man sits in a park
```

✅ **GOOD** (narrative arc):
```
[0-2s] Man sits on bench, looks down at phone with furrowed brow
[2-5s] He looks up, notices something off-frame, expression shifts to curiosity
[5-8s] He stands, pockets phone, walks toward what caught his attention
```

### 5. 9-Element Framework Coverage
Use relevant elements from the framework:

**Core elements** (use in most prompts):
1. Subject (who/what - detailed)
2. Context (where/when)
3. Action (what happens - with narrative arc)
4. Audio Elements (ALWAYS - dialogue/ambient/music)
5. Camera Motion (specific movements)

**Supporting elements** (use when relevant):
6. Style (visual aesthetic)
7. Lighting & Mood (atmosphere)
8. Background/Setting (environment details)
9. Composition (framing, rule of thirds)

### 6. Negative Prompting Strategy
Describe what you WANT, not what you don't want.

❌ **BAD** (negative language):
```
No blur, no grain, no people in background, don't show face
```

✅ **GOOD** (positive alternatives):
```
Sharp focus, crystal clear detail, empty café background, subject shown from behind
```

## Prompt Length Guidelines

**Minimum**: 150 words (below this, insufficient detail)
**Optimal**: 200-400 words (sweet spot for Veo 3)
**Maximum**: ~600 words (1,024 token limit allows more, but diminishing returns)

❌ **TOO SHORT** (80 words):
```
A coffee shop. Two people talking. Camera moves in. They look emotional. Jazz music plays.
```

✅ **OPTIMAL LENGTH** (320 words):
*See veo3_coffee_shop.md for full example with proper detail and audio integration*

## Structure Priority Order

For best results, organize prompts in this order:

1. **Technical Specs** (duration, resolution, fps)
2. **Subject** (30-50 word character descriptions if people)
3. **Context** (setting, location, time, environment)
4. **Action** (what happens, narrative progression)
5. **Audio Elements** (dialogue + ambient + music/effects)
6. **Camera Motion** (movements with parameters)
7. **Style** (visual aesthetic)
8. **Lighting & Mood** (atmosphere, emotional tone)
9. **Background/Setting** (environmental details)
10. **Composition** (framing, focal points)

## Common Anti-Patterns

### Anti-Pattern 1: Missing Audio
❌ **CRITICAL ERROR**:
```yaml
subject: A chef in a kitchen
action: Prepares a meal
# NO AUDIO ELEMENTS - this wastes Veo 3's native audio generation!
```

✅ **CORRECT**:
```yaml
audio_elements: |
  Sound effects: Sizzling pan, knife chopping on board, water running
  Ambient: Busy kitchen atmosphere, muffled conversation from dining room
```

### Anti-Pattern 2: Vague Character Descriptions
❌ **BAD**:
```
A man and a woman talk
```

✅ **GOOD**:
```
Man in mid-30s with short sandy hair, dark-framed glasses, navy blue button-down shirt. Woman in early 30s, shoulder-length wavy dark brown hair, warm brown eyes, charcoal turtleneck.
```

### Anti-Pattern 3: Using "No" or "Don't"
❌ **BAD**:
```
No blur, don't show the face, no background people, never pan left
```

✅ **GOOD**:
```
Sharp focus throughout, subject shown from behind, empty background, static camera position
```

### Anti-Pattern 4: Overstuffing 8 Seconds
❌ **BAD**:
```
[0-2s] Woman enters café, orders coffee, sits down
[2-4s] Checks phone, makes call, hangs up
[4-6s] Friend arrives, they hug, sit together
[6-8s] Both laugh, drink coffee, leave together
```

This is 4 distinct scenes crammed into 8 seconds. Veo 3 works best with ONE focused moment.

✅ **GOOD**:
```
[0-8s] Woman sits at café table, gazes out window contemplatively. Slowly brings coffee cup to lips, takes a sip. A slight smile forms as she notices something outside.
```

## Audio Integration Examples

### Example 1: Dialogue Scene
```yaml
audio_elements: |
  Dialogue: Woman, calm voice with slight tremor: "I've thought about this for three years."
  Ambient: Soft café chatter (indistinct), gentle cup clinking, distant jazz piano
  Note: All background audio layered at low volume to prioritize dialogue clarity
```

### Example 2: Nature Scene (No Dialogue)
```
audio_elements: |
  Ambient: Forest soundscape - rustling leaves, distant bird calls (robin, blue jay)
  Sound effects: Footsteps on forest floor (twigs snapping, leaf crunching)
  Music: None (natural scene relies on environmental sounds)
```

### Example 3: Product Reveal
```
audio_elements: |
  Sound effects: Subtle whoosh as product rotates, soft click as it settles
  Music: Minimalist electronic ambient (warm pads, no percussion)
  Ambient: Clean room tone, studio silence background
```

## Word Count Targets by Scene Type

**Dialogue-heavy scene**: 250-350 words (prioritize character detail + audio)
**Action sequence**: 200-300 words (motion detail + sound effects)
**Atmospheric mood piece**: 300-400 words (sensory detail + ambient soundscape)
**Product/commercial**: 200-250 words (visual precision + minimal audio)

## Key Takeaways

✅ **DO**:
- ALWAYS include audio elements (dialogue, ambient, effects, or music)
- Provide 30-50 word character descriptions for consistency
- Use quotation marks for dialogue
- Create narrative arc within 8-second constraint
- Use positive language (describe what you want, not what you don't)
- Layer multiple audio elements (dialogue + ambient + effects)
- Aim for 200-400 words total
- Use professional cinematic terminology

❌ **DON'T**:
- Skip audio elements (wastes Veo 3's key feature!)
- Use vague character descriptions
- Use negative language ("no blur", "don't show")
- Try to cram multiple scenes into 8 seconds
- Describe long dialogue (lip sync limitations)
- Forget narrative structure (beginning/middle/end)
- Exceed 600 words (diminishing returns)

## Special Note: 9-Element vs 6-Element Framework

Google's official docs describe 6 elements: Subject, Action, Style, Camera, Composition, Ambiance.

Our 9-element framework is an **intentional expansion**:
- Subject → Subject (with 30-50 word detail requirement)
- Action → Context + Action (separates "where/when" from "what happens")
- Style → Style (unchanged)
- Camera → Camera Motion (more specific terminology)
- Composition → Composition (unchanged)
- Ambiance → Audio Elements + Lighting & Mood + Background/Setting

This expansion reflects Veo 3's native audio generation (V2A) and provides more granular control. Both approaches work - use what fits your creative process.
