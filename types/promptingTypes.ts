/**
 * Prompting Strategy Types for Intermediate v3.0
 * Metadata about which prompting method to use for transformations
 */

// ==================== Prompting Strategy ====================

/**
 * Metadata about which Veo 3.1 prompting method to use
 * This helps transformers choose the appropriate format
 */
export interface PromptingStrategy {
  method:
    | 'continuous_narrative' // Method 1: Natural language paragraph
    | 'component_formula' // Method 2: 5-component structured format
    | 'timestamp_segmented' // Method 3: Time-coded beats
    | 'attribute_value' // Method 4: Key:value pairs
    | 'structured_json' // Method 5: Full JSON/YAML schema
    | 'audio_focused'; // Method 6: Audio-first with syntax preservation

  // For timestamp-segmented
  segmentDuration?: number; // Default segment length in seconds

  // For attribute-value
  attributeOrder?: string[]; // Preferred order: ['subject', 'action', 'cinematography', ...]

  // Auto-selected or user-chosen
  selectionMode: 'auto' | 'manual';

  // Reasoning (if auto-selected)
  reasoning?: string;
}
