---
id: task_directive
version: 2.0.0
category: directive
priority: high
used_by: [primary, mixer, normalizer, schema_inference]
variables: [task, context, constraints]
---

**Task**: {{task}}

{{#if context}}
**Context**: {{context}}
{{/if}}

{{#if constraints}}
**Constraints**:
{{constraints}}
{{/if}}
