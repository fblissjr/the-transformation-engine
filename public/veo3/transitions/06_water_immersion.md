# Water Immersion Transition (Veo 3.1)

## Transition Type
**Natural Element**: Water Surface Crossing

## Description
Camera crosses the water surface boundary (either breaking through from below or submerging from above). Water distortion, refraction, and droplets create a natural visual reset between scenes.

## Use Cases
- Mood inversions (bright to dark, day to night)
- Perspective shifts
- Dream to reality transitions
- Reflection-based reveals

## Anatomy
1. **Scene A State** (0-3s): Underwater or above water establishing scene
2. **Transition Technique** (3-5s): Breaking through surface with distortion
3. **Scene B Reveal** (5-8s): Distortion clears, new environment revealed
4. **Audio Bridge**: Muffled → splash/refraction sounds → new environment audio

## Prompt Template

```
{{scene_a_description}} {{position_relative_to_surface}}. {{subject}} {{action_toward_surface}} toward the surface. As the camera follows and {{surface_crossing}}, {{distortion_description}}. When the distortion clears, we are now {{perspective_shift}} {{scene_b_description}}.

Audio: {{scene_a_audio_quality}} give way to {{transition_audio}} {{refraction_sounds}}, then transition into {{scene_b_audio}}.
```

## Variables
- `scene_a_description`: Starting underwater/above water scene
- `position_relative_to_surface`: Near surface, floating beneath, looking down at water
- `subject`: Diver, character, or camera itself
- `action_toward_surface`: Swims upward, descends toward, approaches
- `surface_crossing`: Breaks through water surface, submerges beneath surface
- `distortion_description`: Water droplets scatter across lens, refraction distorting view, ripples obscure vision
- `perspective_shift`: Looking up from beneath, looking down through
- `scene_b_description`: New scene details
- `scene_a_audio_quality`: Underwater sounds (muffled), above water (clear)
- `transition_audio`: Chaotic surface splash, gentle ripples, dramatic breach
- `refraction_sounds`: Distortion sounds, water movement
- `scene_b_audio`: New audio environment

## Example from Research

```
A diver floats near the surface of a tropical ocean, bright sunlight filtering through the water from above, creating rippling light patterns. The diver slowly swims upward toward the surface. As the camera follows and breaks through the water surface - water droplets scattering across the lens, refraction distorting the view - the scene transitions. When the distortion clears, we are now looking up from beneath the surface of a rain puddle on a dark city street at night, with blurred figures and neon lights visible through the water above.

Audio: Underwater sounds (muffled bubbles, distant whale song) give way to chaotic surface splash and refraction sounds, then transition into rain hitting water, urban night ambiance (traffic, rain on pavement).
```

## Scene Extension Integration
**Best Match**: Transition method
**Preservation**: Water element (ocean → puddle, river → pool)
**User Prompt Keywords**: "breaks surface", "underwater to above", "through water", "submersion transition"

## Red Flags to Avoid
- Instant transition without distortion phase
- Missing water physics (droplets, refraction)
- Audio doesn't reflect muffled/clear distinction
- No visual justification for scene change

## Success Criteria
- Clear water boundary visible
- Gradual approach to surface
- Distortion phase clearly depicted
- Water droplets or refraction described
- Audio muffling/clarity shift
- Surprising but coherent Scene B reveal
