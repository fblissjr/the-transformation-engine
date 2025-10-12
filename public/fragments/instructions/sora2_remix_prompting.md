---
id: sora2_remix_prompting
version: 1.0.0
model: sora2
category: instruction
description: Remix/edit prompting with temporal targeting for surgical video modifications
---

# Sora 2 Remix/Edit Prompt Strategy

When modifying an existing video using Sora 2's "Describe changes..." remix feature, you can target **specific moments** in the timeline for surgical edits.

## Temporal Targeting Syntax

### Specific Timestamp Targeting
**Pattern**: "At [X] seconds, [change description]"

**Examples**:
```
"At 2 seconds, change lighting to warm sunset tones"
"At 5 seconds, transform subject into anime style"
"At the 7 second mark, add heavy rain with visible droplets"
```

### Temporal Range Targeting
**Pattern**: "From [X] to [Y] seconds, [change description]"

**Examples**:
```
"From 3 to 6 seconds, gradually transition to black and white"
"From 0 to 4 seconds, add motion blur to background"
"Between 5 and 8 seconds, intensify color saturation"
```

### Start/End Targeting
**Pattern**: "At the beginning/end, [change description]" or "Throughout, [change description]"

**Examples**:
```
"At the beginning, establish fog atmosphere"
"At the end, fade to darker tones"
"Throughout, maintain painterly texture overlay"
```

## Remix Prompt Structure

### What to Specify
1. **Temporal target** (when to apply change)
2. **Change type** (style, lighting, weather, color, effects)
3. **Preservation clause** (what NOT to change)

### Template
```
"At [timestamp/range]:
- CHANGE: [specific modification]
- PRESERVE: [what stays the same]"
```

## Common Remix Patterns

### Pattern 1: Style Transfer with Temporal Progression
**Use Case**: Gradual style transformation over video duration

"From 0 to 3 seconds, begin subtle anime style transformation with softer outlines.
From 3 to 7 seconds, intensify anime aesthetic with bold black outlines and vibrant colors.
From 7 to 10 seconds, full anime style with cel-shading and exaggerated expressions.
Preserve: Original camera movement, subject positioning, timing"

### Pattern 2: Targeted Lighting Changes
**Use Case**: Relight specific sections without affecting entire video

"At 2 seconds, shift to golden hour lighting with warm tones and long shadows.
At 5 seconds, add rim lighting on subjects from sunset direction.
At 8 seconds, deepen shadows for dramatic contrast.
Preserve: All motion, composition, camera work"

### Pattern 3: Surgical Weather Effects
**Use Case**: Add weather only during specific moments

"From 4 to 8 seconds, add heavy rain with visible droplets and wet surfaces.
Include: Reflections on ground, rain streaks, overcast sky during rain section
Preserve: Before 4s and after 8s remain dry, original camera and subject motion"

### Pattern 4: Time-of-Day Transitions
**Use Case**: Shift lighting to different time of day at specific point

"At 0 seconds, establish daytime with bright natural light.
From 5 to 7 seconds, transition lighting from day to dusk.
At 10 seconds, full nighttime with artificial street lighting and cool blue tones.
Preserve: Camera movement, subject actions, composition throughout"

### Pattern 5: Progressive Color Grading
**Use Case**: Evolve color palette over time

"From 0 to 4 seconds, maintain realistic color palette.
From 4 to 7 seconds, gradually increase saturation and shift toward warmer tones.
From 7 to 10 seconds, hyper-saturated colors with vintage film look.
Preserve: Original motion, framing, and camera work"

### Pattern 6: Object/Character Transformation
**Use Case**: Transform subject at specific moment

At 3 seconds, begin transformation of subject from realistic to stylized illustration.
From 3 to 6 seconds, progressive stylization with simplified features and bold outlines.
At 6 seconds, complete transformation to flat graphic design style.
Preserve: Subject positioning, background environment, camera motion"

## Advanced Temporal Targeting

### Multiple Discrete Changes
**Pattern**: Stack multiple timestamp-specific modifications

"At 1 second, add lens flare from left side.
At 3 seconds, introduce shallow depth of field blur on background.
At 5 seconds, shift color temperature cooler (blue tones).
At 7 seconds, add vignette darkening on edges.
At 9 seconds, intensify contrast for dramatic final frame.
Preserve: Subject actions, camera movement throughout"

### Overlapping Temporal Effects
**Pattern**: Layer effects that span different time ranges

"From 0 to 10 seconds, apply overall painterly texture (base effect).
From 3 to 7 seconds, add motion blur to background only (overlay effect).
At 5 seconds, introduce color pop on main subject (accent effect).
Preserve: Original composition and camera work"

## Best Practices

### ✅ DO:
- **Be specific about timestamps** ("at 3 seconds" not "in the middle")
- **Use ranges for gradual changes** ("from 2 to 5 seconds")
- **Specify what to preserve** (camera work, subject motion, composition)
- **Layer effects logically** (base → overlay → accent)

### ❌ DON'T:
- **Use vague temporal references** ("sometime during", "around the middle")
- **Forget preservation clauses** (model might change more than intended)
- **Conflict with original timing** ("make 10s video into 5s" in remix)
- **Over-specify contradictory changes** ("realistic and cartoon at same time")
- **Ignore original camera motion** (results in jarring inconsistencies)

## Temporal Targeting vs. Global Changes

### When to Use Temporal Targeting
- Style transformations that evolve over time
- Lighting changes at specific narrative beats
- Weather effects for specific sections
- Progressive color grading
- Moment-specific visual effects

### When to Use Global Changes
- Overall style transfer (entire video)
- Consistent atmosphere changes (fog, lighting mood)
- Aspect ratio or resolution adjustments
- Uniform color grading
- Whole-video texture overlays

**Example Global Change (No Temporal Targeting)**:
"Transform entire video to anime style with bold outlines, vibrant colors,
cel-shading throughout. Maintain all original camera movement and subject actions.

## Remix Prompt Quality Checklist

Before submitting remix prompt:
- [ ] Temporal targets clearly specified (timestamps or ranges)
- [ ] Change descriptions are specific and actionable
- [ ] Preservation clauses prevent unintended changes
- [ ] No contradictory instructions at same timestamp
- [ ] Temporal logic makes sense (gradual progressions)
- [ ] Camera and motion consistency addressed

## Key Insight
> "The timestamp of second frame 1914 is 2.12 seconds, and in FIG. 21 the prompt is...
> The effect of this prompt is to guide the visual media generative response engine to
> generate frames corresponding to this description around this timestamp in the video."

**Implication**: Temporal targeting guides the model to apply changes **at specific moments**,
enabling surgical modifications instead of global transformations.

## Example: Complete Remix Prompt

**Original Video**: "Woman walking through forest at midday"

**Remix Prompt with Temporal Targeting**:
"At 0 seconds, establish morning mist atmosphere with soft diffused light.

From 2 to 4 seconds, gradually transition lighting from morning to golden hour.

At 5 seconds, introduce lens flare from setting sun through trees.

From 6 to 8 seconds, deepen shadows and warm color temperature further.

At 9 seconds, add subtle vignette darkening on frame edges.

Preserve throughout: Woman's walking motion, camera tracking movement,
forest environment composition, 10-second duration.

**Result**: Surgical time-of-day transformation from morning → golden hour → dusk
while preserving original action and camera work.
