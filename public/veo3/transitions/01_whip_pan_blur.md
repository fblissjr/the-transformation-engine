# Whip Pan Blur Transition (Veo 3.1)

## Transition Type
**Camera-Based**: Whip Pan Blur

## Description
Fast horizontal camera rotation creating motion blur that acts as a visual transition between two scenes. The extreme speed of the pan completely obscures the frame, allowing the scene to change during the blur.

## Use Cases
- High-energy scene transitions
- Chase sequences
- Urgent tempo changes
- Fast-paced action montages

## Anatomy
1. **Scene A State** (0-2s): Establish starting scene with subject in motion
2. **Transition Technique** (2-6s): Fast whip pan creating horizontal blur
3. **Scene B Reveal** (6-8s): New scene revealed as pan completes
4. **Audio Bridge**: Sound distortion during blur, clarifying into new scene audio

## Technical Notes
- Whip pan should be described as "fast" or "rapid"
- Blur is natural result of camera motion (Veo 3.1 infers this)
- Audio distortion during blur adds realism
- Works best with 90-180 degree camera rotations
- Transition uses 4-6 seconds of the 8-second duration

## Prompt Template

```
{{scene_a_description}}, {{scene_a_action}}. As {{subject}} {{action_trigger}}, the camera performs a fast whip pan {{direction}}, blurring the entire scene into {{blur_description}}. The blur acts as a transition: when the whip pan stops, the scene is now {{scene_b_location}} and {{scene_b_description}}.

Audio: {{scene_a_audio}} distorts and pitches during the whip pan, then clarifies into {{scene_b_audio}} as the pan completes.
```

## Variables
- `scene_a_description`: Starting scene environment and setup
- `scene_a_action`: What subject is doing in Scene A
- `subject`: Main subject carrying through transition
- `action_trigger`: Action that motivates the pan (runs past, turns sharply, etc.)
- `direction`: Direction of pan (to follow, left, right, to the side)
- `blur_description`: Color/texture of blur (horizontal streaks of green and brown, blue and white motion blur)
- `scene_b_location`: New scene location
- `scene_b_description`: What's revealed in Scene B
- `scene_a_audio`: Starting audio environment
- `scene_b_audio`: Ending audio environment

## Example from Research

```
A detective runs towards the camera through a dense, quiet forest at dawn, footsteps crunching on dead leaves. As the detective runs past, the camera performs a fast whip pan to follow, blurring the entire scene into horizontal green and brown streaks. The blur acts as a transition: when the whip pan stops, the scene is now a city police station parking lot and the detective is running away from the camera towards the building entrance at midday.

Audio: Forest ambiance (birds, rustling leaves) distorts and pitches during the whip pan, then clarifies into urban sounds (distant traffic, footsteps on pavement) as the pan completes.
```

## Scene Extension Integration
**Best Match**: Transition method
**Preservation**: Visual Style (optional), Audio Bridge (required)
**User Prompt Keywords**: "whip pan", "fast pan", "camera follows rapidly", "blur transition"

## Red Flags to Avoid
- Transition too short (under 3 seconds)
- Missing audio bridge
- No color/texture description of blur
- Static subjects (whip pan works best with motion)

## Success Criteria
- Clear Scene A establishment (1-2s minimum)
- Fast, motivated camera motion
- Blur completely fills frame at midpoint
- Scene B clearly revealed by end
- Audio transformation matches visual timing
