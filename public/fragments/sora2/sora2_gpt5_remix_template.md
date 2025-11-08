# Remix/Blend Template (GPT-5 Stage-1)

Remix allows blending elements from multiple prior generations or prompts to create variations while maintaining coherent style.

## Structure

**Sources**:
- Identify prior videos/prompts/storyboards by name/ID
- List which elements to reuse (camera plan, grade, wardrobe, environment, subject state, motifs)

**Curve & Weights**:
- **Transition**: Linear blend from A→B over time
- **Mix**: Weighted combination (A=60%, B=40%)
- **Sample**: A during [0:00-X], B during [X-end]
- **Custom**: Define control points for non-linear blends

**Alignment Plan**:
- What to **align** (camera, composition, lighting structure)
- What to **vary** (season, time of day, styling, subject state)

**Timestamped Edits**:
- CHANGE/PRESERVE directives at specific moments

**Generation Prompt**:
- Short natural-language narration of the blend (no technical attributes)

## Example Remix A: Transition Blend (10s)

### Sources
- **A: Coastal boardwalk** (ID: gen_20250120_001)
  - Reuse: Camera cadence (dolly/push rhythm), warm golden grade
- **B: Urban night** (ID: gen_20250120_005)
  - Reuse: Neon palette, reflective wet surfaces

### Curve
- **Transition** with control points:
  - [0:00] A=1.0 / B=0.0
  - [0:05] A=0.5 / B=0.5
  - [0:10] A=0.0 / B=1.0

### Alignment Plan
**Align**:
- Dolly/push-in cadence (4 ft at 1 ft/s → 6 ft at 1.5 ft/s)
- Horizon-level composition
- Motivated lighting per beat (sun → neon)

**Vary**:
- Environment (sun-bleached boardwalk → wet asphalt)
- Color temp (5600K warm → 6000K cool neon)
- Subject wardrobe (beach casual → urban coat)

### Edits
**[0:04-0:06]**:
- CHANGE: Rack focus shifts to neon reflections on wet ground
- PRESERVE: Camera movement speed and subject blocking

**[0:07-0:10]**:
- CHANGE: Grade transitions from warm gold to cool cyan-magenta
- PRESERVE: Push-in camera motion continues

### Generation Prompt
A sun-drenched coastal boardwalk gradually transforms into a rain-slick urban street under neon lights, maintaining the same dolly-forward camera motion and subject pacing while the environment and lighting shift from natural golden hour to artificial neon glow.

## Example Remix B: Mix Blend (15s)

### Sources
- **A: Perfume macro** (ID: gen_20250120_012)
  - Reuse: 85mm lens, f/2 aperture, rim light spec, black background
- **B: Sci-fi corridor** (ID: gen_20250120_018)
  - Reuse: Hologram motif, cool magenta accents, hex grid texture

### Curve
- **Mix** with global weights:
  - A=0.6 / B=0.4 baseline
  - Increase B influence during [0:11-0:15] to 0.5

### Alignment Plan
**Align**:
- Close-up macro framing (85mm f/2)
- Push-in rhythm (3 ft at 0.8 ft/s)
- Reflective/refractive materials
- Black/dark background

**Vary**:
- Subject (glass perfume bottle → holographic product display)
- Color accents (warm 3200K → cool magenta 5000K)
- Texture overlay (smooth glass → hex grid panels)

### Edits
**[0:06]**:
- CHANGE: Add holographic hex grid overlay on bottle surface
- PRESERVE: Bottle silhouette, macro depth, rim lighting

**[0:08]**:
- CHANGE: Roll 2° to catch hologram bloom effect
- PRESERVE: Push-in camera speed, f/2 aperture

**[0:11-0:15]**:
- CHANGE: Grade shifts from warm amber to cool magenta
- PRESERVE: Black background, product centered

### Generation Prompt
A fusion of luxury product macro and sci-fi holography: a glass perfume bottle filmed with 85mm macro optics gradually reveals holographic hex grid patterns across its surface, shifting from warm tungsten lighting to cool magenta accents while maintaining the intimate push-in camera movement and pure black background.

## Remix Best Practices

1. **Start with compatible sources** - Similar camera work, aspect ratio, or compositional structure
2. **Define clear alignment** - Be explicit about what stays consistent vs. what changes
3. **Use temporal edits** - Timestamp all CHANGE directives for precision
4. **Narrate the blend** - Generation prompt should describe the "why" of the blend
5. **Test alignment first** - Try simple transitions before complex multi-source mixes
