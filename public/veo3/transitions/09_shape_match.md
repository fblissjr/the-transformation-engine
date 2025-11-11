# Shape Match Transition (Veo 3.1)

## Transition Type
**Match Cut**: Shape/Composition Match

## Description
A prominent shape (circle, rectangle, silhouette) is maintained in frame while its identity transforms. The visual anchor of the shape creates continuity through the scene change.

## Use Cases
- Time passage (moon to clock, eye to lens)
- Symbolic connections
- Poetic transitions
- Chapter changes
- Thematic parallels

## Anatomy
1. **Scene A State** (0-2s): Establish shape in scene
2. **Transition Technique** (2-5s): Shape holds position while morphing
3. **Scene B Reveal** (5-8s): Shape's new identity revealed, context pulled back
4. **Audio Bridge**: Gradual transformation, not abrupt cut

## Prompt Template

```
{{scene_a_shot}} of {{shape_object_a}} in {{scene_a_location}}, {{scene_a_details}}. The camera holds on the {{shape_description}}. Slowly, the {{shape_object_a}} begins to {{transformation_verb}} and the image transforms: the {{shape_description}} remains centered in frame, but the {{shape_object_a}} morphs into {{shape_object_b}}, {{scene_b_context}}. The camera {{camera_movement}} to reveal {{scene_b_full_reveal}}.

Audio: {{scene_a_audio}} transitions into {{scene_b_audio}} as the {{transformation_descriptor}} completes, then {{scene_b_audio_build}}.
```

## Variables
- `scene_a_shot`: Extreme close-up, close-up, medium shot
- `shape_object_a`: Full moon, circular window, eye, wheel, etc.
- `scene_a_location`: Night sky, building facade, character's face
- `scene_a_details`: Atmospheric details
- `shape_description`: Circular shape, rectangular form, specific geometry
- `transformation_verb`: Dissolve, morph, shift, transform
- `shape_object_b`: Clock face, vinyl record, iris, different object with same shape
- `scene_b_context`: Context around new object (on clock tower, in hand, in frame)
- `camera_movement`: Pulls back, pushes in, remains static, tilts down
- `scene_b_full_reveal`: Full new scene description
- `scene_a_audio`: Starting audio
- `transformation_descriptor`: Moon-to-clock morph, visual transformation
- `scene_b_audio`: Audio during transformation
- `scene_b_audio_build`: How audio builds after reveal

## Example from Research

```
Extreme close-up of a full moon in a dark night sky, craters visible in sharp detail, no sound except faint wind. The camera holds on the moon's circular shape. Slowly, the moon begins to dissolve and the image transforms: the circular shape remains centered in frame, but the moon morphs into a clock face on a city clock tower at dawn, hands showing 6:00 AM. The camera pulls back slightly to reveal the clock tower against a brightening sky, birds flying past, and the city waking below.

Audio: Night silence with distant wind transitions into dawn sounds (early bird chirps, distant car starting) as the moon-to-clock morph completes, then city morning ambiance builds.
```

## Scene Extension Integration
**Best Match**: Transition method
**Preservation**: Shape geometry, compositional anchor point
**User Prompt Keywords**: "morphs into", "transforms to", "becomes", "shape match"

## Red Flags to Avoid
- Shape doesn't maintain position in frame
- Transformation too fast (needs 2-3s minimum)
- Weak visual connection between objects
- Audio cuts instead of transforms

## Success Criteria
- Clear shape established in Scene A
- Shape maintains frame position
- Gradual morphing/dissolve
- Strong symbolic or visual connection
- Camera movement completes reveal
- Audio transformation matches visual timing
