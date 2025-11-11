# Rack Focus Shift Transition (Veo 3.1)

## Transition Type
**Creative**: Depth of Field Transition

## Description
Camera maintains composition but shifts focus from foreground to background (or reverse). The blurred background is unrecognizable, but when brought into focus, reveals a completely different scene than expected.

## Use Cases
- Attention shifts (subjective to objective)
- Surprise reveals
- Memory intrusions into present
- Perspective changes (what character sees vs. reality)

## Anatomy
1. **Scene A State** (0-3s): Establish sharp foreground, blurred background
2. **Transition Technique** (3-6s): Gradual rack focus from foreground to background
3. **Scene B Reveal** (6-8s): Background sharp, foreground gone or blurred, scene transformed
4. **Audio Bridge**: Audio "out of focus" muffling during transition

## Prompt Template

```
{{shot_type}} of {{foreground_subject}} in sharp focus in the foreground, {{foreground_details}}. Behind {{pronoun}}, completely out of focus and blurred, are {{background_description_vague}}. The camera maintains this composition but gradually shifts focus: the {{foreground_subject}} softens and blurs while the background sharpens. As the background comes into focus, we see it's {{background_actual}} - not {{expectation_subverted}}. When fully in focus, the {{foreground_subject}} is {{foreground_fate}}; we've transitioned entirely to {{scene_b_description}}.

Audio: During focus shift, all sounds become slightly muffled and distant (representing auditory "out of focus"), then as {{scene_b_focus_element}} comes into sharp focus, {{audio_b}} become crisp and clear.
```

## Variables
- `shot_type`: Close-up, medium close-up, portrait shot
- `foreground_subject`: Man's face, character's eyes, object in hand
- `foreground_details`: Expression, lighting, emotional state
- `pronoun`: Him, her, them
- `background_description_vague`: Indistinct colorful shapes, soft lights, blurred movement
- `background_actual`: Completely different scene details revealed
- `expectation_subverted`: What colors/shapes suggested
- `foreground_fate`: No longer in frame, also blurred, faded away
- `scene_b_description`: New scene full description
- `scene_b_focus_element`: Specific element that becomes sharp
- `audio_b`: New scene audio (children laughing, party sounds, traffic)

## Example from Research

```
Close-up of a man's face in sharp focus in the foreground, serious expression, dimly lit. Behind him, completely out of focus and blurred, are indistinct colorful shapes and soft lights. The camera maintains this composition but gradually shifts focus: the man's face softens and blurs while the background sharpens. As the background comes into focus, we see it's a completely different scene than expected - not the environment suggested by the colors, but a bright children's birthday party, balloons and decorations. When fully in focus, the man is no longer in frame; we've transitioned entirely to the party scene, camera now focused on children playing.

Audio: During focus shift, all sounds become slightly muffled and distant (representing auditory "out of focus"), then as party comes into sharp focus, party sounds (children laughing, music, conversations) become crisp and clear.
```

## Scene Extension Integration
**Best Match**: Transition method
**Preservation**: Can preserve color palette, lighting quality from blurred hints
**User Prompt Keywords**: "rack focus to reveal", "focus shifts to", "background comes into focus", "depth of field transition"

## Red Flags to Avoid
- Background recognizable when blurred
- Instant focus shift (needs 2-3s minimum)
- No audio focus effect
- Foreground subject lingers too long after background sharp

## Success Criteria
- Clear sharp/blurred separation initially
- Background truly unrecognizable when blurred
- Gradual, smooth focus shift
- Surprise when background revealed
- Audio muffling enhances effect
- Complete transition to background scene
- Foreground element naturally exits/fades
