# Weather Transformation Transition (Veo 3.1)

## Transition Type
**Environmental**: Weather Shift

## Description
Rapid weather change (clear to storm, or vice versa) that culminates in a dramatic moment (lightning flash, downpour begins) which acts as the cut point to a new scene.

## Use Cases
- Mood changes (calm to chaotic, or reverse)
- Danger transitions
- Interior/exterior shifts
- Emotional metaphors (internal storm externalized)

## Anatomy
1. **Scene A State** (0-2s): Establish starting weather condition
2. **Transition Technique** (2-5s): Weather rapidly changes, builds intensity
3. **Dramatic Moment** (5-6s): Lightning flash, rain begins, weather peak
4. **Scene B Reveal** (6-8s): New scene revealed, weather effects carry over
5. **Audio Bridge**: Weather intensity builds, punctuates transition

## Prompt Template

```
{{subject}} {{position}} {{scene_a_location}} under {{start_weather}}, {{scene_a_details}}. {{subject}} {{reaction_action}}. As {{pronoun}} does, {{weather_change_description}}. Within seconds, the {{start_weather}} transitions to {{end_weather}}: {{weather_progression}}. {{subject}} {{final_action}} as {{weather_peak}}. In that {{dramatic_moment}}, the scene transitions: when the {{resolution}}, {{subject}} is now in {{scene_b_location}}, {{scene_b_details}}.

Audio: {{scene_a_audio}} transform into {{weather_audio_build}}. {{dramatic_audio}} punctuates transition, then {{scene_b_audio}} takes over.
```

## Variables
- `subject`: Character or focal point
- `position`: Stands on, walks through, sits in
- `scene_a_location`: Rooftop, field, street, outdoor location
- `start_weather`: Clear sunny skies, overcast, light rain
- `scene_a_details`: Scene A atmospheric details
- `reaction_action`: Looks up at sky, feels first drops, notices change
- `pronoun`: She, he, they
- `weather_change_description`: Dark clouds rapidly roll in, wind picks up, temperature drops
- `end_weather`: Overcast storm, torrential rain, blizzard, clearing
- `weather_progression`: Rain begins as scattered drops then downpour, lightning flashes, wind howls
- `final_action`: Stands in rain, shields eyes, runs for cover
- `weather_peak`: Lightning flashes, thunder cracks, rain intensifies
- `dramatic_moment`: Lightning flash, thunder crash, weather crescendo
- `resolution`: Flash fades, thunder echoes, rain continues
- `scene_b_location`: Interior or different exterior
- `scene_b_details`: New scene description with weather continuity
- `scene_a_audio`: Starting ambient sounds
- `weather_audio_build`: Rumbling thunder, wind, rain building
- `dramatic_audio`: Lightning crack, thunder boom
- `scene_b_audio`: New environment audio (may include weather effects)

## Example from Research

```
A woman stands on a city rooftop under clear sunny skies, buildings and blue sky visible behind her, warm light on her face. She looks up at the sky. As she does, dark clouds rapidly roll in from the edges of frame, shadows sweeping across the cityscape. Within seconds, the sunny day transitions to an overcast storm: rain begins to fall, first as scattered drops, then as a downpour. The woman stands in the rain as lightning flashes, briefly illuminating the scene. In that lightning flash, the scene transitions: when the flash fades, the woman is now in a dimly lit subway station, dripping wet, fluorescent lights flickering like the lightning just experienced.

Audio: Ambient city sounds with light breeze transform into rumbling thunder, wind intensifying, rain building from drops to downpour. Lightning crack punctuates transition, then subway station ambiance (echoing footsteps, distant train, water dripping) takes over.
```

## Scene Extension Integration
**Best Match**: Transition method
**Preservation**: Subject continuity, weather effects (wet character, lighting style)
**User Prompt Keywords**: "storm rolls in", "weather changes", "lightning flash", "rain begins"

## Red Flags to Avoid
- Weather change too slow (needs 2-3s maximum)
- No dramatic punctuation moment
- Subject disappears during transition
- Missing weather aftermath in Scene B

## Success Criteria
- Clear starting weather established
- Rapid but not instant weather change
- Visible weather progression (clouds, rain, wind)
- Dramatic moment clearly defined
- Subject maintained through transition
- Weather effects persist in Scene B
- Audio builds dramatically with weather
