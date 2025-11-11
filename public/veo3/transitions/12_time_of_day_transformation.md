# Time-of-Day Transformation Transition (Veo 3.1)

## Transition Type
**Environmental**: Temporal Environmental Shift

## Description
Camera remains completely static while time accelerates around a fixed composition. Lighting shifts from dawn through day to dusk/night, with people and elements appearing and disappearing in accelerated time-lapse.

## Use Cases
- Time passage at single location
- Location constancy with temporal change
- Reflection or contemplation scenes
- Establishing long durations quickly

## Anatomy
1. **Scene A State** (0-8s continuous): Static camera observes time acceleration
   - Dawn (0-2s)
   - Midday (2-4s)
   - Afternoon (4-6s)
   - Dusk/Night (6-8s)
2. **Audio Bridge**: Continuous audio time-lapse matching visual progression

## Prompt Template

```
{{camera_setup}} of {{location_description}} at {{start_time}}, {{start_details}}. The camera holds steady on this composition. Gradually, the light shifts: the {{start_lighting}} transitions through {{midday_lighting}}, {{afternoon_lighting}}, to {{end_lighting}}. Throughout this accelerated time-lapse, {{activity_changes}}. As the light reaches {{end_time}}, {{end_state}}.

Audio: {{start_audio}} builds to {{midday_audio}} then fades to {{evening_audio}}, creating an auditory time-lapse matching the visual.
```

## Variables
- `camera_setup`: Wide shot, static shot, locked-off composition
- `location_description`: Park bench under oak tree, street corner, building facade
- `start_time`: Dawn, early morning, sunrise
- `start_details`: Starting atmospheric details (empty, dew on grass, soft light)
- `start_lighting`: Pink dawn glow, soft morning light, golden sunrise
- `midday_lighting`: Bright overhead sun, harsh shadows, full daylight
- `afternoon_lighting`: Warm slanted light, lengthening shadows, golden hour
- `end_lighting`: Orange sunset, deep blue twilight, moonlight
- `activity_changes`: People appear and disappear, shadows sweep across, clouds race by
- `end_time`: Dusk, twilight, night
- `end_state`: Final composition details
- `start_audio`: Dawn chorus, early morning sounds
- `midday_audio`: Peak activity sounds
- `evening_audio`: Night sounds, quieter ambiance

## Example from Research

```
Wide shot of a park bench under a large oak tree at dawn, empty, soft pink light, dew on grass, birds beginning to sing. The camera holds steady on this composition. Gradually, the light shifts: the pink dawn glow transitions through golden morning, bright midday sun, warm afternoon light, to orange sunset. Throughout this accelerated time-lapse, people appear and disappear on the bench - a jogger rests, a couple has lunch, a man reads a book - but the camera never moves. As the light reaches deep blue twilight, a lone figure sits on the bench, matching the empty dawn feeling.

Audio: Dawn chorus (birds chirping) builds to daytime park sounds (children playing, dogs barking, conversations) then fades to evening crickets and distant city sounds, creating an auditory time-lapse matching the visual.
```

## Scene Extension Integration
**Best Match**: Continue method (same location, time progresses)
**Preservation**: Location, composition, camera angle (all static)
**User Prompt Keywords**: "time-lapse", "day to night", "time passes", "static camera time progression"

## Red Flags to Avoid
- Camera moves (must remain completely static)
- Instant lighting changes (should be gradual)
- No activity variation
- Missing audio progression

## Success Criteria
- Camera absolutely static throughout
- Gradual, continuous lighting shift
- Clear temporal markers (shadows, activity, light quality)
- Background elements show time passage (clouds, shadows)
- Audio evolves matching time progression
- Emotional arc supported by temporal journey
