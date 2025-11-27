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
  PropObjectData,
  ActionComponent,
  ContextComponent,
  StyleComponent,
  SubjectComponent,
  MultiSubjectComponent,
  TextComponent,
  ObjectReferenceComponent,
} from '../../../types/componentTypes';
import type { AudioSegment } from '../../../types/audioTypes';

/**
 * Utility class providing shared methods for transforming components into natural language strings.
 * Used by various transformers to resolve references and format data.
 */
export class TransformerUtils {
  // ============================================================================
  // COMPONENT RESOLUTION
  // ============================================================================

  /**
   * Resolve object references to actual data
   * Handles: cinematography, subject, location components
   *
   * @param component - The component to resolve (text or object reference).
   * @param objectLibrary - The object library service to fetch object data.
   * @returns A Promise resolving to the component data.
   * @throws Error if the referenced object is not found.
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
   *
   * @param target - The target object.
   * @param override - The object containing override values.
   * @returns A new object with overrides applied.
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
   *
   * @param character - The character object data.
   * @returns A string describing the character.
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
   *
   * @param camera - The camera object data.
   * @returns A string describing the camera setup.
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
   *
   * @param location - The location object data.
   * @returns A string describing the location.
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
   *
   * @param action - The action component data.
   * @returns A string describing the action.
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
   *
   * @param context - The context component data.
   * @returns A string describing the context.
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
   *
   * @param style - The style component data.
   * @returns A string describing the style.
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
   *
   * @param audioSegments - Array of audio segments.
   * @returns A formatted string of audio segments.
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
   *
   * @param context - The context component to resolve.
   * @param objectLibrary - The object library service to fetch location data.
   * @returns A Promise resolving to the formatted context string.
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

  // ============================================================================
  // SUBJECT RESOLUTION (NEW - supports multi_subject)
  // ============================================================================

  /**
   * Resolve subject component which can be text, object_reference, or multi_subject
   *
   * @param subject - The subject component to resolve.
   * @param objectLibrary - The object library service to fetch object data.
   * @returns A Promise resolving to the formatted subject string.
   */
  static async resolveSubjectComponent(
    subject: SubjectComponent,
    objectLibrary: ObjectLibraryService
  ): Promise<string> {
    if (subject.type === 'text') {
      return subject.text;
    }

    if (subject.type === 'object_reference') {
      const data = await this.resolveComponent(subject, objectLibrary);
      // Determine if it's a character or prop based on objectType
      if (subject.objectType === 'character') {
        return this.formatCharacter(data as CharacterObjectData);
      } else if (subject.objectType === 'prop') {
        return this.formatProp(data as PropObjectData);
      }
      return String(data);
    }

    if (subject.type === 'multi_subject') {
      return this.formatMultiSubject(subject, objectLibrary);
    }

    return '';
  }

  /**
   * Format multi-subject component to natural language
   *
   * @param multiSubject - The multi-subject component.
   * @param objectLibrary - The object library service to resolve references.
   * @returns A Promise resolving to formatted string.
   */
  static async formatMultiSubject(
    multiSubject: MultiSubjectComponent,
    objectLibrary: ObjectLibraryService
  ): Promise<string> {
    const subjectDescriptions: string[] = [];

    for (const subj of multiSubject.subjects) {
      if (subj.type === 'text') {
        subjectDescriptions.push(subj.text);
      } else if (subj.type === 'object_reference') {
        const data = await this.resolveComponent(subj, objectLibrary);
        if (subj.objectType === 'character') {
          subjectDescriptions.push(this.formatCharacter(data as CharacterObjectData));
        } else if (subj.objectType === 'prop') {
          subjectDescriptions.push(this.formatProp(data as PropObjectData));
        }
      }
    }

    let result = subjectDescriptions.join(' and ');

    // Add relationship context if present
    if (multiSubject.relationship) {
      result += `, ${multiSubject.relationship}`;
    }

    return result;
  }

  /**
   * Format prop data to natural language
   *
   * @param prop - The prop object data.
   * @returns A string describing the prop.
   */
  static formatProp(prop: PropObjectData): string {
    const parts: string[] = [];

    if (prop.name) {
      parts.push(prop.name);
    }

    if (prop.appearance) {
      const app = prop.appearance;
      if (app.material) parts.push(app.material);
      if (app.color) parts.push(app.color);
      if (app.size) parts.push(app.size);
      if (app.condition) parts.push(app.condition);
    }

    if (prop.function) {
      parts.push(`(${prop.function})`);
    }

    return parts.join(', ');
  }

  // ============================================================================
  // MODEL-SPECIFIC FORMATTING (NEW)
  // ============================================================================

  /**
   * Format camera movement with imperial measurements for Sora 2
   * Example: "Dolly forward 4 ft at 1 ft/s"
   *
   * @param camera - The camera object data.
   * @returns A string with imperial measurements.
   */
  static formatCameraImperial(camera: CameraObjectData): string {
    const parts: string[] = [];

    if (camera.shotType) {
      parts.push(`${camera.shotType} shot`);
    }

    if (camera.movement && camera.movement.type !== 'static') {
      const movement = camera.movement;
      let movementDesc = movement.type.charAt(0).toUpperCase() + movement.type.slice(1);

      // Add direction with imperial distance estimate
      if (movement.direction) {
        movementDesc += ` ${movement.direction}`;
      }

      // Add speed as ft/s
      if (movement.speed) {
        const speedMap: Record<string, string> = {
          slow: '1 ft/s',
          medium: '3 ft/s',
          fast: '6 ft/s',
        };
        const speedFt = speedMap[movement.speed] || '2 ft/s';
        movementDesc += ` at ${speedFt}`;
      }

      // Add distance estimate based on movement type
      const distanceMap: Record<string, string> = {
        dolly: '4 ft',
        track: '6 ft',
        crane: '8 ft',
        steadicam: '10 ft',
      };
      const distanceFt = distanceMap[movement.type] || '4 ft';
      movementDesc += ` covering ${distanceFt}`;

      parts.push(movementDesc);
    }

    if (camera.angle && camera.angle !== 'eye-level') {
      parts.push(camera.angle);
    }

    return parts.join(', ');
  }

  /**
   * Format lighting with Kelvin temperature and ratios for Sora 2
   * Example: "5600K key; 2:1 key/fill"
   *
   * @param location - The location object data.
   * @returns A string with motivated lighting description.
   */
  static formatLightingMotivated(location: LocationObjectData): string {
    const parts: string[] = [];

    if (location.lighting) {
      const lighting = location.lighting;

      // Map lighting quality to Kelvin
      const kelvinMap: Record<string, string> = {
        'natural-daylight': '5600K',
        'golden-hour': '3200K',
        'blue-hour': '6500K',
        'overcast': '6000K',
        'moonlight': '4100K',
        'fluorescent': '4200K',
        'neon': '2700K',
        'firelight': '1900K',
        'film-noir': '3400K',
        'high-key': '5200K',
        'low-key': '3800K',
      };

      const kelvin = kelvinMap[lighting.quality] || '5000K';
      parts.push(`${kelvin} key`);

      // Add key/fill ratio based on lighting quality
      const ratioMap: Record<string, string> = {
        'film-noir': '8:1 key/fill',
        'low-key': '4:1 key/fill',
        'high-key': '1:1 key/fill',
        'natural-daylight': '2:1 key/fill',
      };
      const ratio = ratioMap[lighting.quality] || '2:1 key/fill';
      parts.push(ratio);

      // Add sources
      if (lighting.sources && lighting.sources.length > 0) {
        parts.push(`from ${lighting.sources.slice(0, 2).join(' and ')}`);
      }
    }

    return parts.join('; ');
  }

  /**
   * Format audio segments with expanded descriptions (45+ words for Veo 3.1)
   *
   * @param audioSegments - Array of audio segments.
   * @returns Expanded audio description.
   */
  static formatAudioExpanded(audioSegments: AudioSegment[] | undefined): string {
    if (!audioSegments || audioSegments.length === 0) {
      return '';
    }

    const expanded: string[] = [];

    for (const audio of audioSegments) {
      let description = audio.originalSyntax || '';

      // Expand based on audio type
      if (audio.type === 'dialogue') {
        // Add delivery context for dialogue
        description += ` The voice carries emotion and presence, grounding the scene with human connection.`;
      } else if (audio.type === 'music') {
        // Expand music descriptions
        description += ` The music establishes atmosphere and emotional undercurrent throughout the scene.`;
      } else if (audio.type === 'ambient') {
        // Expand ambient descriptions
        description += ` These ambient sounds create an immersive soundscape that transports the viewer into the scene.`;
      } else if (audio.type === 'sfx') {
        // Expand SFX descriptions
        description += ` The sound effect punctuates the action with precise audio cues.`;
      }

      expanded.push(description);
    }

    return expanded.join('\n\n');
  }

  /**
   * Format depth layers for Veo 3.1 (foreground/midground/background)
   *
   * @param context - The context component.
   * @param location - Optional resolved location data.
   * @returns A string describing depth layers.
   */
  static formatDepthLayers(
    context: ContextComponent,
    location?: LocationObjectData
  ): string {
    const layers: string[] = [];

    // Derive layers from location details
    if (location?.details) {
      // Split details into depth layers based on keywords
      for (const detail of location.details) {
        const lower = detail.toLowerCase();
        if (lower.includes('close') || lower.includes('foreground') || lower.includes('front')) {
          layers.push(`Foreground: ${detail}`);
        } else if (lower.includes('background') || lower.includes('distant') || lower.includes('far')) {
          layers.push(`Background: ${detail}`);
        } else {
          layers.push(`Midground: ${detail}`);
        }
      }
    }

    // Default layers if none found
    if (layers.length === 0) {
      layers.push('Foreground: Primary subject in sharp focus');
      layers.push('Midground: Environmental context elements');
      layers.push('Background: Atmospheric depth with subtle detail');
    }

    return layers.slice(0, 3).join('. ');
  }

  /**
   * Format timestamped progression for Sora 2 three-paragraph structure
   *
   * @param timestamps - Array of timestamp segments.
   * @returns Three-paragraph formatted string.
   */
  static formatTimestampedProgression(
    timestamps: Array<{ timeRange: string; components: any; audio?: any[] }>
  ): string {
    if (!timestamps || timestamps.length === 0) {
      return '';
    }

    const paragraphs: string[] = [];

    // Convert timestamps to Sora 2 timecode format [0:00-0:03]
    for (const ts of timestamps) {
      // Parse time range like "(0s-3s)" to "[0:00-0:03]"
      const match = ts.timeRange.match(/\((\d+)s?-(\d+)s?\)/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = parseInt(match[2], 10);
        const timecode = `[0:${start.toString().padStart(2, '0')}-0:${end.toString().padStart(2, '0')}]`;
        paragraphs.push(timecode);
      }
    }

    return paragraphs.join('\n\n');
  }

  /**
   * Detect scene type from intermediate
   *
   * @param intermediate - The intermediate to analyze.
   * @returns Scene type: 'dialogue', 'cinematic', 'action', 'product', or 'unknown'.
   */
  static detectSceneType(intermediate: {
    audio?: AudioSegment[];
    timestamps?: any[];
    components?: {
      action?: ActionComponent;
      subject?: SubjectComponent;
    };
    promptingStrategy?: {
      method?: string;
    };
  }): 'dialogue' | 'cinematic' | 'action' | 'product' | 'unknown' {
    // Check for dialogue scenes
    const hasDialogue = intermediate.audio?.some(a => a.type === 'dialogue');
    if (hasDialogue) {
      return 'dialogue';
    }

    // Check for action scenes
    const actionVerb = intermediate.components?.action?.verb?.toLowerCase() || '';
    const actionVerbs = ['chases', 'runs', 'fights', 'jumps', 'crashes', 'dodges', 'sprints', 'attacks', 'escapes', 'draws', 'confronts', 'battles', 'strikes'];
    if (actionVerbs.some(v => actionVerb.includes(v))) {
      return 'action';
    }

    // Check for product scenes
    const productVerbs = ['showcases', 'reveals', 'displays', 'presents', 'demonstrates'];
    if (productVerbs.some(v => actionVerb.includes(v))) {
      return 'product';
    }

    // Check for cinematic (timestamp-based or establishing shots)
    if (intermediate.timestamps && intermediate.timestamps.length > 0) {
      return 'cinematic';
    }
    if (intermediate.promptingStrategy?.method === 'timestamp_segmented') {
      return 'cinematic';
    }
    if (actionVerb.includes('establishes') || actionVerb.includes('drives') || actionVerb.includes('flies')) {
      return 'cinematic';
    }

    return 'unknown';
  }

  /**
   * Format focus strategy for Sora 2
   * Example: "rack focus at 0:05"
   *
   * @param camera - The camera object data.
   * @param timestamps - Optional timestamp segments.
   * @returns A string describing focus strategy with timing.
   */
  static formatFocusStrategy(
    camera: CameraObjectData,
    timestamps?: Array<{ timeRange: string }>
  ): string {
    const techniques = camera.cinematicTechniques || [];
    const hasRackFocus = techniques.includes('rack-focus');
    const lens = camera.lens;

    const parts: string[] = [];

    if (lens?.depthOfField === 'shallow' || hasRackFocus) {
      // Determine timing for rack focus
      let timing = '0:05';
      if (timestamps && timestamps.length > 1) {
        // Use midpoint of scene
        const match = timestamps[1]?.timeRange?.match(/\((\d+)s/);
        if (match) {
          const seconds = parseInt(match[1], 10);
          timing = `0:${seconds.toString().padStart(2, '0')}`;
        }
      }

      if (hasRackFocus) {
        parts.push(`rack focus at ${timing}`);
      } else if (lens?.depthOfField === 'shallow') {
        parts.push(`shallow focus with selective attention at ${timing}`);
      }
    }

    return parts.join(', ') || 'deep focus throughout';
  }
}
