# Compound Transition: Whip Pan + Color Match (Veo 3.1)

## Transition Type
**Advanced/Compound**: Camera Movement + Visual Match

## Description
Combines fast whip pan camera motion with color palette matching. At the peak of the pan blur, a dominant color holds for a moment, then the pan completes to reveal a scene with the same color palette but completely different context.

## Use Cases
- Fast-paced montages
- Stylistic sequences
- Music video aesthetics
- High-energy narrative transitions

## Anatomy
1. **Scene A State** (0-2s): Establish scene with dominant color
2. **Transition Technique** (2-5s): Whip pan with color blur, color field holds
3. **Scene B Reveal** (5-8s): Pan completes, new scene with matched color
4. **Audio Bridge**: Whooshing distortion during blur, clarifies with color continuity

## Technical Notes
- More complex prompt requires higher token count (300-400 words)
- Color must be prominent and saturated in both scenes
- Motion continuity (walking, running) strengthens transition
- Veo 3.1 handles compound movements well

## Prompt Template

```
{{scene_a_shot}} in {{color_environment_a}}, {{scene_a_details}}. {{action_subject}} enters frame from the {{enter_direction}}, {{action_description}}. Our camera whip pans {{pan_direction}} to follow this {{action_subject}}, the {{color_environment_a}} blurring into horizontal streaks of {{color_name}}. At the peak of the whip pan blur, the {{color_name}} color field holds for a brief moment. When the whip pan completes and refocuses, we are now following {{scene_b_subject}} {{action_continued}} through {{color_environment_b}} - but the same {{action_type}} and {{color_name}} color palette creates seamless continuity.

Audio: {{audio_a}} distorts during whip pan into a whooshing blur sound, then clarifies into {{audio_b}} as pan settles.
```

## Variables
- `scene_a_shot`: Photographer crouches, character stands, subject positioned
- `color_environment_a`: Vibrant red poppy field, blue ocean scene, green forest
- `scene_a_details`: Scene A atmospheric details
- `action_subject`: Walking photographer, running person, moving character
- `enter_direction`: Right, left, background
- `action_description`: Walking briskly, running quickly, moving steadily
- `pan_direction`: Rapidly to follow, left to track, right to pursue
- `color_name`: Red, blue, green, orange, yellow
- `scene_b_subject`: Different person, same type of character, contrasting subject
- `action_continued`: Walking through, running across, moving through
- `color_environment_b`: Red-carpeted theater lobby, blue-lit corridor, green-screened studio
- `action_type`: Walking motion, running movement, same physical action
- `audio_a`: Starting audio environment
- `audio_b`: New audio environment

## Example from Research

```
A photographer crouches low in a vibrant red poppy field at golden hour, camera to their eye, focusing on a single flower. Another photographer enters frame from the right, walking briskly across the background. Our camera whip pans rapidly to follow this walking photographer, the red poppy field blurring into horizontal streaks of red. At the peak of the whip pan blur, the red color field holds for a brief moment. When the whip pan completes and refocuses, we are now following a different person walking through a completely different environment - a red-carpeted theater lobby - but the same walking motion and red color palette creates seamless continuity.

Audio: Outdoor field ambiance (wind, bees, rustling) distorts during whip pan into a whooshing blur sound, then clarifies into indoor theater lobby ambiance (muffled conversations, carpeted footsteps, air conditioning) as pan settles.
```

## Scene Extension Integration
**Best Match**: Transition method (high-energy)
**Preservation**: Color palette, motion type, rhythm
**User Prompt Keywords**: "whip pan color transition", "fast pan with color match", "color blur transition"

## Red Flags to Avoid
- Color not prominent enough in both scenes
- No motion continuity
- Missing color field hold at peak
- Weak audio whoosh during blur

## Success Criteria
- Strong color presence in Scene A
- Motivated camera pan (following action)
- Fast pan creates proper blur
- Color field briefly holds at peak
- Motion continues in Scene B
- Matched color in Scene B prominent
- Audio distortion matches visual blur
- Seamless despite dramatic change
