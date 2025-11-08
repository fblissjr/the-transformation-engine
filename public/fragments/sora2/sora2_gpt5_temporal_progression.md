# Temporal Progression (GPT-5 Stage-1)

## Timecoding Format

Sora 2 generates entire videos simultaneously using spacetime patches. Embed temporal progression directly in your prompt using exact timecode notation:

**10-second clips**:
- [0:00-0:03] Opening beat
- [0:03-0:07] Development/transition
- [0:07-0:10] Resolution/exit

**15-second clips**:
- [0:00-0:05] Extended opening
- [0:05-0:11] Development/climax
- [0:11-0:15] Resolution/exit

## Structure Guidelines

Each timecoded segment should include:
1. **Visual description** - What's happening in the scene
2. **Camera behavior** - Movement, distance, speed (ft, ft/s)
3. **Visual changes** - Color shifts, lighting transitions, effects
4. **Audio cues** (optional) - Sound effects, ambient shifts

## Example Temporal Progression

```
[0:00-0:03] Weathered boardwalk above pale sand; foreground rail leads into a midground subject strolling parallel to the surf under light ocean haze. Dolly forward 4 ft at 1 ft/s, eye level at 5 ft on 24 mm; soft 5600K key from camera right motivated by late-afternoon sun.

[0:03-0:07] Push-in 6 ft at 1.5 ft/s, tighten to a medium on 35 mm; rack focus at 0:05 from foreground rail to the subject as gulls drift across the horizon.

[0:07-0:10] Hold medium; slight tilt up to catch a subtle lens flare; breeze lifts hair; grading warms gently with a 2:1 key/fill and thin haze for glow.
```

## Best Practices

- **Start wide, end tighter** - Natural visual progression
- **Embed camera in temporal** - Don't separate "Camera:" sections
- **Specify exact timing** - Use [MM:SS-MM:SS] format
- **Smooth transitions** - Avoid hard cuts within single generation
- **Imperial units** - Always use ft, ft/s (not meters)
