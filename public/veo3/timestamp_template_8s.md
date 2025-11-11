# Veo 3.1 Timestamp Template (8-Second Time-Segmented)

## Overview
Time-segmented prompting for Veo 3.1 provides precise control over scene progression within the 8-second duration constraint. This approach offers high consistency and allows for complex multi-phase actions.

## When to Use Timestamp vs. Continuous
- **Timestamp (this template)**: Precise control needed, complex action sequences, high consistency priority, specific timing requirements
- **Continuous narrative**: Simpler scenes, flowing motion, artistic interpretation preferred

## Optimal Word Count
**250-350 words** for timestamp prompts

## 8-Second Structure (4 segments of 2 seconds each)

### Segment Timing Guide
```
[00:00-00:02] - Introduction / Establishment
[00:02-00:04] - Development / Action begins
[00:04-00:06] - Progression / Main action
[00:06-00:08] - Resolution / Conclusion
```

## Timestamp Template

```
[00:00-00:02] {{segment_1_visual}}. {{segment_1_action}}. Camera: {{segment_1_camera}}.

[00:02-00:04] {{segment_2_transition}}. {{segment_2_action}}. Camera: {{segment_2_camera}}.

[00:04-00:06] {{segment_3_action}}. {{segment_3_details}}. Camera: {{segment_3_camera}}.

[00:06-00:08] {{segment_4_resolution}}. {{segment_4_final_state}}. Camera: {{segment_4_camera}}.

Audio layering:
- Primary: {{primary_audio_description}}
- Secondary: {{secondary_audio_description}}
- Ambient: {{ambient_audio_description}}

Lighting progression: {{lighting_description}}
```

## Variables Explained

### Visual Segments
- `segment_1_visual`: Establishing shot description
- `segment_1_action`: What's happening at start
- `segment_2_transition`: How scene develops
- `segment_2_action`: Action intensifying
- `segment_3_action`: Peak action or main event
- `segment_3_details`: Important visual details
- `segment_4_resolution`: How action concludes
- `segment_4_final_state`: End state of scene

### Camera Progression
- `segment_1_camera`: Starting camera position/movement
- `segment_2_camera`: Camera adjustment or movement
- `segment_3_camera`: Camera at action peak
- `segment_4_camera`: Final camera position

### Audio Layers (Critical for Veo 3.1)
- `primary_audio_description`: Main sound element throughout
- `secondary_audio_description`: Supporting sounds
- `ambient_audio_description`: Environmental soundscape

### Lighting
- `lighting_description`: How lighting changes or remains constant

## Example 1: Action Sequence

```
[00:00-00:02] Wide shot of abandoned warehouse interior, dust particles floating in dim light streaming through broken windows. A detective enters frame left, flashlight beam cutting through darkness. Camera: Static wide establishing shot.

[00:02-00:04] Detective moves deeper into warehouse, flashlight scanning across old crates and debris. Footsteps echo loudly on concrete. Camera: Slow tracking shot following detective from behind.

[00:04-00:06] Flashlight beam suddenly stops on a wall covered in photographs and newspaper clippings. Detective freezes, hand moving to weapon. Camera: Push in steadily toward detective's tense face.

[00:06-00:08] Close-up of detective's eyes widening in recognition, reflected flashlight glow illuminating face. Breathing quickens. Camera: Hold on extreme close-up of eyes.

Audio layering:
- Primary: Echoing footsteps on concrete transitioning to breathing
- Secondary: Distant dripping water, creaking wood, fabric rustling
- Ambient: Low warehouse hum, distant city traffic barely audible

Lighting progression: Dim natural light gives way to harsh flashlight beams creating dramatic shadows, ending with concentrated light on detective's face
```

## Example 2: Dialogue Scene (Timestamp Format)

```
[00:00-00:02] Close-up of two hackers in dim server room, blue monitor glow on faces, staring at main screen showing scrolling code. Camera: Static two-shot, eye-level.

[00:02-00:04] Senior hacker (Alex) leans forward intensely. "Look at this. Someone's been inside our network for weeks." Alarm flashing red. Camera: Push in slowly on both faces.

[00:04-00:06] Junior hacker (Jordan) voice rising. "Wait, that signature... that's our own encryption! How is that possible?" Eyes widen. Camera: Rack focus from Alex to Jordan.

[00:06-00:08] Both hackers exchange glance of realization and fear. Alarm beeping intensifies. Camera: Pull back to show full server room, isolation emphasized.

Audio layering:
- Primary: Dialogue delivery (Alex calm/grave, Jordan panicked/rising), alarm beeping building in intensity
- Secondary: Rapid keyboard typing, server fans humming, chair squeaking as they lean
- Ambient: Low hum of cooling systems, distant ventilation, occasional hard drive click

Lighting progression: Consistent blue monitor glow with red alarm pulses increasing in frequency, casting alternating colors on faces
```

## Example 3: Cinematic Scene (Timestamp Format)

```
[00:00-00:02] Aerial drone shot starts at eye-level with sleek black sports car on empty desert highway at golden hour. Car accelerates hard. Camera: Drone at car level, tracking alongside.

[00:02-00:04] Drone begins ascending and orbiting right around car. Dust trail visible behind car. Surrounding red rock formations come into view. Camera: Rising spiral orbit around moving car.

[00:04-00:06] Drone reaches apex 50 feet above, car now small against vast landscape. Canyon walls glow orange in sunset. Camera: Hold at apex, car moving away from camera.

[00:06-00:08] Drone descends rapidly, diving back toward car, ending just above and behind vehicle. Sunset fills frame ahead. Camera: Fast descent ending in close trailing shot.

Audio layering:
- Primary: Engine roar (aggressive V8 growl), modulating with distance - louder when close, quieter at apex
- Secondary: Tires on asphalt (screech on acceleration), wind rushing past drone microphone
- Ambient: Desert silence at apex (wind whistle, distant echo of engine off canyon walls), warm atmospheric presence

Lighting progression: Warm golden hour light constant but perspective changes - side-lit at start, backlighting emphasized at apex, sunset glow frontal at end
```

## Tips for Effective Timestamp Prompts

### Do's
- Specify exact timing for each major action beat
- Layer audio explicitly (primary, secondary, ambient)
- Describe camera movement for each segment
- Use lighting progression to enhance continuity
- Maintain consistent subjects across timestamps
- Build intensity or emotional arc through segments

### Don'ts
- Cram too much action into single 2-second segment
- Forget audio for any segment
- Ignore camera position changes
- Use vague timing ("then", "later" instead of timestamps)
- Contradict previous segment details

## Timestamp Syntax Rules

1. **Format**: Always use `[HH:MM:SS-HH:MM:SS]` format with leading zeros
2. **Segments**: Divide 8 seconds into logical phases (usually 4 × 2s or 2 × 4s)
3. **No gaps**: Timestamps should be continuous with no time gaps
4. **Camera notes**: Include after main description, start with "Camera:"
5. **Audio section**: Separate section after visual timestamps

## When to Use 2s vs 4s Segments

**2-second segments** (recommended default):
- Complex multi-step actions
- Dialogue with multiple exchanges
- Rapid scene developments
- Precise choreography needed

**4-second segments**:
- Slower, contemplative scenes
- Continuous camera movements
- Simple action progressions
- Establishing shots with minimal change

## Integration with Scene Types

### Dialogue Scenes
- Timestamps align with dialogue exchanges
- 2s per character speaking turn
- Audio section emphasizes dialogue delivery

### Cinematic Scenes
- Timestamps follow camera movement phases
- Lighting and environment details per segment
- Audio emphasizes spatial positioning (near/far)

### Creative Animation
- Timestamps mark transformation phases
- Stylistic details per segment
- Audio matches whimsical progression

## Troubleshooting

**Problem**: Too much described for 2 seconds
**Solution**: Simplify action or split into two segments

**Problem**: Scene feels choppy
**Solution**: Ensure smooth transitions between segments, use camera movement to bridge

**Problem**: Audio doesn't match visuals
**Solution**: Explicitly tie audio events to visual timestamps

**Problem**: Lighting changes feel abrupt
**Solution**: Describe gradual progression in "Lighting progression" section

## Technical Specs Reminder

- **Duration**: 8 seconds (required for advanced Veo 3.1 features)
- **Resolution**: 720p or 1080p (720p if extending later)
- **Aspect Ratio**: 16:9 or 9:16
- **Frame Rate**: 24fps
- **Audio**: Native V2A generation with explicit control

## Related Templates
- Continuous narrative template (for flowing, artistic scenes)
- Scene-type templates (dialogue, cinematic, animation)
- Transition templates (20 patterns for scene connections)
