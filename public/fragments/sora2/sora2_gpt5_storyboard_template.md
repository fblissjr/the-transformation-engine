# Storyboard Template (GPT-5 Stage-1)

Storyboards allow frame-by-frame control of Sora 2 generations with explicit continuity management.

## Structure

**Global Continuity Baseline**:
- Define consistent elements across all frames (style, lighting baseline, color grading)

**Frames** (timestamped):
- Localized instructions for each key moment
- Camera changes, action beats, lighting shifts
- Optional reference images per frame

**Transitions**:
- How frames blend together (smooth ease, crossfade, etc.)

**Continuity Notes**:
- `PRESERVE`: Elements that must remain unchanged
- `CHANGE`: Specific modifications

## Example Storyboard (15s Fashion)

### Global Continuity
- **Style**: Cinematic fashion editorial with shallow DOF
- **Lighting baseline**: Soft natural light, 5600K, 2:1-2.5:1 key/fill
- **Color grading**: Neutral with warm highlights
- **Camera height**: Consistent 5.5 ft eye level

### Frames

**[0:00] Opening frame**
- Model enters from right; truck left 6 ft at 1 ft/s on 24 mm
- Soft window key 5600K; keep storefront bokeh foreground
- **Transition**: Smooth ease-in from black; maintain camera height 5.5 ft

**[0:06] Mid-sequence frame**
- Push-in 4 ft; tighten to 50 mm
- Rack focus from signage to model at 0:08
- Scarf lifts in breeze
- **Transition**: Blend movements; preserve leading lines

**[0:11] Closing frame**
- Hold medium close-up; slight tilt up
- Model turns toward camera; warm grade
- Shoe click foley
- **Transition**: Ease-out to end

### Continuity Notes

**PRESERVE**:
- Camera height (5.5 ft throughout)
- Movement direction (left-to-right flow)
- Wardrobe (charcoal coat, white scarf, sunglasses)
- Grade baseline (neutral with warm highlights)

**CHANGE**:
- Focus targets at 0:08 (signage → model)
- Tilt amount at 0:11 (slight upward)
- Breeze intensity (minimal → moderate)

## Storyboard vs. Single-Prompt

**Use storyboard when**:
- Multiple distinct moments/beats
- Complex camera choreography
- Precise continuity control needed
- Reference images per frame

**Use single-prompt when**:
- Continuous action/movement
- Smooth progression
- Simpler camera work
- Faster generation
