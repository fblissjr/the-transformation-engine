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
  /** The type of audio content */
  type: AudioType;
  /** The text content of the audio (dialogue line, SFX description, etc.) */
  content: string;
  /** Optional timing information for the audio */
  timing?: AudioTiming;

  /** Preserved original syntax (for lossless reconstruction) */
  originalSyntax: string;

  /** Optional object reference (for reusable audio objects) */
  objectReference?: {
    objectId: string;
    objectType: 'audio';
  };
}

/** Supported audio content types */
export type AudioType = 'dialogue' | 'sfx' | 'ambient' | 'music';

/** Timing configuration for audio segments */
export interface AudioTiming {
  /** Start time string (e.g., '0s', '3.5s') */
  start?: string;
  /** Duration string (e.g., '2s', 'throughout') */
  duration?: string;
  /** Synchronization cue (e.g., 'with action X', 'when character enters') */
  sync?: string;
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
  /** The time range string, e.g., '(0s-3s)' */
  timeRange: string;

  /** Components active during this time segment */
  components: {
    cinematography?: import('./componentTypes').CinematographyComponent;
    subject?: import('./componentTypes').SubjectComponent;
    action?: import('./componentTypes').ActionComponent;
    context?: import('./componentTypes').ContextComponent;
    style?: import('./componentTypes').StyleComponent;
  };

  /** Segment-specific audio elements */
  audio?: AudioSegment[];

  /** Optional transition definition to the next segment */
  transition?: TransitionPattern;
}

/** Definition of a visual transition between segments */
export interface TransitionPattern {
  /** Type of transition (e.g., 'cut', 'dissolve', 'match-cut', 'camera-movement') */
  type: string;
  /** Duration of the transition (e.g., '0.5s', 'instant') */
  duration?: string;
  /** Description of the transition effect */
  description?: string;

  /** Optional reference to a transition fragment ID (links to /public/veo3/transitions/XX_*.md) */
  fragmentId?: string;
}

// ==================== Audio Object Data ====================

/**
 * Audio object data (for reusable audio elements stored in the library)
 */
export interface AudioObjectData {
  /** Category of the audio object */
  category: 'dialogue' | 'sfx' | 'ambient' | 'music';
  /** The content/description of the audio */
  content: string;
  /** Delivery style (specific to dialogue) */
  delivery?: string;
  /** Default duration */
  duration?: string;
  /** Mood keywords associated with the audio */
  mood?: string[];
}
