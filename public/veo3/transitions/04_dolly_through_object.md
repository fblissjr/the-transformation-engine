# Dolly Through Object Transition (Veo 3.1)

## Transition Type
**Camera-Based**: Dolly Through Threshold

## Description
Camera physically moves through a threshold object (door, window, archway, tunnel) and emerges into a completely different scene. The threshold crossing is the moment of transition.

## Use Cases
- Fantasy sequences
- Memory transitions
- Portal effects
- Dramatic location changes
- Time period shifts

## Anatomy
1. **Scene A State** (0-3s): Establish starting scene with threshold visible
2. **Transition Technique** (3-5s): Camera passes through threshold
3. **Scene B Reveal** (5-8s): Camera emerges into new scene
4. **Audio Bridge**: Acoustics transform during threshold pass-through

## Prompt Template

```
{{shot_type}} following {{subject}} {{action}} through {{scene_a_location}} towards {{threshold_object}}, {{scene_a_details}}. The camera dollies forward {{speed}}, following {{subject}} through the {{threshold_object}}. As the camera passes through the threshold, the scene transitions: the camera emerges not into {{expected_space}}, but into {{scene_b_location}}, and {{subject}} is now {{scene_b_transformation}}, {{scene_b_action}}, {{scene_b_details}}.

Audio: {{scene_a_audio}} transform during the {{threshold_object}} pass-through into {{scene_b_audio}}.
```

## Variables
- `shot_type`: Tracking shot, dolly shot, steadicam shot
- `subject`: Main character or focal point
- `action`: Running, walking, moving forward
- `scene_a_location`: Starting environment
- `threshold_object`: Door, doorway, window, archway, tunnel, curtain, mirror
- `scene_a_details`: Atmospheric details of Scene A
- `speed`: Rapidly, steadily, slowly
- `expected_space`: What viewer might expect beyond threshold
- `scene_b_location`: Actual revealed environment
- `scene_b_transformation`: How subject changed (now a man in explorer's clothing, older version of themselves)
- `scene_b_action`: What subject does in Scene B
- `scene_b_details`: Scene B environmental details
- `scene_a_audio`: Starting audio with acoustic signature (echoing footsteps, suburban ambiance)
- `scene_b_audio`: New audio environment

## Example from Research

```
Tracking shot following a young boy running through a suburban house hallway towards an open doorway, his footsteps echoing on hardwood floors, afternoon sunlight streaming through the door. The camera dollies forward rapidly, following the boy through the doorway. As the camera passes through the threshold, the scene transitions: the camera emerges not into another room, but into a dense jungle, and the boy is now a man in explorer's clothing, still running forward but now pushing through thick vines and foliage, dappled green light filtering through the canopy.

Audio: Indoor acoustics (echoing footsteps, suburban ambiance) transform during the doorway pass-through into lush jungle sounds (rustling leaves, distant animal calls, muffled footsteps on earth).
```

## Scene Extension Integration
**Best Match**: Transition method
**Preservation**: Subject continuity (transformed but recognizable), Motion continuity (maintains forward movement)
**User Prompt Keywords**: "through door", "passes through", "emerges into", "portal transition"

## Red Flags to Avoid
- No visible threshold in Scene A
- Instant transition (threshold crossing should take 2-3s)
- Subject discontinuity without explanation
- Missing acoustic transformation

## Success Criteria
- Threshold object clearly established
- Continuous forward camera motion
- Smooth pass-through moment
- Subject maintains motion across transition
- Acoustic environment shifts convincingly
- Surprising but coherent Scene B reveal
