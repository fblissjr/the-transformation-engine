@include[roles/expert_role_template.md]

**User's Creative Idea:**
"{{naturalLanguageInput}}"

{{instructions}}

**Output Format:**
You MUST respond with a single, valid JSON object. Do not include any text or formatting before or after the JSON object.
The JSON object must contain two keys:
1. "newSchemaKeys": An array of strings representing the suggested schema keys.
2. "reasoning": A brief, user-friendly explanation for your key choices.

**Example Response:**
{
  "newSchemaKeys": ["setting_description", "character_action", "internal_monologue", "ambient_sound"],
  "reasoning": "The idea involves a character's internal thoughts and specific actions in a detailed setting, so keys were chosen to capture these distinct elements."
}

Generate the JSON response now.
