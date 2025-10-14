---
id: sora2_camera_push
version: 1.0.0
category: example
priority: medium
used_by: [primary_sora2]
scene_type: urban_cityscape
camera_movement: dolly_forward_fast
subject_type: environment
---

**Example Prompt (Cityscape Push)**:

```yaml
temporal_progression: |
  [00:00-00:02] Opening frame: Wide aerial view of futuristic cityscape at dusk. Towering skyscrapers with illuminated windows stretch into purple-blue twilight sky. Camera begins slow dolly forward, accelerating gradually.

  [00:02-00:05] Camera speed increases to rapid push-in (2 meters/second), descending from aerial height toward street level. Buildings rush past frame edges as perspective narrows. Neon signs and holographic advertisements become visible on building facades. Flying vehicles cross through distant background layers.

  [00:06-00:10] Final rapid push culminates in close-up on single illuminated window at street level, showing silhouette of figure inside. Camera motion smoothly decelerates to stop. City lights create bokeh effects in out-of-focus background areas. Rain starts to speckle the window surface.

visual_description: |
  A sprawling metropolis with neo-noir aesthetic. Architecture combines sleek glass towers with darker brutalist structures. Vertical city design with multiple levels visible - elevated highways, sky-bridges between buildings, ground-level streets far below. Color palette dominated by cool blues and purples with warm accent lighting from neon signs (pink, cyan, amber). Atmospheric haze creates depth layering between near and far buildings. Rain-slicked surfaces reflect colorful light sources.

camera_movement: "Dynamic dolly-in starting at 0.5 m/s, accelerating to 2.5 m/s at midpoint, decelerating to stop. Begins at wide establishing (100 meters distance, elevated viewpoint), ends at close-up (2 meters from window). 24mm wide-angle lens transitioning to 85mm telephoto equivalent through focal length adjustment. Deep focus (f/8) opening narrows to shallow focus (f/2) as camera approaches target."

cinematography: "Inspired by Blade Runner visual language. Strong depth of field changes create sense of scale and space compression. Vertical movement combined with forward motion. Use of leading lines from building edges to guide eye toward target window. Rain effects add atmospheric texture without obscuring primary subject."

lighting: "Twilight ambient base with multiple artificial light sources. Neon signs provide colored accent lighting (pink at 3200K, cyan at 7000K, amber at 2800K). Building windows glow with warm interior light (3000K tungsten equivalent). Holographic projections add animated light elements with RGB color shifts. Atmospheric lighting through rain/mist creates volumetric light rays (god rays) from bright sources with visible scattering. High contrast ratio (8:1) between lit windows and shadow areas enhances noir aesthetic. Rim lighting on building edges from distant light sources."

audio_design: "Distant city ambience - muffled traffic sounds, electronic hums, echoing voices. Whoosh sounds from flying vehicles passing. Wind whistling through building gaps. Rain beginning to fall with gentle patter. Bass-heavy drone suggesting urban density and technological presence."

style: "Cyberpunk/neo-noir cinematic aesthetic inspired by Blade Runner and Ghost in the Shell. Desaturated base color palette (70% saturation) with selective color saturation boost on neon elements (120% saturation). Anamorphic lens flares with horizontal blue streaks from bright light sources. Subtle chromatic aberration at frame edges (2-3 pixel RGB separation). 35mm film grain texture overlay (ISO 800 equivalent) for organic feel against digital elements. Moody, atmospheric, with emphasis on depth through layered composition and multiple z-axis planes. Color grading: teal shadows, warm highlights, crushed blacks for contrast."
```
