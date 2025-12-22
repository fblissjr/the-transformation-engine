import type { IntermediatePrompt } from '../../types/intermediate';

/**
 * Transformer interface - converts intermediate to model-specific format
 */
export interface Transformer {
  /** Unique transformer name */
  name: string;

  /** Target model ID */
  modelId: 'sora2' | 'veo3' | 'generic' | 'wan';

  /** Human-readable description */
  description: string;

  /** Transform intermediate to model-specific output */
  transform(intermediate: IntermediatePrompt): string;

  /** Validate intermediate before transformation (optional) */
  validate?(intermediate: IntermediatePrompt): ValidationResult;

  /** Get estimated character count (optional) */
  estimateLength?(intermediate: IntermediatePrompt): number;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
}
