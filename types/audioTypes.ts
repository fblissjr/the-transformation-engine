/**
 * Audio and Timestamp Types for Intermediate v3.0
 * Preserves Veo 3.1 audio syntax and supports time-segmented prompting
 */

// ==================== Audio Types ====================

/**
 * AudioSegment with preserved Veo 3.1 syntax
 *
 * Veo 3.1 audio syntax:
 * - Dialogue: Character says "text" (delivery)
 * - SFX: SFX: description
 * - Ambient: Ambient noise: description
 */
export interface AudioSegment {
  type: AudioType;
  content: string;
  timing?: AudioTiming;

  // Preserved original syntax (for lossless reconstruction)
  originalSyntax: string;

  // Optional object reference (for reusable audio objects)
  objectReference?: {
    objectId: string;
    objectType: 'audio';
  };
}

export type AudioType = 'dialogue' | 'sfx' | 'ambient' | 'music';

export interface AudioTiming {
  start?: string; // '0s', '3.5s', etc.
  duration?: string; // '2s', 'throughout', etc.
  sync?: string; // 'with action X', 'when character enters', etc.
}

// ==================== Timestamp Types ====================

/**
 * Time-segmented prompting (Veo 3.1 method #3)
 *
 * Example:
 * (0s-3s): Wide shot of detective entering, camera pans to follow
 * (3s-5s): Close-up of detective's face, she scans the room
 * (5s-8s): Medium shot, detective walks to evidence table
 */
export interface TimestampSegment {
  timeRange: string; // '(0s-3s)', '(3s-8s)', etc.

  // Each segment has its own components
  components: {
    cinematography?: import('./componentTypes').CinematographyComponent;
    subject?: import('./componentTypes').SubjectComponent;
    action?: import('./componentTypes').ActionComponent;
    context?: import('./componentTypes').ContextComponent;
    style?: import('./componentTypes').StyleComponent;
  };

  // Segment-specific audio
  audio?: AudioSegment[];

  // Transition to next segment (optional)
  transition?: TransitionPattern;
}

export interface TransitionPattern {
  type: string; // 'cut', 'dissolve', 'match-cut', 'camera-movement'
  duration?: string; // '0.5s', 'instant', etc.
  description?: string;

  // Optional reference to transition fragment
  fragmentId?: string; // Links to /public/veo3/transitions/XX_*.md
}

// ==================== Audio Object Data ====================

/**
 * Audio object data (for reusable audio elements)
 */
export interface AudioObjectData {
  category: 'dialogue' | 'sfx' | 'ambient' | 'music';
  content: string;
  delivery?: string; // For dialogue
  duration?: string;
  mood?: string[];
}
