# Smoke/Fog Obscuration Transition (Veo 3.1)

## Transition Type
**Natural Element**: Atmospheric Obscuration

## Description
Smoke, fog, mist, or similar atmospheric particles completely fill the frame, creating a temporary visual void. Scene changes during complete obscuration, then clears to reveal new environment.

## Use Cases
- Mysterious transitions
- Flashbacks or memory sequences
- Location changes with same character
- Atmospheric mood shifts

## Anatomy
1. **Scene A State** (0-2s): Establish starting scene with smoke/fog source
2. **Transition Technique** (2-5s): Smoke/fog fills frame completely
3. **Scene B Reveal** (5-8s): Obscuration clears, new scene revealed
4. **Audio Bridge**: Brief "void" moment during full obscuration, then new audio emerges

## Prompt Template

```
{{scene_a_description}}. {{subject}} {{smoke_action}} {{smoke_direction}} the camera. The {{smoke_type}} billows and fills the entire frame, becoming {{obscuration_description}} that obscures all details. As the {{smoke_type}} begins to {{clearing_action}}, it reveals not {{expected_continuation}} but {{scene_b_description}}.

Audio: {{scene_a_audio}} transitions into {{transition_audio}} as {{smoke_type}} fills frame, then {{scene_b_audio}} emerges as {{smoke_type}} clears.
```

## Variables
- `scene_a_description`: Starting scene setup
- `subject`: Character or source of obscuration
- `smoke_action`: Exhales, releases, walks through
- `smoke_direction`: Toward, across, around
- `smoke_type`: Smoke, fog, mist, dust, steam, powder
- `obscuration_description`: Dense white fog, thick cloud, swirling mist
- `clearing_action`: Thin and dissipate, clears, lifts
- `expected_continuation`: What viewer expects to see
- `scene_b_description`: Actual revealed scene
- `scene_a_audio`: Starting audio environment
- `transition_audio`: Soft whooshing wind, silence, muffled sounds
- `scene_b_audio`: New audio environment

## Example from Research

```
A detective stands in a dimly lit interrogation room, smoke from a cigarette curling upward. The detective exhales a thick cloud of smoke directly toward the camera. The smoke billows and fills the entire frame, becoming a dense white fog that obscures all details. As the fog begins to thin and dissipate, it reveals not the interrogation room but a misty forest at dawn, with the same detective now standing among moss-covered trees, breath visible in the cold air.

Audio: Indoor room tone with slight echo transitions into soft whooshing wind sounds as smoke fills frame, then forest ambiance (birds, rustling leaves, distant stream) emerges as fog clears.
```

## Scene Extension Integration
**Best Match**: Transition method
**Preservation**: Subject continuity (same character in different location)
**User Prompt Keywords**: "smoke fills frame", "fog transition", "obscured by", "clears to reveal"

## Red Flags to Avoid
- Smoke/fog doesn't completely fill frame
- No motivated source for obscuration
- Instant clearing (should be gradual)
- Missing audio void/muffling during obscuration

## Success Criteria
- Clear source of smoke/fog established
- Progressive filling of frame
- Complete obscuration at midpoint
- Gradual clearing phase
- Brief audio void or muffling
- Smooth emergence of new scene
- Same subject maintains continuity
