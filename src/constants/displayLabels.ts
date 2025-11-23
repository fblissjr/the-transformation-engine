/**
 * Display Label Mappings for Phase 2.3 Type Enhancements
 *
 * Exhaustive Record types ensure TypeScript enforces completeness.
 * All taxonomies from componentTypes.ts have corresponding display labels.
 *
 * Created: 2025-11-20
 * Phase: 2.3 (Google Cloud Veo 3.1 Guide Enhancements)
 */

import type {
  CameraAngle,
  LensType,
  OpticalEffect,
  CinematicTechnique,
  LightingQuality,
  MoodTone,
  TemporalSpeed,
  TransitionType,
} from '../../types/componentTypes';

// ==================== Camera Angle Labels ====================

/** Display labels for camera angles */
export const CAMERA_ANGLE_LABELS: Record<CameraAngle, string> = {
  'eye-level': 'Eye-Level',
  'high-angle': 'High-Angle',
  'low-angle': 'Low-Angle',
  'dutch': 'Dutch Angle (Canted)',
  'overhead': 'Overhead',
  'ground-level': 'Ground-Level',
  'birds-eye': "Bird's-Eye View",
  'worms-eye': "Worm's-Eye View",
  'over-the-shoulder': 'Over-the-Shoulder (OTS)',
  'point-of-view': 'Point-of-View (POV)',
};

// ==================== Lens Type Labels ====================

/** Display labels for lens types */
export const LENS_TYPE_LABELS: Record<LensType, string> = {
  'standard': 'Standard (35-50mm)',
  'wide-angle': 'Wide-Angle (24-35mm)',
  'telephoto': 'Telephoto (85mm+)',
  'fisheye': 'Fisheye',
  'macro': 'Macro',
};

// ==================== Optical Effect Labels ====================

/** Display labels for optical effects */
export const OPTICAL_EFFECT_LABELS: Record<OpticalEffect, string> = {
  'lens-flare': 'Lens Flare',
  'rack-focus': 'Rack Focus',
  'vertigo-effect': 'Vertigo Effect (Dolly Zoom)',
  'bokeh': 'Bokeh',
};

// ==================== Cinematic Technique Labels ====================

/** Display labels for cinematic techniques */
export const CINEMATIC_TECHNIQUE_LABELS: Record<CinematicTechnique, string> = {
  'match-cut': 'Match Cut',
  'jump-cut': 'Jump Cut',
  'split-diopter': 'Split Diopter',
  'whip-pan': 'Whip Pan',
  'crash-zoom': 'Crash Zoom',
  'freeze-frame': 'Freeze Frame',
  'long-take': 'Long Take',
};

// ==================== Lighting Quality Labels ====================

/** Display labels for lighting quality options */
export const LIGHTING_QUALITY_LABELS: Record<LightingQuality, string> = {
  // Natural lighting
  'natural-daylight': 'Natural Daylight',
  'golden-hour': 'Golden Hour',
  'blue-hour': 'Blue Hour',
  'overcast': 'Overcast',
  'moonlight': 'Moonlight',

  // Artificial lighting
  'harsh': 'Harsh Lighting',
  'soft': 'Soft Lighting',
  'fluorescent': 'Fluorescent',
  'neon': 'Neon',
  'firelight': 'Firelight',

  // Cinematic lighting
  'rembrandt': 'Rembrandt Lighting',
  'film-noir': 'Film Noir',
  'volumetric': 'Volumetric Lighting',
  'high-key': 'High-Key',
  'low-key': 'Low-Key',
  'backlit': 'Backlighting',
  'silhouette': 'Silhouette',
};

// ==================== Mood/Tone Labels ====================

/** Display labels for mood and tone options */
export const MOOD_TONE_LABELS: Record<MoodTone, string> = {
  // Positive moods
  'happy': 'Happy',
  'joyful': 'Joyful',
  'uplifting': 'Uplifting',
  'whimsical': 'Whimsical',
  'peaceful': 'Peaceful',
  'serene': 'Serene',
  'romantic': 'Romantic',
  'euphoric': 'Euphoric',
  'dreamy': 'Dreamy',

  // Negative moods
  'sad': 'Sad',
  'melancholy': 'Melancholy',
  'somber': 'Somber',
  'tense': 'Tense',
  'suspenseful': 'Suspenseful',
  'eerie': 'Eerie',
  'unsettling': 'Unsettling',
  'gritty': 'Gritty',
  'raw': 'Raw',

  // Intense moods
  'epic': 'Epic',
  'grandiose': 'Grandiose',
  'dramatic': 'Dramatic',
  'thrilling': 'Thrilling',
  'chaotic': 'Chaotic',

  // Creative/Surreal
  'psychedelic': 'Psychedelic',
  'surreal': 'Surreal',

  // Other
  'mysterious': 'Mysterious',
  'nostalgic': 'Nostalgic',
  'dystopian': 'Dystopian',
  'utopian': 'Utopian',
  'minimalist': 'Minimalist',
};

// ==================== Temporal Speed Labels ====================

/** Display labels for temporal speed settings */
export const TEMPORAL_SPEED_LABELS: Record<TemporalSpeed, string> = {
  'slow-motion': 'Slow Motion',
  'normal': 'Normal Speed',
  'fast-motion': 'Fast Motion',
  'time-lapse': 'Time-Lapse',
};

// ==================== Transition Type Labels ====================

/** Display labels for transition types */
export const TRANSITION_TYPE_LABELS: Record<TransitionType, string> = {
  'none': 'None / Continuous Scene',

  // Camera-based
  'whip-pan-blur': 'Whip Pan Blur',
  'zoom-bridge': 'Push-In/Pull-Out Zoom',
  'orbital-reveal': 'Orbital Reveal',
  'dolly-through': 'Dolly Through Object',
  'crane-transition': 'Crane Ascent/Descent',

  // Natural
  'water-immersion': 'Water Immersion',
  'smoke-fog': 'Smoke/Fog Obscuration',
  'light-flare': 'Light Flare Wash',

  // Match-cut
  'shape-match': 'Shape Match',
  'movement-match': 'Movement/Gesture Match',
  'color-match': 'Color/Tone Match',

  // Environmental
  'time-lapse': 'Time-of-Day Shift',
  'weather-shift': 'Weather Transformation',
  'seasonal-morph': 'Seasonal Morph',

  // Creative
  'reflection-swap': 'Reflection/Refraction Swap',
  'silhouette-morph': 'Silhouette Morph',
  'object-wipe': 'Foreground Object Wipe',

  // Compound
  'rack-focus': 'Rack Focus Shift',
  'crash-zoom-transition': 'Crash Zoom Transition',
  'freeze-blend': 'Freeze Frame Blend',
};

// ==================== Helper Functions ====================

/**
 * Get display label for any taxonomy type
 * Type-safe with exhaustive checking
 * @param type - The taxonomy type to look up
 * @param value - The value to get the label for
 * @returns The display label string
 */
export function getDisplayLabel(
  type: 'camera-angle' | 'lens-type' | 'optical-effect' | 'cinematic-technique' |
        'lighting-quality' | 'mood-tone' | 'temporal-speed' | 'transition-type',
  value: string
): string {
  switch (type) {
    case 'camera-angle':
      return CAMERA_ANGLE_LABELS[value as CameraAngle] || value;
    case 'lens-type':
      return LENS_TYPE_LABELS[value as LensType] || value;
    case 'optical-effect':
      return OPTICAL_EFFECT_LABELS[value as OpticalEffect] || value;
    case 'cinematic-technique':
      return CINEMATIC_TECHNIQUE_LABELS[value as CinematicTechnique] || value;
    case 'lighting-quality':
      return LIGHTING_QUALITY_LABELS[value as LightingQuality] || value;
    case 'mood-tone':
      return MOOD_TONE_LABELS[value as MoodTone] || value;
    case 'temporal-speed':
      return TEMPORAL_SPEED_LABELS[value as TemporalSpeed] || value;
    case 'transition-type':
      return TRANSITION_TYPE_LABELS[value as TransitionType] || value;
    default:
      return value;
  }
}

/**
 * Get all options for a taxonomy as [value, label] pairs
 * Useful for populating dropdown selectors in Phase 5 UI
 * @param type - The taxonomy type to get options for
 * @returns Array of [value, label] tuples
 */
export function getTaxonomyOptions(
  type: 'camera-angle' | 'lens-type' | 'optical-effect' | 'cinematic-technique' |
        'lighting-quality' | 'mood-tone' | 'temporal-speed' | 'transition-type'
): Array<[string, string]> {
  switch (type) {
    case 'camera-angle':
      return Object.entries(CAMERA_ANGLE_LABELS);
    case 'lens-type':
      return Object.entries(LENS_TYPE_LABELS);
    case 'optical-effect':
      return Object.entries(OPTICAL_EFFECT_LABELS);
    case 'cinematic-technique':
      return Object.entries(CINEMATIC_TECHNIQUE_LABELS);
    case 'lighting-quality':
      return Object.entries(LIGHTING_QUALITY_LABELS);
    case 'mood-tone':
      return Object.entries(MOOD_TONE_LABELS);
    case 'temporal-speed':
      return Object.entries(TEMPORAL_SPEED_LABELS);
    case 'transition-type':
      return Object.entries(TRANSITION_TYPE_LABELS);
    default:
      return [];
  }
}
