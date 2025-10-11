---
id: sora2_best_practices
version: 1.0.0
model: sora2
category: instruction
description: Research-backed best practices for Sora 2 prompts with good/bad examples
---

**SORA 2 BEST PRACTICES** (Research-Based)

**Source**: US_2025259362_A1 (Prompt Editor Patent), SORA2_DOC_ANALYSIS.md

## Critical Constraints

**Duration**: 10 seconds (standard)
**Input Limit**: ~2500 characters maximum (hard API limit - prompts will be truncated!)
**Optimal Length**: 300-500 words (~1500-2400 characters)
**Training**: Fine-tuned on detailed 300-500 word image-to-text captions
**Architecture**: Diffusion-transformer with spacetime patches
**Audio**: Native video+audio generation (sound effects, music, dialogue generated automatically from visual content; explicit audio descriptions optional but can enhance soundtrack)

## What Sora 2 Needs

**Note**: Technical specs (duration, resolution, aspect ratio) are **UI-controlled**, not prompt parameters. Duration is fixed at 10s, resolution at 1920x1080, and aspect ratio is a simple toggle (landscape/portrait). Don't waste characters on these.

### 1. Temporal Progression (CRITICAL)
Describe HOW the scene evolves over 10 seconds. Spacetime patches process the entire video simultaneously - describe continuous progression, not snapshots.

❌ **BAD** (static description):
```
A deer standing in a forest
```

✅ **GOOD** (temporal evolution):
```
[00:00-00:03] A deer emerges from undergrowth, ears perked, alert posture
[00:03-00:07] Deer trots down path toward camera, sunlight catching russet fur
[00:07-00:10] Deer slows, turns head toward sound off-frame, pauses mid-step
```

### 2. Comprehensive Visual Detail
More detail = better results. Sora 2 was trained on DETAILED captions, not terse descriptions.

❌ **BAD** (terse):
```
A city at night
```

✅ **GOOD** (comprehensive):
```
A sprawling futuristic metropolis at dusk. Towering skyscrapers with illuminated windows pierce a hazy sky. Flying vehicles trace light paths between buildings. Neon signs in vibrant blues, purples, and pinks create color accents. Atmospheric haze and distance fog create depth layers. Holographic advertisements float near several buildings.
```

### 3. Camera Movement Specificity
Use precise cinematography terminology. Sora 2's spacetime patches respond well to specific camera descriptions.

❌ **BAD** (vague):
```
The camera moves forward
```

✅ **GOOD** (specific):
```
Smooth forward dolly (push-in) starting slow (0-3s) and building to moderate speed (3-10s). Movement is on steady axis toward central tower. Professionally stabilized - no shake or wobble. 35mm lens equivalent, f/2.8 aperture for shallow depth of field.
```

### 4. Audio Descriptions (Optional but Recommended)
Sora 2 generates audio automatically from visual content, but explicit audio descriptions can guide and enhance the soundtrack.

✅ **GOOD** (explicit audio guidance):
```yaml
audio_design: Gentle ocean waves with rhythmic ebb and flow, distant seabird calls, soft wind
```

✅ **ALSO GOOD** (visual-only, audio inferred):
```yaml
visual_description: Waves create rhythmic patterns on shore. Seabirds circle in background.
# (Audio will be generated automatically from visual content)
```

## Prompt Length Guidelines

**Minimum**: 200 words (insufficient detail below this)
**Optimal**: 300-500 words (matches training data)
**Maximum**: ~600 words (~2400 chars - stay under 2500 char API limit)

❌ **TOO SHORT** (50 words):
```
A person walks on a beach at sunset. The sky is orange. Waves lap at the shore. Camera follows from behind.
```

✅ **OPTIMAL LENGTH** (350 words):
*See sora2_beach_walk.md for full example with proper detail density*

## Structure Priority Order

For best results, organize prompts in this order:

1. **Technical Specs** (duration, resolution, aspect ratio)
2. **Temporal Progression** (how scene evolves 0-10s)
3. **Visual Description** (comprehensive environment/subject detail)
4. **Camera Movement** (specific techniques and parameters)
5. **Cinematography** (framing, composition, depth of field)
6. **Lighting** (setup, quality, direction, color temperature)
7. **Style** (aesthetic, color grading, film characteristics)

## Common Anti-Patterns

### Anti-Pattern 1: Conflicting Instructions
❌ **BAD**:
```
Bright sunny day with dark moody lighting
Fast action with slow contemplative pacing
```

### Anti-Pattern 2: Unspecified Duration/Resolution
❌ **BAD**:
```yaml
scene: A forest scene
# (No duration, resolution, or aspect ratio specified)
```

### Anti-Pattern 3: Vague Audio Descriptions
❌ **BAD** (vague):
```yaml
sounds: Nice sounds
music: Good music
```

✅ **GOOD** (specific):
```yaml
audio_design: Deep rolling thunder with 2-3 second delays, heavy rain with droplet impacts, gusting wind at 20-30 mph
```

### Anti-Pattern 4: Rapid Scene Changes
❌ **BAD**:
```
[0-2s] Interior hallway
[2-4s] Exterior street
[4-6s] Different building lobby
[6-8s] Rooftop
```

Sora 2's spacetime coherence works best with smooth, continuous scenes - not rapid cuts. Use storyboard approach (future feature) for multi-scene sequences.

## Word Count Targets by Scene Complexity

**Simple scene** (static environment, minimal action): 200-300 words
**Standard scene** (movement, camera work, evolution): 300-400 words
**Complex scene** (multiple elements, detailed progression): 400-500 words
**Maximum** (multi-stage, intricate): 500-600 words (stay under 2400 chars!)

## Key Takeaways

✅ **DO**:
- Specify duration, resolution, aspect ratio explicitly
- Describe temporal progression (how scene evolves)
- Use comprehensive visual detail (300-500 words)
- Use specific camera terminology
- Describe continuous, smooth motion
- Stay under 2500 character API limit

❌ **DON'T**:
- Include audio, sound effects, dialogue, or music
- Use vague or terse descriptions
- Leave technical specs unspecified
- Describe rapid scene cuts or abrupt changes
- Exceed 2500 character limit
- Use conflicting instructions
