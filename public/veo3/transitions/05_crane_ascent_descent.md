# Crane/Drone Ascent-Descent Transition (Veo 3.1)

## Transition Type
**Camera-Based**: Vertical Camera Movement

## Description
Camera cranes or ascends vertically, reaches an apex where the scene transforms, then descends into the new scene. The height and distance at apex create visual separation that masks the transition.

## Use Cases
- Time period shifts (present to past/future)
- Scale transitions (street level to aerial view)
- Location changes (same geography, different era)
- Dramatic reveals

## Anatomy
1. **Scene A State** (0-2s): Ground-level starting scene
2. **Transition Technique** (2-5s): Crane ascent, transformation at apex, descent begins
3. **Scene B Reveal** (5-8s): Crane descends into new scene
4. **Audio Bridge**: Audio grows distant on ascent, shifts at apex, becomes close on descent

## Prompt Template

```
{{scene_a_shot}} of {{scene_a_description}} at {{time_period_a}}, {{scene_a_details}}. The camera cranes upward smoothly, ascending above {{scene_a_elements}}, rising past {{vertical_landmarks}}. As the camera reaches the apex of its ascent, the {{transformation_description}}: {{visual_morph_details}}. The camera then descends back down, revealing we are now in {{scene_b_location}} at {{time_period_b}}, with {{scene_b_description}}.

Audio: {{scene_a_audio}} grows distant and muffled as camera ascends, then shifts to {{scene_b_audio}} as camera descends into {{scene_b_time}}.
```

## Variables
- `scene_a_shot`: Ground-level shot, street-level view, close view
- `scene_a_description`: Starting scene description
- `time_period_a`: Current time reference (noon, present day, modern era)
- `scene_a_details`: Environmental and atmospheric details
- `scene_a_elements`: What camera rises above (market, crowd, buildings)
- `vertical_landmarks`: What camera passes during ascent (second-story windows, rooftops, tree canopy)
- `transformation_description`: What changes at apex (urban landscape morphs, buildings shift, colors change)
- `visual_morph_details`: Specific transformation details
- `scene_b_location`: Where camera descends into
- `time_period_b`: New time reference (500 years in the past, future, different era)
- `scene_b_description`: New scene details
- `scene_a_audio`: Starting audio environment
- `scene_b_audio`: New audio environment
- `scene_b_time`: Time period of new scene

## Example from Research

```
Ground-level shot of a crowded urban street market at noon, vendors calling out, colorful produce stalls, people bustling. The camera cranes upward smoothly, ascending above the market, rising past second-story windows and rooftops. As the camera reaches the apex of its ascent, the urban landscape below begins to transform: buildings morph into ancient ruins, the crowd becomes sparse figures in period clothing. The camera then descends back down, revealing we are now in the same geographic location but 500 years in the past, with a medieval market in the ruins.

Audio: Modern market noise (car horns, electronic music, chatter) grows distant and muffled as camera ascends, then shifts to historical soundscape (horses, blacksmith hammering, acoustic instruments) as camera descends into the past.
```

## Scene Extension Integration
**Best Match**: Transition method
**Preservation**: Geographic continuity (same location, different time/context)
**User Prompt Keywords**: "crane up", "ascent then descent", "drone rises and descends", "vertical transition"

## Red Flags to Avoid
- No clear apex moment
- Transformation too subtle to notice
- Missing audio perspective shift
- Inconsistent vertical motion (should be smooth)

## Success Criteria
- Clear ground-level establishment
- Smooth upward motion
- Visual transformation at apex
- Descent reveals new context
- Audio perspective matches camera height
- Geographic continuity maintained
