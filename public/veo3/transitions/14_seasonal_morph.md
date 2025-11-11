# Seasonal Morph Transition (Veo 3.1)

## Transition Type
**Environmental**: Seasonal Transformation

## Description
Camera moves vertically (usually descending or ascending) while seasons transition around a location. Forest shifts from summer green to autumn colors to winter snow as camera travels.

## Use Cases
- Long time passage (months or years)
- Cyclical narratives
- Memory sequences spanning seasons
- Establishing isolation or persistence

## Anatomy
1. **Scene A State** (0-2s): Starting season established with camera beginning motion
2. **Transition Technique** (2-6s): Seasonal progression during camera movement
3. **Scene B Reveal** (6-8s): New season arrival, camera completes motion
4. **Audio Bridge**: Seasonal soundscapes morph continuously

## Prompt Template

```
{{camera_movement}} {{camera_direction}} {{location_description}}, surrounded by {{start_season_description}}, {{start_season_details}}. As the camera {{movement_continues}}, the {{environment_element}} gradually transitions: {{seasonal_progression_details}}. By the time the camera reaches {{camera_destination}}, {{end_season}} has fully arrived: {{end_season_description}}.

Audio: {{start_season_audio}} gradually fade and thin as {{seasonal_indicator}}, {{transition_audio_elements}}, then {{end_season_audio}}, ending with {{final_audio_detail}}.
```

## Variables
- `camera_movement`: Drone shot, aerial view, crane shot
- `camera_direction`: Descending toward, ascending from, circling around
- `location_description`: Solitary house in clearing, mountain cabin, forest lodge
- `start_season_description`: Lush green summer forest, autumn colors, spring blooms
- `start_season_details`: Birds singing, bright sunshine, warm atmosphere
- `movement_continues`: Descends, ascends, circles, travels
- `environment_element`: Forest, trees, landscape, vegetation
- `seasonal_progression_details`: Leaves shift from green to orange and red then fall, snow begins to accumulate, flowers bloom
- `camera_destination`: Ground level, peak height, full circle
- `end_season`: Winter, spring, autumn, summer
- `end_season_description`: Detailed description of end state
- `start_season_audio`: Summer forest sounds, spring birdsong, autumn rustling
- `seasonal_indicator`: Leaves fall, flowers bloom, snow falls
- `transition_audio_elements`: Wind grows colder, insects fade, temperature shifts
- `end_season_audio`: Winter silence, spring awakening, summer buzz
- `final_audio_detail`: Specific audio detail that punctuates arrival

## Example from Research

```
Drone shot slowly descending toward a solitary house in a clearing, surrounded by lush green summer forest, birds singing, bright sunshine. As the camera descends, the forest gradually transitions: leaves shift from green to orange and red autumn colors, then fall from trees, revealing bare branches. Snow begins to fall, dusting the branches and roof. By the time the camera reaches ground level, arriving at the front door of the house, winter has fully arrived: deep snow covers the ground, icicles hang from the eaves, and smoke rises from the chimney into a grey winter sky.

Audio: Summer forest sounds (birds, insects, rustling leaves) gradually fade and thin as leaves fall, wind grows colder and more prominent, then winter silence with soft snow falling and wind whistling, ending with the crackle of a fireplace faintly audible from inside the house.
```

## Scene Extension Integration
**Best Match**: Transition method
**Preservation**: Location (same place, different season), architecture
**User Prompt Keywords**: "seasons change", "through seasons", "time passes seasons", "seasonal transition"

## Red Flags to Avoid
- Seasonal progression too fast or abrupt
- Camera motion stops during transition
- Illogical seasonal order (unless intentional)
- Missing seasonal audio shifts

## Success Criteria
- Clear starting season established
- Camera motion provides temporal pacing
- Gradual, visible seasonal changes
- Natural progression (or explained reversal)
- Audio reflects acoustic changes (lush vs. sparse)
- Location recognizably constant
- End season clearly arrived
