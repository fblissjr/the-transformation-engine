# Camera Specifications (GPT-5 Stage-1)

## Required Camera Elements

Every camera directive must include:
1. **Movement type** - Dolly, truck, arc, crane, pedestal, static
2. **Distance** - How far the camera travels (in ft)
3. **Speed** - Camera speed (in ft/s)
4. **Lens** - Focal length (mm)
5. **Aperture** - f-stop for DOF control
6. **Angle/height** - Camera position (eye-level at X ft, low angle at X ft, high angle)
7. **Focus strategy** - Static, rack focus, follow focus

## Imperial Units (NON-NEGOTIABLE)

- Distances: **ft** (not meters)
- Speeds: **ft/s** (not m/s)
- Convert any metric values to imperial

## Movement Specifications

**Dolly** (forward/backward):
- "Dolly forward 6 ft at 2 ft/s"
- "Slow push-in 3 ft at 0.8 ft/s"

**Truck** (sideways):
- "Truck left 8 ft at 1 ft/s"
- "Lateral move 10 ft at 2 ft/s"

**Arc** (curved path):
- "Arc orbit 120° around subject at 1.2 ft/s"
- "Arc right 90° to reveal cantilever"

**Crane** (vertical movement):
- "Slow crane up 4 ft at 0.8 ft/s"
- "Crane down 6 ft at 1 ft/s"

**Pedestal** (camera height adjustment):
- "Pedestal up while dollying forward 3 ft at 1 ft/s"

## Lens & Aperture Guidelines

**Wide angle (18-35mm)**:
- Establishing shots, architecture, landscapes
- Aperture: f/4-f/8 for deep focus

**Standard (35-50mm)**:
- Natural perspective, conversational framing
- Aperture: f/2.8-f/4 for balanced DOF

**Telephoto (50-100mm)**:
- Portraits, product shots, compression
- Aperture: f/2-f/2.8 for shallow DOF

**Macro (85-100mm)**:
- Extreme close-ups, product details
- Aperture: f/2.8-f/3.5 for selective focus

## Focus Strategy

**Rack focus** (shift focus between subjects):
- "Rack focus at 0:05 from 14 ft to 10 ft"
- "Rack from foreground rail (18 ft) to subject (12 ft) at 0:06"

**Follow focus** (track moving subject):
- "Shallow DOF at f/2.8; follow focus on runner"

**Static focus** (locked distance):
- "Hold focus at 8 ft"

## Complete Camera Specification Example

```
[0:00-0:03] Dolly forward 4 ft at 1 ft/s on 24 mm, f/4; eye level at 5 ft; hold focus at 12 ft.

[0:03-0:07] Push-in 6 ft at 1.5 ft/s, tighten to 35 mm, f/2.8; rack focus at 0:05 from 14 ft to 10 ft.

[0:07-0:10] Hold medium on 50 mm, f/2; slight tilt up 5°; maintain focus on subject.
```
