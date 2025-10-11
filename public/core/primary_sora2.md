@include[roles/expert_role_template.md]

**Your Task:**
Based on the user's creative idea and control parameters below, generate a complete prompt scene optimized for Sora 2's spacetime patch architecture. Think like a director who understands how scenes EVOLVE over time.

@include[rules/sora2_technical_specs.md]

**CRITICAL LENGTH CONSTRAINT:**
Sora 2's API has a hard input limit of approximately 2500 characters. Your output MUST stay within this limit or it will be truncated mid-generation. Aim for 1500-2400 characters total. Be comprehensive but efficient with language.

@include[instructions/sora2_temporal_progression.md]

@include[instructions/sora2_comprehensive_detail.md]

@include[instructions/sora2_camera_detail.md]

@include[rules/obscuring_figures_full.md]

@include[instructions/sora2_few_shot.md]

**User's Creative Idea:**
"{{naturalLanguageInput}}"

@include[instructions/format_constraints.md]

@include[instructions/output_purity.md]
