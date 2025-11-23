/**
 * Markdown Parser for Intermediate Format
 * Parses the markdown intermediate structure into a structured object for transformers
 */

export interface ParsedIntermediate {
  temporal?: {
    segments: Array<{
      startTime: number;
      endTime: number;
      description: string;
      camera?: string;
      visual?: string;
      audio?: string;
    }>;
  };
  visual?: {
    setting?: string;
    subjects?: string[];
    environment?: string;
    colors?: string;
    lighting?: string;
    composition?: string;
    style?: string;
  };
  audio?: {
    dialogue?: string;
    ambient?: string;
    soundEffects?: string;
    music?: string;
  };
  camera?: {
    movement?: string;
    angles?: string;
    techniques?: string;
  };
  narrative?: {
    beginning?: string;
    middle?: string;
    end?: string;
  };
}

/**
 * Parse markdown intermediate structure into object
 */
export function parseMarkdownIntermediate(markdown: string): ParsedIntermediate {
  const result: ParsedIntermediate = {};

  // Split into sections by ## headers
  const sections = markdown.split(/^## /m).filter(s => s.trim());

  for (const section of sections) {
    const lines = section.split('\n');
    const sectionName = lines[0].trim().toLowerCase();
    const content = lines.slice(1).join('\n').trim();

    switch (sectionName) {
      case 'temporal':
        result.temporal = parseTemporal(content);
        break;
      case 'visual':
        result.visual = parseVisual(content);
        break;
      case 'audio':
        result.audio = parseAudio(content);
        break;
      case 'camera':
        result.camera = parseCamera(content);
        break;
      case 'narrative':
        result.narrative = parseNarrative(content);
        break;
    }
  }

  return result;
}

/**
 * Parse Temporal section with segments
 */
function parseTemporal(content: string): ParsedIntermediate['temporal'] {
  const segments: any[] = [];

  // Match ### Segment N (X-Ys) blocks
  const segmentMatches = content.matchAll(/### Segment \d+ \((\d+)-(\d+)s\)([\s\S]*?)(?=### Segment|\n*$)/g);

  for (const match of segmentMatches) {
    const startTime = parseInt(match[1]);
    const endTime = parseInt(match[2]);
    const segmentContent = match[3].trim();

    // Parse bullet points within segment
    const segment: any = { startTime, endTime, description: '' };

    const bullets = segmentContent.matchAll(/- \*\*(\w+)\*\*:\s*(.+)/g);
    for (const bullet of bullets) {
      const field = bullet[1].toLowerCase();
      const value = bullet[2].trim();

      if (field === 'description') {
        segment.description = value;
      } else if (field === 'camera') {
        segment.camera = value;
      } else if (field === 'visual') {
        segment.visual = value;
      } else if (field === 'audio') {
        segment.audio = value;
      }
    }

    if (segment.description) {
      segments.push(segment);
    }
  }

  return segments.length > 0 ? { segments } : undefined;
}

/**
 * Parse Visual section with fields
 */
function parseVisual(content: string): ParsedIntermediate['visual'] {
  const visual: any = {};

  // Match - **FieldName**: value
  const fields = content.matchAll(/- \*\*(\w+)\*\*:\s*(.+)/g);

  for (const field of fields) {
    const fieldName = field[1].toLowerCase();
    const value = field[2].trim();

    switch (fieldName) {
      case 'setting':
        visual.setting = value;
        break;
      case 'subjects':
        visual.subjects = value.split(',').map(s => s.trim());
        break;
      case 'environment':
        visual.environment = value;
        break;
      case 'colors':
        visual.colors = value;
        break;
      case 'lighting':
        visual.lighting = value;
        break;
      case 'composition':
        visual.composition = value;
        break;
      case 'style':
        visual.style = value;
        break;
    }
  }

  return Object.keys(visual).length > 0 ? visual : undefined;
}

/**
 * Parse Audio section with fields
 */
function parseAudio(content: string): ParsedIntermediate['audio'] {
  const audio: any = {};

  const fields = content.matchAll(/- \*\*(\w+)\*\*:\s*(.+)/g);

  for (const field of fields) {
    const fieldName = field[1].toLowerCase();
    const value = field[2].trim();

    switch (fieldName) {
      case 'dialogue':
        audio.dialogue = value.replace(/^["']|["']$/g, ''); // Strip quotes
        break;
      case 'ambient':
        audio.ambient = value;
        break;
      case 'sound effects':
      case 'soundeffects':
        audio.soundEffects = value;
        break;
      case 'music':
        audio.music = value;
        break;
    }
  }

  return Object.keys(audio).length > 0 ? audio : undefined;
}

/**
 * Parse Camera section with fields
 */
function parseCamera(content: string): ParsedIntermediate['camera'] {
  const camera: any = {};

  const fields = content.matchAll(/- \*\*(\w+)\*\*:\s*(.+)/g);

  for (const field of fields) {
    const fieldName = field[1].toLowerCase();
    const value = field[2].trim();

    switch (fieldName) {
      case 'movement':
        camera.movement = value;
        break;
      case 'angles':
        camera.angles = value;
        break;
      case 'techniques':
        camera.techniques = value;
        break;
    }
  }

  return Object.keys(camera).length > 0 ? camera : undefined;
}

/**
 * Parse Narrative section (if present)
 */
function parseNarrative(content: string): ParsedIntermediate['narrative'] {
  const narrative: any = {};

  const fields = content.matchAll(/- \*\*(\w+)\*\*:\s*(.+)/g);

  for (const field of fields) {
    const fieldName = field[1].toLowerCase();
    const value = field[2].trim();

    switch (fieldName) {
      case 'beginning':
        narrative.beginning = value;
        break;
      case 'middle':
        narrative.middle = value;
        break;
      case 'end':
        narrative.end = value;
        break;
    }
  }

  return Object.keys(narrative).length > 0 ? narrative : undefined;
}
