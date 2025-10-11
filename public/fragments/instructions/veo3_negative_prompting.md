---
id: veo3_negative_prompting
version: 1.0.0
model: veo3
description: Negative prompting strategies and anti-patterns to avoid for Veo 3
source: https://ai.google.dev/gemini-api/docs/video & https://deepmind.google/models/veo/prompt-guide/
---

**VEO 3 NEGATIVE PROMPTING: DESCRIBE ALTERNATIVES, NOT NEGATIONS**

Veo 3's `negativePrompt` parameter exists, but official guidance emphasizes a counter-intuitive principle: describe what you WANT rather than what you DON'T want.

## THE CORE PROBLEM WITH NEGATION

**Psychological Priming Effect:**
When you say "no blur", the model focuses on the concept of "blur" even though you're negating it. This can paradoxically increase the likelihood of the unwanted element appearing.

**Better Approach:**
Describe the desired alternative state directly in your main prompt.

---

## ANTI-PATTERNS & SOLUTIONS

### 1. Visual Quality

**Avoid:**
- "no blur"
- "not blurry"
- "without grain"
- "no artifacts"
- "don't make it pixelated"

**Instead:**
- "sharp focus, crystal clear detail"
- "pristine image quality, HD clarity"
- "clean professional cinematography"
- "razor-sharp definition throughout frame"

### 2. Subject/Object Exclusion

**Avoid:**
- "no people"
- "without humans"
- "don't show any cars"
- "no text or logos"

**Instead:**
- "empty landscape, uninhabited wilderness"
- "deserted street, no visible pedestrians or vehicles"
- "clean product shot, isolated subject on neutral background"
- "natural scene, pristine environment"

### 3. Motion/Camera

**Avoid:**
- "no camera movement"
- "don't shake the camera"
- "without panning"
- "never zoom"

**Instead:**
- "static camera, locked off shot, completely still"
- "smooth stabilized footage, gimbal-quality steadiness"
- "fixed perspective throughout, no camera motion"
- "consistent framing, camera remains stationary"

### 4. Lighting/Mood

**Avoid:**
- "no harsh shadows"
- "not dark"
- "don't make it gloomy"
- "without bright spots"

**Instead:**
- "soft diffused lighting, gentle shadows"
- "well-lit scene, balanced exposure throughout"
- "upbeat bright atmosphere, cheerful mood"
- "even illumination, consistent lighting across frame"

### 5. Audio (Critical for Veo 3)

**Avoid:**
- "no music"
- "without dialogue"
- "don't include background noise"
- "no loud sounds"

**Instead:**
- "natural ambient soundscape only"
- "silent character movement, environmental sounds only"
- "clean acoustic environment, minimal ambient noise"
- "quiet intimate soundscape, subtle environmental audio"

### 6. Style/Aesthetic

**Avoid:**
- "not animated"
- "don't make it look fake"
- "without special effects"
- "no artistic stylization"

**Instead:**
- "photorealistic cinematography, natural lighting"
- "authentic documentary-style footage"
- "practical effects only, real-world physics"
- "naturalistic approach, unmanipulated imagery"

---

## WHEN TO USE THE `negativePrompt` PARAMETER

While describing alternatives in the main prompt is preferred, the `negativePrompt` parameter CAN be useful for:

**1. Technical Artifacts:**
```
negativePrompt: "watermarks, text overlays, UI elements, compression artifacts"
```
(These are technical issues, not creative choices)

**2. Stylistic Extremes:**
```
negativePrompt: "oversaturated, excessive contrast, artificial color grading"
```
(When your main prompt might be interpreted too intensely)

**3. Content Safety:**
```
negativePrompt: "violence, weapons, unsafe behavior"
```
(Reinforcing content policy compliance)

**Key Principle:** Use `negativePrompt` for TECHNICAL/SAFETY constraints, not creative direction.

---

## COMMON NEGATIVE LANGUAGE TO AVOID

**Words that trigger priming effect:**
- no, not, don't, never, without, avoid, exclude, remove, eliminate

**Phrases to eliminate:**
- "make sure there's no..."
- "I don't want..."
- "avoid showing..."
- "please exclude..."
- "remove any..."

---

## REFRAMING STRATEGY

**Step 1:** Identify what you're trying to avoid
**Step 2:** Ask "What's the opposite or alternative?"
**Step 3:** Describe that alternative positively and specifically

**Example Transformation:**

**Original (Negative):**
"A beach scene with no people, no buildings, no boats, and no litter. Don't show any man-made objects."

**Reframed (Positive):**
"A pristine uninhabited beach with natural shoreline, untouched sand, wild grasses at dune edge, driftwood scattered naturally, only ocean, sky, and coastal vegetation visible. Remote wilderness coastal landscape."

**Result:** Stronger positive direction, no psychological priming toward unwanted elements.

---

## CONFLICTING INSTRUCTIONS (Another Anti-Pattern)

**Avoid Internal Contradictions:**

**Bad:**
"Bright sunny day with dark moody lighting"
(Contradicts itself)

**Bad:**
"Fast-paced energetic action in a calm peaceful atmosphere"
(Mixed mood signals)

**Bad:**
"Ultra-realistic CGI animation"
(Oxymoron)

**Solution:**
Choose ONE clear direction. If you want contrast, describe it as intentional juxtaposition:
"Bright exterior visible through window contrasts with dim interior lighting creating dramatic chiaroscuro effect"

---

## COMBINING POSITIVE & NEGATIVE PROMPTING

**If you must use both:**

**Main Prompt (Positive, Descriptive):**
"Crystal clear macro shot of dewdrop on rose petal, sharp focus on water droplet showing internal refraction, soft bokeh background, morning light, pristine detail"

**Negative Prompt (Technical Constraints):**
"motion blur, lens flare, chromatic aberration"

**Ratio:** 90% of your creative direction in main prompt, 10% technical constraints in negative prompt.

---

## SPECIAL CASE: SILENCE/ABSENCE

**How to prompt for intentional absence:**

**For Visual Emptiness:**
"Minimalist composition, vast empty space, single subject isolated in frame, negative space dominates"

**For Audio Silence:**
"Complete silence, no audio, muted soundscape" OR "only subtle ambient sound, near-silent environment"

**For Stillness:**
"Frozen moment, no movement, static tableau, time suspended"

**Key:** Frame absence as an intentional PRESENCE of emptiness/silence/stillness.

---

## CHECKLIST: AUDIT YOUR PROMPT

Before generating, scan your prompt for:
- [ ] Any "no", "not", "don't", "never", "without" language
- [ ] Phrases focusing on what to avoid rather than achieve
- [ ] Conflicting instructions (bright + dark, fast + slow, etc.)
- [ ] Technical constraints better suited for negativePrompt parameter

**If found:** Reframe using positive alternatives above.

---

## OFFICIAL GUIDANCE SUMMARY

From Google DeepMind API documentation:
> "Negative prompts describe unwanted elements directly. Instead of 'no blur', use 'sharp focus, crystal clear'."

**Philosophy:** Guide the model toward what you want, not away from what you don't want. Positive direction yields more consistent, predictable results.
