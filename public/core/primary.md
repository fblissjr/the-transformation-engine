**Task**: Transform the creative concept below into a structured intermediate representation.

{{#if duration}}
@include[rules/temporal_constraints.md | mediaType="video" | duration="{{duration}}"]
{{else}}
@include[rules/temporal_constraints.md | mediaType="image"]
{{/if}}

@include[rules/obscuring_figures_full.md]

**Creative Concept:**
"{{naturalLanguageInput}}"

@include[instructions/format_constraints.md]

@include[instructions/output_purity.md]
