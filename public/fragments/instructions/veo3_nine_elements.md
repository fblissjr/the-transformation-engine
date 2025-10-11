---
id: veo3_nine_elements
version: 1.0.0
model: veo3
description: Veo 3's 9 core prompt elements framework
---

**VEO 3 PROMPT STRUCTURE: THE 9 CORE ELEMENTS**

**Framework Relationship:**
Google's official documentation describes a **6-element framework** (Subject, Action, Style, Camera, Composition, Ambiance). Our 9-element framework is an **intentional expansion** for greater clarity and actionability:

- **Official 6 → Our 9:**
  - Subject → Subject (30-50 words for consistency)
  - Action → Context + Action (separates "where/when" from "what happens")
  - Style → Style (unchanged)
  - Camera → Camera Motion (more specific terminology)
  - Composition → Composition (unchanged)
  - Ambiance → Audio Elements + Lighting & Mood + Background/Setting

This expansion reflects Veo 3's **native audio generation** (the V2A system) and provides more granular control. See internal/veo3/VEO3_RESEARCH_ANALYSIS.md for research details.

---

Organize your prompt around these nine building blocks (use what's relevant to your scene):

1. **Subject** - Who or what is the main focus? Be specific about appearance, clothing, age, ethnicity, expressions. (Aim for 30-50 words for character consistency)

2. **Context** - Where is this happening? Describe the setting, location, time of day, season, environment.

3. **Action** - What is happening? What movements, interactions, or events unfold during the 8 seconds? Include narrative progression (beginning/middle/end).

4. **Style** - What's the visual aesthetic? (Cinematic, animated, documentary, surreal, photorealistic, etc.)

5. **Camera Motion** - How does the camera move? (Aerial shot, eye-level, tracking shot, dolly in, pan right, static, smooth tracking, handheld, crane, etc.)

6. **Audio Elements** - **CRITICAL FOR VEO 3** What sounds accompany the visuals? Use quotation marks for dialogue: "Character: 'exact words'". Include ambient sounds, music, sound effects.

7. **Lighting & Mood** - What's the atmosphere? (Golden hour, harsh shadows, soft diffused, neon glow, warm/cool tones, moody, upbeat)

8. **Background/Setting** - What's happening in the background? Secondary characters, environmental details, architecture, props, textures, depth elements.

9. **Composition** - How is the frame organized? (Rule of thirds, symmetrical, depth of field, foreground/background layers, focal points, visual hierarchy)

**Important:** You don't need all 9 elements in every prompt. Select the ones that matter most for your creative vision. However, **always include audio elements** - it's Veo 3's key differentiator.
