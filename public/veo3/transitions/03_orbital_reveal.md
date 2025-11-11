# Orbital Reveal Transition (Veo 3.1)

## Transition Type
**Camera-Based**: Orbital Camera Movement

## Description
Camera orbits around a subject (clockwise or counter-clockwise), and during the orbit, the scene gradually transforms. Often uses reflections, windows, or mirrors to facilitate the visual morphing.

## Use Cases
- Time passage (day to night, season changes)
- Location changes with same character
- Emotional transformation
- Dream sequences or reality shifts

## Anatomy
1. **Scene A State** (0-2s): Establish subject and starting environment
2. **Transition Technique** (2-6s): Orbital camera movement with gradual scene morphing
3. **Scene B Reveal** (6-8s): Orbit completes, new environment fully revealed
4. **Audio Bridge**: Gradual audio transformation matching orbital motion

## Prompt Template

```
Medium shot of {{subject}} {{position}} in {{scene_a_location}}, {{scene_a_details}}. The camera begins a slow orbital movement around {{subject}}, circling {{direction}}. As the camera moves {{orbital_phase}}, the {{transition_element}} gradually transitions - {{visual_transformation}}. When the camera completes the {{degree_rotation}} orbit to {{final_position}}, {{subject}} is now {{scene_b_position}} in {{scene_b_location}}, {{scene_b_details}}.

Audio: {{scene_a_audio}} subtly transform into {{scene_b_audio}} during the orbit, fully transitioning by the time the camera reaches the {{final_position}} view.
```

## Variables
- `subject`: Character or focal point
- `position`: Starting position (standing at window, sitting at desk)
- `scene_a_location`: Starting environment
- `scene_a_details`: Visual/atmospheric details
- `direction`: clockwise or counter-clockwise
- `orbital_phase`: behind her, to the side, around the front
- `transition_element`: Window reflection, mirror image, environment itself
- `visual_transformation`: How scene morphs (city lights morph into mountains, day becomes night)
- `degree_rotation`: 180-degree, 360-degree
- `final_position`: front view, opposite side, starting position
- `scene_b_position`: Subject's position in new scene
- `scene_b_location`: New environment
- `scene_b_details`: New scene visual details
- `scene_a_audio`: Starting audio
- `scene_b_audio`: Ending audio

## Example from Research

```
Medium shot of a woman standing at a window in a dark apartment, city lights reflecting on glass, gazing outward pensively. The camera begins a slow orbital movement around her, circling clockwise. As the camera moves behind her, the reflection in the window gradually transitions - the city lights morph into dawn breaking over mountains. When the camera completes the 180-degree orbit to face her from the front, she is now standing at the same window but the apartment is bright with morning light, and through the window, mountain peaks are visible instead of skyscrapers.

Audio: Urban night sounds (distant sirens, traffic hum) subtly transform into nature sounds (birds chirping, wind in trees) during the orbit, fully transitioning by the time the camera reaches the front view.
```

## Scene Extension Integration
**Best Match**: Transition method
**Preservation**: Subject continuity (same character), Visual Style (similar framing)
**User Prompt Keywords**: "orbit around", "camera circles", "360 degree", "revolving camera"

## Red Flags to Avoid
- Unclear orbital direction
- Instant transformation (should be gradual)
- Missing transition element (reflection, mirror, window)
- Audio cuts instead of transforms

## Success Criteria
- Clear orbital direction specified
- Gradual visual morphing during orbit
- Subject maintains position/pose
- Transformation element enhances believability
- Audio evolves smoothly throughout orbit
- Spatial coherence maintained
