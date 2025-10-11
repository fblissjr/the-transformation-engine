---
id: sora2_temporal_progression
version: 1.0.0
category: instruction
priority: critical
used_by: [primary]
model: sora2
---

**TEMPORAL PROGRESSION REQUIREMENT**

Sora 2 processes videos as unified spacetime patches, so it expects descriptions of how scenes EVOLVE over time, not just static snapshots.

Structure your description with temporal markers:

**[00:00-00:03]** Opening state: Describe initial composition, lighting, subject position
**[00:03-00:07]** Middle progression: Describe how elements move, change, develop
**[00:07-00:10]** Closing state: Describe final composition, resolution, exit

Include:
- How subjects enter/exit frame
- Camera movement evolution (start → middle → end speeds/positions)
- Lighting changes over time
- Action progression (not just "a person walks" but "enters left, progresses through middle, exits right")
