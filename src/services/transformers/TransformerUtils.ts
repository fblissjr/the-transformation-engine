/**
 * TransformerUtils
 * Shared utility functions for IntermediateV3 → Model-Specific transformers
 */

import type { ObjectLibraryService } from '../objectLibraryService';
import type {
  ComponentBase,
  CameraObjectData,
  CharacterObjectData,
  LocationObjectData,
  ActionComponent,
  ContextComponent,
  StyleComponent,
} from '../../../types/componentTypes';
import type { AudioSegment } from '../../../types/audioTypes';

export class TransformerUtils {
  // ============================================================================
  // COMPONENT RESOLUTION
  // ============================================================================

  /**
   * Resolve object references to actual data
   * Handles: cinematography, subject, location components
   */
  static async resolveComponent<T>(
    component: ComponentBase<T>,
    objectLibrary: ObjectLibraryService
  ): Promise<T> {
    if (component.type === 'text') {
      return component.text as unknown as T;
    }

    // type === 'object_reference'
    const object = await objectLibrary.getObject(
      component.objectId,
      component.objectType
    );

    if (!object) {
      throw new Error(`Object ${component.objectId} not found in library`);
    }

    // Apply overrides if present
    if (component.overrides) {
      return this.deepMerge(object.data, component.overrides);
    }

    return object.data as T;
  }

  /**
   * Deep merge for applying overrides
   */
  static deepMerge(target: any, override: any): any {
    const result = { ...target };

    for (const key in override) {
      if (typeof override[key] === 'object' && override[key] !== null && !Array.isArray(override[key])) {
        result[key] = this.deepMerge(target[key] || {}, override[key]);
      } else {
        result[key] = override[key];
      }
    }

    return result;
  }

  // ============================================================================
  // FORMATTING FUNCTIONS
  // ============================================================================

  /**
   * Format character data to natural language
   */
  static formatCharacter(character: CharacterObjectData): string {
    const parts: string[] = [];

    // Name
    if (character.name) {
      parts.push(character.name);
    }

    // Appearance - head
    if (character.appearance?.head) {
      const head = character.appearance.head;
      if (head.age) parts.push(head.age);
      if (head.features) parts.push(head.features);
      if (head.hair) parts.push(`${head.hair} hair`);
      if (head.expression) parts.push(`with ${head.expression} expression`);
    }

    // Appearance - body
    if (character.appearance?.body) {
      const body = character.appearance.body;
      if (body.build) parts.push(`${body.build} build`);
      if (body.height) parts.push(body.height);
      if (body.clothing && body.clothing.length > 0) {
        parts.push(`wearing ${body.clothing.join(', ')}`);
      }
      if (body.augmentations && body.augmentations.length > 0) {
        parts.push(`with ${body.augmentations.join(', ')}`);
      }
    }

    // Equipment
    if (character.equipment && character.equipment.length > 0) {
      parts.push(`equipped with ${character.equipment.join(', ')}`);
    }

    return parts.join(', ');
  }

  /**
   * Format camera data to natural language
   */
  static formatCamera(camera: CameraObjectData): string {
    const parts: string[] = [];

    // Shot type
    if (camera.shotType) {
      parts.push(`${camera.shotType} shot`);
    }

    // Angle
    if (camera.angle && camera.angle !== 'eye-level') {
      parts.push(camera.angle);
    }

    // Movement
    if (camera.movement) {
      const movement = camera.movement;
      if (movement.type !== 'static') {
        const movementDesc = [movement.type];
        if (movement.speed) movementDesc.push(movement.speed);
        if (movement.direction) movementDesc.push(movement.direction);
        if (movement.easing) movementDesc.push(`(${movement.easing})`);
        parts.push(movementDesc.join(' '));
      }
    }

    // Lens
    if (camera.lens) {
      const lens = camera.lens;
      if (lens.focalLength) parts.push(lens.focalLength);
      if (lens.aperture) parts.push(lens.aperture);
      if (lens.depthOfField) parts.push(`${lens.depthOfField} depth of field`);
    }

    // Style
    if (camera.style) {
      parts.push(`${camera.style} style`);
    }

    return parts.join(', ');
  }

  /**
   * Format location data to natural language
   */
  static formatLocation(location: LocationObjectData): string {
    const parts: string[] = [];

    // Name
    if (location.name) {
      parts.push(location.name);
    }

    // Setting
    if (location.setting) {
      const setting = location.setting;
      if (setting.geography) parts.push(setting.geography);
      if (setting.architecture) parts.push(`${setting.architecture} architecture`);
      if (setting.scale) parts.push(`${setting.scale} scale`);
    }

    // Lighting
    if (location.lighting) {
      const lighting = location.lighting;
      if (lighting.quality) parts.push(`${lighting.quality} lighting`);
      if (lighting.sources && lighting.sources.length > 0) {
        parts.push(`lit by ${lighting.sources.join(' and ')}`);
      }
      if (lighting.colorTemperature) {
        parts.push(`${lighting.colorTemperature} temperature`);
      }
    }

    // Details
    if (location.details && location.details.length > 0) {
      parts.push(`featuring ${location.details.join(', ')}`);
    }

    return parts.join(', ');
  }

  /**
   * Format action component to natural language
   */
  static formatAction(action: ActionComponent): string {
    const parts: string[] = [];

    // Primary action
    parts.push(action.verb);

    if (action.target) {
      if (typeof action.target === 'string') {
        parts.push(action.target);
      } else {
        // Object reference - indicate it needs resolution
        parts.push('[object reference]');
      }
    }

    if (action.manner) {
      parts.push(action.manner);
    }

    // Duration/timing
    if (action.duration) {
      parts.push(`(${action.duration})`);
    }

    // Secondary actions
    if (action.secondaryActions && action.secondaryActions.length > 0) {
      const secondaryDescs = action.secondaryActions.map(sa => {
        const saParts = [sa.verb];
        if (sa.target) {
          if (typeof sa.target === 'string') {
            saParts.push(sa.target);
          }
        }
        if (sa.timing) saParts.push(`(${sa.timing})`);
        return saParts.join(' ');
      });
      parts.push(`then ${secondaryDescs.join(', then ')}`);
    }

    return parts.join(' ');
  }

  /**
   * Format context component to natural language
   */
  static formatContext(context: ContextComponent): string {
    const parts: string[] = [];

    // Location (assuming already resolved to text)
    if (context.location) {
      if (typeof context.location === 'string') {
        parts.push(context.location);
      } else if (context.location.type === 'text') {
        parts.push(context.location.text);
      }
    }

    // Time of day
    if (context.timeOfDay) {
      parts.push(`during ${context.timeOfDay}`);
    }

    // Season
    if (context.season) {
      parts.push(`in ${context.season}`);
    }

    // Era
    if (context.era) {
      parts.push(`${context.era} era`);
    }

    // Weather
    if (context.weather) {
      const weather = context.weather;
      let weatherDesc = weather.condition;
      if (weather.intensity) {
        weatherDesc = `${weather.intensity} ${weatherDesc}`;
      }
      parts.push(weatherDesc);

      if (weather.progression) {
        parts.push(
          `transitioning from ${weather.progression.from} to ${weather.progression.to} over ${weather.progression.duration}`
        );
      }
    }

    // Atmosphere
    if (context.atmosphere) {
      parts.push(`with ${context.atmosphere} atmosphere`);
    }

    return parts.join(', ');
  }

  /**
   * Format style component to natural language
   */
  static formatStyle(style: StyleComponent): string {
    const parts: string[] = [];

    // Visual style
    if (style.visualStyle && style.visualStyle.length > 0) {
      parts.push(style.visualStyle.join(', '));
    }

    // Mood
    if (style.mood && style.mood.length > 0) {
      parts.push(`mood: ${style.mood.join(', ')}`);
    }

    // Color palette
    if (style.colorPalette && style.colorPalette.length > 0) {
      parts.push(`colors: ${style.colorPalette.join(', ')}`);
    }

    // Style references
    if (style.styleReferences && style.styleReferences.length > 0) {
      parts.push(`inspired by ${style.styleReferences.join(' and ')}`);
    }

    // Technique
    if (style.technique && style.technique.length > 0) {
      parts.push(style.technique.join(', '));
    }

    return parts.join(', ');
  }

  /**
   * Format audio segments with original Veo 3.1 syntax
   */
  static formatAudio(audioSegments: AudioSegment[] | undefined): string {
    if (!audioSegments || audioSegments.length === 0) {
      return '';
    }

    return audioSegments.map(audio => audio.originalSyntax).join('\n');
  }

  // ============================================================================
  // CONTEXT HELPERS
  // ============================================================================

  /**
   * Resolve context component's location if it's an object reference
   */
  static async resolveContextComponent(
    context: ContextComponent,
    objectLibrary: ObjectLibraryService
  ): Promise<string> {
    const resolved = { ...context };

    // If location is an object reference, resolve it
    if (context.location && typeof context.location !== 'string') {
      if (context.location.type === 'object_reference') {
        const locationData = await this.resolveComponent(
          context.location as any,
          objectLibrary
        );
        resolved.location = this.formatLocation(locationData as any);
      } else if (context.location.type === 'text') {
        resolved.location = context.location.text;
      }
    }

    return this.formatContext(resolved);
  }
}
