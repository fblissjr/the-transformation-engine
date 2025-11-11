# Movement/Gesture Match Transition (Veo 3.1)

## Transition Type
**Match Cut**: Action Match Cut

## Description
A specific physical motion or gesture continues across the scene cut. The momentum and arc of movement create continuity even as the context changes completely.

## Use Cases
- Thematic parallels (pitcher to conductor, runner to dancer)
- Occupational contrasts
- Rhythm matching
- Musical transitions
- Skill/action connections

## Anatomy
1. **Scene A State** (0-3s): Establish character beginning motion
2. **Transition Technique** (3-4s): Motion reaches critical point, scene cuts
3. **Scene B Reveal** (4-8s): Same motion completes in new context
4. **Audio Bridge**: Rhythm matches across cut, creating sonic continuity

## Prompt Template

```
{{scene_a_shot}} of {{character_a}} in {{scene_a_location}}, {{scene_a_activity}}, {{scene_a_details}}. The camera follows the motion as {{character_a}}'s {{body_part}} {{motion_description}}. At the moment of {{motion_peak}}, the scene cuts: the {{body_part}} is now {{character_b}}'s {{body_part_b}} in {{character_b_attire}}, completing the same {{motion_description}}, {{scene_b_action}}.

Audio: {{scene_a_audio}} matches timing with {{scene_b_audio}} at the moment of transition, creating a rhythmic bridge.
```

## Variables
- `scene_a_shot`: Medium shot, wide shot, tracking shot
- `character_a`: Baseball player, dancer, worker, etc.
- `scene_a_location`: Baseball diamond, stage, workplace
- `scene_a_activity`: Current action (winding up for pitch, preparing to jump)
- `scene_a_details`: Environmental and atmospheric details
- `body_part`: Arm, hand, leg, body
- `motion_description`: Swings forward, leaps upward, extends outward
- `motion_peak`: Release, apex, extension, strike
- `body_part_b`: Same or similar body part in new context
- `character_b`: Conductor, different athlete, artist
- `character_b_attire`: Formal attire, different uniform, contrasting costume
- `scene_b_action`: What motion accomplishes in new context
- `scene_a_audio`: Starting audio with rhythmic element
- `scene_b_audio`: New audio that rhythmically matches

## Example from Research

```
Medium shot of a baseball player in uniform winding up for a pitch on a sunny baseball diamond, crowd noise in background, player's arm drawing back. The camera follows the motion as the player's arm swings forward to release. At the moment of release, the scene cuts: the arm is now a conductor's arm in formal attire, completing the same sweeping motion, bringing down a baton in an elegant concert hall, orchestra responding.

Audio: Outdoor baseball ambiance (crowd cheering, bat cracks) matches timing with indoor concert hall ambiance (orchestra swell, acoustics) at the moment of transition, creating a rhythmic bridge.
```

## Scene Extension Integration
**Best Match**: Transition method
**Preservation**: Motion continuity, rhythm, physical momentum
**User Prompt Keywords**: "motion continues", "gesture matches", "movement carries through", "action match"

## Red Flags to Avoid
- Motion timing doesn't match between scenes
- Different motion arc or speed
- No rhythmic audio connection
- Cut point not at peak of action

## Success Criteria
- Clear establishment of motion in Scene A
- Motion builds to clear peak moment
- Cut happens at exact peak
- Motion completes naturally in Scene B
- Rhythm/timing preserved
- Audio reinforces rhythmic connection
- Thematic connection between actions clear
