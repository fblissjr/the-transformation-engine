---
id: veo3_prompt_structure
version: 1.0.0
model: veo3
description: Official 6-element prompt framework for Veo 3 (from Google DeepMind API documentation)
source: https://ai.google.dev/gemini-api/docs/video
---

**VEO 3 OFFICIAL PROMPT FRAMEWORK: 6 CORE ELEMENTS**

Google DeepMind's official documentation specifies 6 essential elements for effective Veo 3 prompts. Structure your prompts around these components:

## 1. Subject (30-50 words recommended)

**What:** Main character, object, or focus of your video

**Guidelines:**
- Physical appearance details (age, clothing, accessories, facial features)
- For characters with dialogue: voice characteristics ("warm confident voice", "excited child's voice")
- Be specific enough for visual consistency across 8 seconds
- Include expressions and mannerisms for living subjects

**Examples:**
- "A woman in her 40s with shoulder-length silver hair, wearing a navy blue business suit, holding a leather briefcase, confident stride"
- "Vintage red 1967 Mustang convertible with chrome details, white leather interior, gleaming in sunlight"
- "Golden retriever puppy, 3 months old, floppy ears, playful energy, wagging tail"

## 2. Action (Specificity is Critical)

**What:** What happens during the 8-second clip

**Guidelines:**
- Frame-by-frame breakdown for complex movements
- Specify start state and end state
- Include environmental interactions
- Describe motion dynamics (speed, direction, energy level)
- For micro-narratives: beginning → middle → end structure

**Examples:**
- "Walks confidently toward camera, pauses to check watch, looks up with surprised expression, quickens pace"
- "Pours coffee from French press into ceramic mug, steam rises, lifts mug to lips, first sip with satisfied expression"
- "Leaps from rooftop ledge, body tucked mid-air rotation, extends legs for landing, rolls forward on impact"

## 3. Style (Artistic Direction)

**What:** Visual aesthetic and genre of your video

**Guidelines:**
- Specify photorealism level (hyper-realistic, stylized, animated, stop-motion)
- Reference genres if helpful (film noir, documentary, sci-fi, fantasy)
- Artistic movements or directors (optional but effective)
- Medium characteristics (35mm film grain, digital clean, watercolor animation)

**Examples:**
- "Cinematic realism with shallow depth of field, independent film aesthetic"
- "Stop-motion animation with clay textures, Wes Anderson inspired color palette"
- "Documentary style, handheld camera feel, natural lighting, verite approach"
- "Cyberpunk aesthetic with neon lighting, rain-slicked surfaces, Blade Runner inspired"

## 4. Camera (Technical Cinematography)

**What:** Camera positioning, angle, and movement

**Shot Types:**
- Close-up (CU), Medium shot (MS), Wide shot (WS), Extreme Wide Shot (EWS)
- Extreme close-up (XCU) for detail focus

**Camera Movement:**
- Static (locked off, no movement)
- Pan (horizontal rotation: pan left/right)
- Tilt (vertical rotation: tilt up/down)
- Dolly (physical movement: dolly in/out, dolly left/right)
- Tracking (follows subject movement)
- Crane (vertical elevation change)
- Aerial (overhead, bird's eye view)

**Angle:**
- Eye-level, low-angle (looking up), high-angle (looking down), Dutch angle (tilted)

**Focus:**
- Deep focus (everything sharp), shallow depth of field (selective focus), rack focus (focus shift)

**Example:**
- "Slow dolly-in from medium shot to close-up over 8 seconds, eye-level angle, shallow depth of field, smooth gimbal movement (0.5 meters forward)"

## 5. Composition (Framing)

**What:** How elements are arranged within the frame

**Guidelines:**
- Rule of thirds positioning (place subjects at intersection points)
- Foreground/midground/background layering (depth creation)
- Symmetry or asymmetry (intentional balance/imbalance)
- Leading lines (directional guidance for viewer's eye)
- Frame within frame (windows, doorways, architectural elements)
- Headroom and looking room (space around subjects)

**Examples:**
- "Subject positioned at right third, facing left with generous looking room, blurred foreground foliage creates depth, background shows distant mountains"
- "Perfect symmetry: centered subject, architectural elements mirror on both sides, vanishing point perspective"
- "Dynamic asymmetry: subject lower left third, negative space upper right, diagonal composition suggests movement"

## 6. Ambiance (Mood & Atmosphere)

**What:** Lighting, color, weather, and emotional tone

**Lighting Types:**
- Golden hour (warm, soft, angled sunlight)
- Blue hour (cool, twilight, pre-dawn)
- Harsh shadows (direct sunlight, dramatic contrast)
- Soft diffused (overcast, studio softbox equivalent)
- Neon (artificial, colorful, urban nightlife)
- Rembrandt lighting (triangle of light on shadow side of face)
- Backlighting (rim light, silhouette potential)

**Color Palette:**
- Warm (oranges, reds, yellows - inviting, energetic)
- Cool (blues, greens, purples - calm, melancholic)
- Monochrome (black and white, single color variations)
- Vibrant (saturated, high contrast, energetic)
- Muted (desaturated, subtle, sophisticated)

**Weather/Environment:**
- Sunny, overcast, rainy, foggy, snowy, windy, stormy

**Mood:**
- Upbeat, melancholic, tense, peaceful, mysterious, dramatic, intimate, epic

**Example:**
- "Golden hour lighting from left side creating warm Rembrandt lighting, slight overcast softens shadows, warm color grading emphasizing oranges and yellows, peaceful nostalgic mood"

---

## OPTIMAL PROMPT LENGTH

**Target: 200-400 words**
- Below 200 words: Insufficient detail, model makes unpredictable choices
- 200-400 words: Sweet spot for control and quality
- Above 400 words: Diminishing returns, potential confusion
- Token limit: 1,024 tokens (approximately 800-850 words maximum)

---

## COMPLETE EXAMPLE (6 Elements Integrated)

**Subject:** Man in his 30s with dark curly hair, beard, wearing faded denim jacket over white t-shirt, carrying vintage film camera around neck, curious expression, gentle energy.

**Action:** Walks slowly down narrow cobblestone alley, pauses mid-stride to look up at hanging string lights, raises camera to eye level, adjusts focus ring, captures photo, camera click sound audible, lowers camera with satisfied smile, continues walking forward.

**Style:** Cinematic documentary realism with subtle 35mm film grain aesthetic, warm analog color grading, authentic urban explorer vibe.

**Camera:** Tracking shot following from behind and slightly to the side at eye-level, camera maintains 3-meter distance, smooth gimbal movement matching subject's pace, final 2 seconds shifts to over-shoulder perspective showing his view.

**Composition:** Subject positioned right third of frame with generous leading room ahead, narrow alley walls create natural leading lines toward vanishing point, string lights create depth layering overhead, selective focus keeps subject sharp while background has gentle bokeh.

**Ambiance:** Late afternoon golden hour light filtering between buildings creating dappled shadows on cobblestones, warm color palette emphasizing amber tones, peaceful contemplative mood, gentle breeze suggested by swaying string lights, quiet intimate atmosphere of hidden urban space.

**Audio:** Footsteps on cobblestones (rhythmic, measured pace), distant urban ambiance (muffled traffic, faint voices), camera shutter click (vintage mechanical sound), subtle ambient street sounds (wind, distant music), no dialogue.

---

## PRO TIP: USE GEMINI TO EXPAND

Official recommendation from Google DeepMind: Start with simple description, then use Gemini (LLM) to expand using this 6-element framework before generating video. This workflow yields more consistent, higher-quality outputs.
