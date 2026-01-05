---
id: temporal_constraints
version: 2.0.0
category: rule
priority: high
used_by: [primary, mixer]
variables: [mediaType, duration]
---

{{#if duration}}
**Temporal Constraint**: This {{mediaType}} has a duration of {{duration}} seconds. Structure the content to fit this timeframe with a clear beginning, progression, and resolution. Do not try to cram too much into this window.
{{else}}
**Static Output**: This is a single-frame {{mediaType}}. Describe a single captured moment in time without temporal progression.
{{/if}}
