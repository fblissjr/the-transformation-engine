# Color/Tone Match Transition (Veo 3.1)

## Transition Type
**Match Cut**: Color Palette Match

## Description
A bold, saturated color completely fills the frame, acting as a visual bridge. Camera emerges from the color field to reveal a completely different scene with the same dominant color.

## Use Cases
- Mood continuity with location change
- Stylistic transitions
- Color-driven narratives
- Emotional throughlines

## Anatomy
1. **Scene A State** (0-3s): Establish scene with dominant color element
2. **Transition Technique** (3-5s): Camera tracks into color, fills frame
3. **Scene B Reveal** (5-8s): Camera emerges from color into new scene
4. **Audio Bridge**: Brief muffled quality during color void, then new audio emerges

## Prompt Template

```
{{scene_a_description}}, {{camera_movement_a}} moving through {{color_source_a}}, {{details_a}}. As the camera moves forward, the {{color_description}} completely fills the frame, creating a solid {{color_name}} field. The {{color_name}} field holds for a brief moment, then camera continues forward to reveal the {{color_name}} is now {{color_source_b}}. The camera emerges from behind the {{color_source_b}} onto {{scene_b_location}}, {{scene_b_details}}.

Audio: {{scene_a_audio}} transitions into muffled, dampened sound as {{color_source_a}} fills frame ({{color_name}} void), then {{scene_b_audio}} emerges as {{color_source_b}} is revealed.
```

## Variables
- `scene_a_description`: Starting scene with color source
- `camera_movement_a`: Close-up tracking shot, dolly forward, push in
- `color_source_a`: Poppies, painted wall, fabric, flowers, colored lights
- `details_a`: Scene A atmospheric details
- `color_description`: Red petals, blue paint, vibrant yellow fabric
- `color_name`: Red, blue, green, yellow, orange, purple
- `color_source_b`: Curtain, wall, sky, different object with same color
- `scene_b_location`: New environment type
- `scene_b_details`: Scene B description
- `scene_a_audio`: Starting audio
- `scene_b_audio`: New audio environment

## Example from Research

```
A field of vibrant red poppies swaying in the wind under overcast sky, close-up tracking shot moving through the flowers, petals filling frame with saturated red tones. As the camera moves forward, the red petals completely fill the frame, creating a solid red field. The red field holds for a brief moment, then camera continues forward to reveal the red is now a velvet curtain in a theater. The camera emerges from behind the curtain onto an empty stage, house lights dim, rows of theater seats visible.

Audio: Outdoor wind rustling through flowers, bees buzzing transitions into muffled, dampened sound as flowers fill frame (red void), then theater acoustics emerge (echo, creaking seats, distant HVAC) as curtain is revealed.
```

## Scene Extension Integration
**Best Match**: Transition method
**Preservation**: Color palette, saturation level, mood
**User Prompt Keywords**: "color fills frame", "through color", "emerges from", "color field transition"

## Red Flags to Avoid
- Color not bold/saturated enough
- Color field too brief (needs to hold)
- Missing audio muffling during color void
- Weak connection between color sources

## Success Criteria
- Dominant color clearly established
- Camera motion motivated and continuous
- Color completely fills frame at midpoint
- Brief hold on solid color field
- Natural emergence into Scene B
- Audio dampening during color void
- Thematic or emotional connection maintained
