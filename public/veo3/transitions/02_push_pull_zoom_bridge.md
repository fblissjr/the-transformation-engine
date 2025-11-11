# Push-In / Pull-Out Zoom Bridge Transition (Veo 3.1)

## Transition Type
**Camera-Based**: Zoom Bridge

## Description
Camera pushes in to an extreme close-up that obscures detail, then pulls back to reveal a completely different scene. The extreme close-up acts as a visual "reset" between scenes, often maintaining a similar subject (hands, eyes, object) across the transition.

## Use Cases
- Thematic connections (parallel storylines)
- Contrasting emotional states
- Time jumps (same person, different context)
- Symbolic transitions (trembling hands → steady hands)

## Anatomy
1. **Scene A State** (0-2s): Establish starting scene with focal subject
2. **Transition Technique** (2-5s): Push in to extreme close-up, then begin pull out
3. **Scene B Reveal** (5-8s): Pull back reveals new environment
4. **Audio Bridge**: Audio fades during extreme close-up, new environment emerges

## Technical Notes
- Extreme close-up should fill frame completely
- Similar subject in both scenes creates continuity (hands, face, object)
- Veo 3.1's depth perception makes this technique highly effective
- Audio fade during extreme close-up masks scene change smoothly

## Prompt Template

```
Close-up of {{scene_a_subject}} in {{scene_a_location}}, {{scene_a_details}}. The camera slowly pushes in, closer and closer to {{focal_point}} until the frame fills with {{extreme_closeup_description}}. As the extreme close-up resolves, the camera begins pulling back to reveal these are now {{scene_b_subject}} in {{scene_b_location}}, {{scene_b_details}}.

Audio: {{scene_a_audio}} fades into a low whoosh during extreme close-up, then {{scene_b_audio}} emerges.
```

## Variables
- `scene_a_subject`: Starting focal subject (suspect's hands, character's eyes, object detail)
- `scene_a_location`: Starting environment
- `scene_a_details`: Scene A atmospheric details
- `focal_point`: What camera zooms toward (fingers, texture, specific detail)
- `extreme_closeup_description`: What fills frame at peak zoom (blurred skin texture, abstract color field)
- `scene_b_subject`: Revealed subject (similar to Scene A but different context)
- `scene_b_location`: New environment
- `scene_b_details`: Scene B atmospheric details
- `scene_a_audio`: Starting audio environment
- `scene_b_audio`: Ending audio environment

## Example from Research

```
Close-up of a suspect's hands trembling on an interrogation room table, fluorescent light buzzing overhead. The camera slowly pushes in, closer and closer to the suspect's shaking fingers until the frame fills with blurred skin texture and motion. As the extreme close-up resolves, the camera begins pulling back to reveal these are now a surgeon's gloved hands, steady and precise, performing an operation in a bright surgical theater.

Audio: Interrogation room ambiance (fluorescent buzz, distant footsteps) fades into a low whoosh during extreme close-up, then surgical theater sounds emerge (beeping monitors, ventilator rhythm).
```

## Scene Extension Integration
**Best Match**: Transition method
**Preservation**: Visual Style (similar subjects maintain continuity)
**User Prompt Keywords**: "push in then pull out", "zoom bridge", "extreme close-up transition", "through detail"

## Red Flags to Avoid
- Unrelated subjects in Scene A and Scene B
- Skipping extreme close-up phase
- Missing audio fade
- Too fast push/pull (needs 2-3s each direction)

## Success Criteria
- Clear initial subject framing
- Gradual push-in motion
- Frame completely filled at midpoint
- Similar subject creates continuity
- Smooth pull-out revealing new context
- Audio transformation matches visual journey
