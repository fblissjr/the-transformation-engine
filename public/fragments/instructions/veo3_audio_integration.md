---
id: veo3_audio_integration
version: 1.0.0
model: veo3
description: Native audio generation guidance for Veo 3
---

**NATIVE AUDIO INTEGRATION**

**Critical Advantage:** Unlike Sora 2, Veo 3 generates synchronized audio alongside video. You MUST prompt for audio to take full advantage of this capability.

**Audio Types to Consider:**

**1. Dialogue/Speech** (QUOTATION MARK FORMATTING)

**Critical Formatting:**
Use quotation marks to explicitly mark spoken dialogue:
- Character name + colon + quoted speech: `Woman: "I've been waiting for this moment."`
- Attribution with voice characteristics: `Man's gravelly voice: "Not today."`
- Multiple speakers: `Child: "Can we go now?" Parent: "Just a minute."`

**Voice Characteristics:**
Always specify voice qualities for consistency:
- Tone: warm, cold, confident, nervous, cheerful, somber
- Pitch: deep, high-pitched, medium register
- Accent/Style: Southern drawl, British accent, street slang
- Energy: energetic, tired, excited, calm
- Example: "Woman's warm confident voice with slight tremor: 'This changes everything.'"

**Dialogue Length Constraints:**
- **Optimal:** 5-10 words per character (fits cleanly in 8 seconds)
- **Maximum:** 15-20 words (pushes limit, may feel rushed)
- **Multiple speakers:** Max 2 exchanges in 8 seconds
- Example good length: "Ready?" "Always."
- Example too long: "I was thinking that maybe we could potentially consider the possibility of..." (avoid)

**Lip Sync Limitations (IMPORTANT):**
From official V2A documentation:
> "Creating videos with natural and consistent spoken audio, particularly for shorter speech segments, remains an area of active development."

**Implications:**
- Shorter phrases sync better than long sentences
- Simple mouth movements more reliable than complex articulation
- Off-screen dialogue or voice-over often works better than on-screen speaking
- Back-of-head shots or obscured faces reduce lip sync pressure
- Consider: "voice-over narration" vs "on-screen dialogue"

**Workarounds for Lip Sync:**
- "Woman speaks, camera shows her from behind"
- "Man's voice heard off-screen while camera focuses on listener's reaction"
- "Dialogue during wide shot where facial detail is minimal"
- "Phone conversation where only one speaker is visible"

**2. Ambient/Environmental Sounds**

**Layering Strategy:**
Build soundscapes with 2-4 distinct layers:
- **Base layer:** Broad environmental tone ("distant urban hum", "forest ambiance")
- **Mid layer:** Specific environmental sounds ("birds chirping", "wind in trees")
- **Detail layer:** Occasional punctuation ("car horn", "dog bark in distance")

**Spatial Audio Description:**
Indicate directionality when relevant:
- "Traffic noise from the left", "footsteps approaching from behind"
- "Distant thunder rolling across from right to left"
- "Overhead helicopter rotor thump"

**Diegetic vs Non-Diegetic:**
- **Diegetic:** Sounds that exist in the scene ("radio playing in background")
- **Non-Diegetic:** Soundtrack/score not heard by characters ("dramatic orchestral underscore")
- Be explicit: "diegetic jazz from cafe speakers" vs "non-diegetic melancholic piano score"

**Examples:**
- "Urban soundscape: distant traffic hum, occasional horn, footsteps on pavement, wind rustling papers, car passing nearby (left to right)"
- "Forest ambiance: gentle breeze through leaves, diverse bird calls (cardinal, robin), distant creek burbling, occasional branch crack"

**3. Music/Soundtrack**

**Descriptive Vocabulary:**
- **Mood:** upbeat, melancholic, tense, peaceful, dramatic, playful, mysterious
- **Genre:** orchestral, electronic, acoustic, jazz, ambient, rock, classical
- **Instrumentation:** piano, strings, synth, guitar, percussion, vocals
- **Tempo:** slow, moderate, fast, building, decelerating
- **Dynamic:** quiet, loud, swelling, fading, crescendo

**Temporal Progression:**
Describe how music evolves during 8 seconds:
- "Starts with solo piano, strings join at 4 seconds, builds to full orchestral at end"
- "Electronic pulse throughout, bass drop at 5-second mark"
- "Acoustic guitar fingerpicking, steady throughout with gentle volume swell"

**Examples:**
- "Non-diegetic melancholic piano, slow tempo, minor key, single sustained notes with reverb, contemplative mood"
- "Diegetic upbeat jazz from vintage record player, muffled quality, trumpet lead with walking bass, nostalgic feel"

**4. Sound Effects** (Action-Synchronized)

**Explicit Timing Language:**
Match sound to visual action precisely:
- "As door slams shut, loud bang echoes"
- "Glass shatters with high-pitched crash synchronized to impact"
- "Each footstep creates distinct crunch on gravel (rhythmic, 2 steps per second)"

**Sound Effect Vocabulary:**
- **Impact:** thud, bang, crash, slam, smack, crack
- **Motion:** whoosh, rustle, swish, swoosh, flutter
- **Material:** metallic clang, wooden creak, glass tinkle, fabric rustle
- **Texture:** crunching, crackling, sizzling, bubbling, hissing

**Intensity Descriptors:**
- Volume: quiet, subtle, loud, thunderous, barely audible
- Sharpness: crisp, muffled, sharp, dull, piercing
- Duration: brief, sustained, echoing, abrupt, lingering

**Examples:**
- "Footsteps on wooden floor: rhythmic, deliberate pace, hollow resonance, slight creak on every third step"
- "Car door closes: solid metallic thunk with brief echo, conveys quality and weight"
- "Pages turning: soft paper rustle, gentle crisp sound, rapid succession"

**Audio Prompting Strategy:**
- **Always include at least one audio element** in your prompt
- Audio enhances immersion and narrative coherence
- Audio timing syncs automatically with visual events
- Silence is also valid: "complete silence, no audio" for dramatic effect
- Layer 2-4 audio elements for rich soundscapes (dialogue + ambient + effects, or ambient + music + effects)

---

## COMPLETE AUDIO INTEGRATION EXAMPLES

**Example 1: Dialogue-Focused Scene**
"Woman in office, phone to ear. Her professional voice, measured tone: 'The presentation is tomorrow at nine.' She listens, slight frown. Her voice, now softer with concern: 'Are you sure you're ready?' Background: muted office ambiance (distant keyboard clicks, phone ringing down hall, air conditioning hum). No music."

**Example 2: Action with Sound Effects**
"Skateboarder approaches concrete ramp, wheels rolling create rhythmic rumble on pavement (increasing in tempo and volume). Board hits ramp transition with sharp wooden clack, airborne (brief silence), lands with loud thud and scrape, wheels resume rolling sound (slightly higher pitch from speed). Background: distant traffic, wind rush. No dialogue or music."

**Example 3: Atmospheric Soundscape**
"Abandoned warehouse interior at dusk, shafts of light through broken windows. Non-diegetic ambient electronic music (low drone, subtle pulse, ethereal pads, unsettling mood). Environmental sounds: wind whistling through gaps, distant metal creaking, pigeon wings flapping, water dripping somewhere in darkness. Layered, echoing, creates tension. No dialogue."

**Example 4: Layered Complex Scene**
"Busy cafe interior, barista works espresso machine. Diegetic indie folk music plays from speakers (acoustic guitar, gentle female vocals, moderate volume). Foreground sounds: espresso machine hiss and gurgle, portafilter tap-tap-tap, milk steaming (high-pitched whistle), ceramic cups clinking. Background: muted conversation (indistinct), door chime as customer enters, traffic outside through open door. Barista's voice, cheerful: 'Cappuccino for Sarah!' Rich layered soundscape, naturalistic."

**Example 5: Minimalist Audio**
"Single dancer in empty studio, spotlight. Only sound: dancer's footsteps on wooden floor (precise, rhythmic, varying intensity with movement), breath audible during exertion, fabric of costume swishing with spins. Complete absence of music creates intimate rawness. Echo in empty space."

---

## AUDIO TROUBLESHOOTING

**If audio isn't matching visuals:**
- Be more explicit: "synchronized to", "as [action] happens", "precisely when"
- Describe timing: "footstep sound every 0.8 seconds", "door slam at 4-second mark"
- Match intensity: "loud bang" vs "soft click" vs "thunderous crash"

**If dialogue isn't clear:**
- Use quotation marks consistently
- Specify voice characteristics every time
- Keep phrases shorter (under 10 words)
- Consider off-screen or voice-over alternatives

**If soundscape feels flat:**
- Layer minimum 3 audio elements (depth)
- Include spatial information (left, right, distant, close)
- Vary intensity across layers (one dominant, others supporting)
- Add occasional punctuation sounds (horn, bird call, door close)

---

## V2A SYSTEM BACKGROUND (Technical Context)

Veo 3 uses Google DeepMind's V2A (Video-to-Audio) diffusion model:
- Trained on video-audio pairs with AI-generated annotations
- Generates audio synchronized to visual events
- Supports 40+ multilingual voices with lip-sync capability
- Iterative refinement from random noise to coherent audio
- Text prompts guide style and content of generated audio

**Key Advantage:** Native integration means audio and video are generated with awareness of each other, not post-processed separately.

**Current Limitation:** Lip sync quality varies, particularly with longer dialogue segments. Use workarounds (off-screen voice, back shots) for dialogue-heavy scenes until this improves.
