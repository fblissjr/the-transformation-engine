# Foreground Object Wipe Transition (Veo 3.1)

## Transition Type
**Creative**: Object Wipe

## Description
A large object (bus, train, wall, group of people) passes through the frame, temporarily obscuring the background. During this obscuration, the scene changes, but the subject maintains position and action.

## Use Cases
- Location changes with subject continuity
- "Magic trick" transitions
- Parallel routines (same activity, different places)
- Time jumps with visual surprise

## Anatomy
1. **Scene A State** (0-3s): Establish scene with subject and approaching wipe object
2. **Transition Technique** (3-5s): Object passes through, obscuring background
3. **Scene B Reveal** (5-8s): Object exits, new environment revealed
4. **Audio Bridge**: Wipe object sound temporarily masks background audio shift

## Prompt Template

```
{{shot_type}} of {{subject}} {{position}} at {{location_a}}, {{action}}, {{scene_a_details}}. {{wipe_object}} enters frame from the {{enter_direction}}, moving {{move_direction}}, temporarily blocking our view of {{subject}}. As the {{wipe_object}} passes through frame - its {{object_description}} completely obscuring the background - the background scene transitions. When the {{wipe_object}} exits frame on the {{exit_direction}}, {{subject}} is still {{position_maintained}} in {{similar_position}}, still {{action_continued}}, but {{pronoun}} is now {{location_b}}, {{scene_b_details}}.

Audio: {{audio_a}} is temporarily masked by {{wipe_object_sound}} as it passes, then {{audio_b}} emerges as {{wipe_object}} clears frame.
```

## Variables
- `shot_type`: Medium shot, wide shot, static shot
- `subject`: Character or focal person
- `position`: Sitting at table, standing at counter, walking along street
- `location_a`: Outdoor cafe, street corner, park
- `action`: Drinking coffee, reading book, talking on phone
- `scene_a_details`: Scene A environmental details
- `wipe_object`: City bus, train, truck, large group of people, closing door
- `enter_direction`: Left, right, top, bottom
- `move_direction`: Right to left, left to right, top to bottom
- `object_description`: Solid metal side, opaque exterior, mass of bodies
- `exit_direction`: Right, left, opposite of entry
- `position_maintained`: Sitting, standing, in same pose
- `similar_position`: Similar table, same posture, identical position
- `action_continued`: Drinking coffee, reading, same action
- `pronoun`: He, she, they
- `location_b`: Indoors in library, different outdoor location, contrasting environment
- `scene_b_details`: New environmental details
- `audio_a`: Starting audio environment
- `wipe_object_sound`: Bus engine, train rumble, crowd noise
- `audio_b`: New audio environment

## Example from Research

```
Medium shot of a man sitting at a cafe table outdoors, drinking coffee, people and cars passing behind him on the street. A city bus enters frame from the left, moving right, temporarily blocking our view of the man. As the bus passes through frame - its solid metal side completely obscuring the background - the background scene transitions. When the bus exits frame on the right, the man is still sitting at a similar table in the same position, still drinking coffee, but he is now indoors in a quiet library, bookshelves behind him instead of street, completely different environment.

Audio: Outdoor cafe ambiance (traffic, conversations, coffee machine) is temporarily masked by bus engine sound as it passes, then library ambiance (pages turning, quiet footsteps, whispers) emerges as bus clears frame.
```

## Scene Extension Integration
**Best Match**: Transition method
**Preservation**: Subject continuity, action continuity, composition
**User Prompt Keywords**: "bus passes through", "object wipes across", "passes in front", "obscures then reveals"

## Red Flags to Avoid
- Wipe object too small (must fill frame vertically)
- Subject changes position/action
- No clear entry and exit of object
- Missing sound mask during pass-through

## Success Criteria
- Subject and action clearly established
- Wipe object completely fills frame vertically
- Continuous horizontal motion of object
- Subject maintains exact position and action
- Background change is dramatic/surprising
- Audio temporarily masked by object
- Seamless subject continuity creates "magic" effect
