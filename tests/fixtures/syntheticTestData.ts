/**
 * Synthetic Test Data for Integration Tests
 *
 * This file contains realistic test fixtures for:
 * - IntermediateV3 structures (10 examples)
 * - Object Library data (15 objects)
 * - Expected transformer outputs
 *
 * Generated: 2025-11-25
 * Purpose: Integration testing for structured data transformations
 */

import type {
  IntermediateV3,
  SceneComponents,
  AudioSegment,
  TimestampSegment,
} from '../../types/intermediate';
import type {
  CharacterObjectData,
  LocationObjectData,
  CameraObjectData,
  PropObjectData,
  AudioObjectData,
  UniversalObject,
} from '../../types/objectTypes';
import type {
  TextComponent,
  ObjectReferenceComponent,
  ActionComponent,
  ContextComponent,
  StyleComponent,
} from '../../types/componentTypes';

// =============================================================================
// OBJECT LIBRARY TEST DATA (15 Objects)
// =============================================================================

// -----------------------------------------------------------------------------
// CHARACTERS (3)
// -----------------------------------------------------------------------------

export const CHARACTER_HERO: UniversalObject<CharacterObjectData> = {
  id: 'char_hero_001',
  type: 'character',
  version: 1,
  name: 'Detective Sarah Chen',
  description: 'Hard-boiled detective with a sharp wit and sharper instincts',
  tags: ['protagonist', 'detective', 'noir'],
  data: {
    name: 'Detective Sarah Chen',
    appearance: {
      head: {
        age: '35-40',
        features: 'Sharp cheekbones, intense gaze, scar above left eyebrow',
        hair: 'Dark brown, shoulder-length, often tied back',
        expression: 'Guarded, analytical, slight smirk when confident',
      },
      body: {
        build: 'Athletic, lean',
        height: '5\'8"',
        clothing: ['Charcoal grey trench coat', 'Black turtleneck', 'Dark jeans', 'Leather boots'],
        accessories: ['Silver watch', 'Detective badge on belt', 'Small notebook in pocket'],
        augmentations: [],
      },
    },
    personality: {
      traits: ['Analytical', 'Cynical', 'Determined', 'Protective'],
      motivations: ['Justice for victims', 'Proving herself in a male-dominated field'],
      emotional_state: 'Focused but weary from recent case',
    },
    equipment: ['Glock 19', 'Flashlight', 'Crime scene gloves'],
    relationships: {
      char_villain_001: 'Hunting this criminal mastermind',
      char_side_001: 'Trusted partner and confidant',
    },
  },
  linkedScenes: [],
  linkedObjects: ['char_villain_001', 'char_side_001'],
  created: new Date('2025-11-01'),
  modified: new Date('2025-11-01'),
};

export const CHARACTER_VILLAIN: UniversalObject<CharacterObjectData> = {
  id: 'char_villain_001',
  type: 'character',
  version: 1,
  name: 'Marcus Wolfe',
  description: 'Enigmatic criminal mastermind with a taste for theatrics',
  tags: ['antagonist', 'mastermind', 'noir'],
  data: {
    name: 'Marcus Wolfe',
    appearance: {
      head: {
        age: '50-55',
        features: 'Chiseled jawline, piercing blue eyes, meticulously groomed',
        hair: 'Silver-grey, slicked back',
        expression: 'Calculating smile, cold eyes that reveal nothing',
      },
      body: {
        build: 'Tall, imposing',
        height: '6\'2"',
        clothing: ['Black three-piece suit', 'White dress shirt', 'Silk tie', 'Polished Oxford shoes'],
        accessories: ['Gold cufflinks', 'Pocket watch', 'Signet ring'],
        augmentations: [],
      },
    },
    personality: {
      traits: ['Manipulative', 'Charismatic', 'Ruthless', 'Patient'],
      motivations: ['Control', 'Proving intellectual superiority'],
      emotional_state: 'Confident, enjoying the game',
    },
    equipment: ['Encrypted phone', 'Hidden blade in cufflink'],
    relationships: {
      char_hero_001: 'Adversary who amuses him',
    },
  },
  linkedScenes: [],
  linkedObjects: ['char_hero_001'],
  created: new Date('2025-11-01'),
  modified: new Date('2025-11-01'),
};

export const CHARACTER_SIDEKICK: UniversalObject<CharacterObjectData> = {
  id: 'char_side_001',
  type: 'character',
  version: 1,
  name: 'Tech Officer Jamie Park',
  description: 'Young tech-savvy officer who provides digital forensics support',
  tags: ['sidekick', 'tech', 'comic-relief'],
  data: {
    name: 'Tech Officer Jamie Park',
    appearance: {
      head: {
        age: '25-28',
        features: 'Round face, bright eyes behind glasses, friendly smile',
        hair: 'Black, short and messy',
        expression: 'Enthusiastic, often excited about tech discoveries',
      },
      body: {
        build: 'Average, slightly nerdy',
        height: '5\'6"',
        clothing: ['Blue police windbreaker', 'Graphic t-shirt underneath', 'Khaki pants', 'Sneakers'],
        accessories: ['Smart watch', 'Earbuds', 'Tablet in messenger bag'],
        augmentations: [],
      },
    },
    personality: {
      traits: ['Optimistic', 'Curious', 'Loyal', 'Nervous under pressure'],
      motivations: ['Using technology for good', 'Learning from Sarah'],
      emotional_state: 'Eager to prove themselves',
    },
    equipment: ['Laptop with forensics software', 'Digital evidence kit', 'Backup hard drives'],
    relationships: {
      char_hero_001: 'Mentee and trusted partner',
    },
  },
  linkedScenes: [],
  linkedObjects: ['char_hero_001'],
  created: new Date('2025-11-01'),
  modified: new Date('2025-11-01'),
};

// -----------------------------------------------------------------------------
// LOCATIONS (3)
// -----------------------------------------------------------------------------

export const LOCATION_WAREHOUSE: UniversalObject<LocationObjectData> = {
  id: 'loc_warehouse_001',
  type: 'location',
  version: 1,
  name: 'Abandoned Waterfront Warehouse',
  description: 'Decaying industrial space with dramatic lighting and noir atmosphere',
  tags: ['noir', 'urban', 'interior'],
  data: {
    name: 'Abandoned Waterfront Warehouse',
    setting: {
      geography: 'Urban waterfront, industrial district',
      architecture: 'Early 20th century industrial, exposed brick and steel beams',
      scale: 'Vast, cavernous interior',
    },
    lighting: {
      quality: 'film-noir',
      sources: ['Broken skylights', 'Single hanging bulb', 'Light through broken windows', 'Distant street lamps'],
      colorTemperature: 'cool',
    },
    details: [
      'Rusted metal catwalks overhead',
      'Puddles reflecting light on concrete floor',
      'Graffiti on crumbling walls',
      'Abandoned shipping crates stacked in corners',
      'Broken glass scattered around',
      'Pigeons roosting in rafters',
    ],
    ambientSounds: ['Water dripping', 'Wind whistling through broken windows', 'Distant foghorn', 'Creaking metal'],
  },
  linkedScenes: [],
  linkedObjects: [],
  created: new Date('2025-11-01'),
  modified: new Date('2025-11-01'),
};

export const LOCATION_PENTHOUSE: UniversalObject<LocationObjectData> = {
  id: 'loc_penthouse_001',
  type: 'location',
  version: 1,
  name: 'Luxury Downtown Penthouse',
  description: 'Modern high-rise apartment with panoramic city views',
  tags: ['urban', 'luxury', 'interior'],
  data: {
    name: 'Luxury Downtown Penthouse',
    setting: {
      geography: 'Urban, 40th floor of glass tower',
      architecture: 'Contemporary minimalist, floor-to-ceiling windows',
      scale: 'Expansive, open-concept living space',
    },
    lighting: {
      quality: 'high-key',
      sources: ['Natural daylight through windows', 'Recessed LED strips', 'Designer pendant lights'],
      colorTemperature: 'cool',
    },
    details: [
      'White marble floors',
      'Modern furniture with chrome accents',
      'Abstract art on walls',
      'Bar area with crystal decanters',
      'Panoramic cityscape visible through windows',
      'Indoor plants in minimalist planters',
    ],
    ambientSounds: ['Muffled city traffic far below', 'Soft hum of HVAC', 'Occasional elevator ding'],
  },
  linkedScenes: [],
  linkedObjects: [],
  created: new Date('2025-11-01'),
  modified: new Date('2025-11-01'),
};

export const LOCATION_ALLEY: UniversalObject<LocationObjectData> = {
  id: 'loc_alley_001',
  type: 'location',
  version: 1,
  name: 'Rain-Soaked Downtown Alley',
  description: 'Narrow urban alley with neon reflections in puddles',
  tags: ['noir', 'urban', 'exterior'],
  data: {
    name: 'Rain-Soaked Downtown Alley',
    setting: {
      geography: 'Urban, narrow alley between brick buildings',
      architecture: 'Vintage 1940s brick facades, fire escapes',
      scale: 'Claustrophobic, narrow passage',
    },
    lighting: {
      quality: 'neon',
      sources: ['Neon signs from adjacent street', 'Single overhead sodium lamp', 'Light from nearby windows'],
      colorTemperature: 'cool with warm neon accents',
    },
    details: [
      'Wet cobblestone pavement',
      'Steam rising from grates',
      'Overflowing dumpster',
      'Red neon reflected in puddles',
      'Fire escape ladder hanging above',
      'Newspapers scattered, soggy from rain',
    ],
    ambientSounds: ['Rain pattering on metal', 'Distant traffic', 'Neon sign buzzing', 'Water dripping from fire escape'],
  },
  linkedScenes: [],
  linkedObjects: [],
  created: new Date('2025-11-01'),
  modified: new Date('2025-11-01'),
};

// -----------------------------------------------------------------------------
// CAMERAS (3)
// -----------------------------------------------------------------------------

export const CAMERA_STEADICAM_FOLLOW: UniversalObject<CameraObjectData> = {
  id: 'cam_steadicam_001',
  type: 'camera',
  version: 1,
  name: 'Steadicam Follow Shot',
  description: 'Smooth tracking shot following subject through environment',
  tags: ['cinematic', 'dynamic', 'tracking'],
  data: {
    shotType: 'medium',
    angle: 'eye-level',
    movement: {
      type: 'steadicam',
      speed: 'medium',
      direction: 'following subject from behind',
      easing: 'ease-in-out',
    },
    lens: {
      focalLength: '35mm',
      aperture: 'f/2.8',
      depthOfField: 'medium',
      type: 'standard',
      opticalEffects: [],
    },
    style: 'cinematic realism',
    cinematicTechniques: ['long-take'],
  },
  linkedScenes: [],
  linkedObjects: [],
  created: new Date('2025-11-01'),
  modified: new Date('2025-11-01'),
};

export const CAMERA_STATIC_WIDE: UniversalObject<CameraObjectData> = {
  id: 'cam_static_001',
  type: 'camera',
  version: 1,
  name: 'Static Wide Establishing',
  description: 'Fixed wide shot for establishing location and scale',
  tags: ['cinematic', 'establishing', 'static'],
  data: {
    shotType: 'wide',
    angle: 'eye-level',
    movement: {
      type: 'static',
      speed: 'slow',
      direction: 'none',
      easing: 'linear',
    },
    lens: {
      focalLength: '24mm',
      aperture: 'f/5.6',
      depthOfField: 'deep',
      type: 'wide-angle',
      opticalEffects: [],
    },
    style: 'documentary realism',
    cinematicTechniques: [],
  },
  linkedScenes: [],
  linkedObjects: [],
  created: new Date('2025-11-01'),
  modified: new Date('2025-11-01'),
};

export const CAMERA_HANDHELD_INTENSE: UniversalObject<CameraObjectData> = {
  id: 'cam_handheld_001',
  type: 'camera',
  version: 1,
  name: 'Handheld Intense Close-up',
  description: 'Shaky handheld close-up for tension and immediacy',
  tags: ['action', 'intense', 'handheld'],
  data: {
    shotType: 'close-up',
    angle: 'low-angle',
    movement: {
      type: 'handheld',
      speed: 'fast',
      direction: 'dynamic, following action',
      easing: 'linear',
    },
    lens: {
      focalLength: '50mm',
      aperture: 'f/1.4',
      depthOfField: 'shallow',
      type: 'standard',
      opticalEffects: [],
    },
    style: 'gritty realism',
    cinematicTechniques: [],
  },
  linkedScenes: [],
  linkedObjects: [],
  created: new Date('2025-11-01'),
  modified: new Date('2025-11-01'),
};

// -----------------------------------------------------------------------------
// PROPS (3)
// -----------------------------------------------------------------------------

export const PROP_EVIDENCE_BOX: UniversalObject<PropObjectData> = {
  id: 'prop_evidence_001',
  type: 'prop',
  version: 1,
  name: 'Cold Case Evidence Box',
  description: 'Dusty cardboard box containing case files and evidence',
  tags: ['noir', 'mystery', 'plot-device'],
  data: {
    name: 'Cold Case Evidence Box',
    appearance: {
      material: 'Cardboard, worn and dusty',
      color: 'Faded brown with water stains',
      size: 'Banker box, 15" x 12" x 10"',
      condition: 'Aged, corners frayed, tape yellowed',
    },
    function: 'Contains crucial evidence from 10-year-old unsolved case',
    symbolism: 'Past mysteries returning to haunt the present',
  },
  linkedScenes: [],
  linkedObjects: [],
  created: new Date('2025-11-01'),
  modified: new Date('2025-11-01'),
};

export const PROP_VINTAGE_CAR: UniversalObject<PropObjectData> = {
  id: 'prop_car_001',
  type: 'prop',
  version: 1,
  name: '1967 Mustang GT',
  description: 'Classic muscle car, detective\'s prized possession',
  tags: ['vehicle', 'noir', 'iconic'],
  data: {
    name: '1967 Mustang GT',
    appearance: {
      material: 'Steel body, chrome trim',
      color: 'Dark blue metallic',
      size: 'Full-size muscle car',
      condition: 'Meticulously maintained, slight patina adds character',
    },
    function: 'Detective\'s personal vehicle and mobile office',
    symbolism: 'Connection to past, tradition in modern world',
  },
  linkedScenes: [],
  linkedObjects: [],
  created: new Date('2025-11-01'),
  modified: new Date('2025-11-01'),
};

export const PROP_ENCRYPTED_DRIVE: UniversalObject<PropObjectData> = {
  id: 'prop_drive_001',
  type: 'prop',
  version: 1,
  name: 'Encrypted USB Drive',
  description: 'Small black USB drive containing critical encrypted data',
  tags: ['tech', 'plot-device', 'macguffin'],
  data: {
    name: 'Encrypted USB Drive',
    appearance: {
      material: 'Matte black metal housing',
      color: 'Black with single red LED',
      size: 'Standard USB 3.0 flash drive, 2.5 inches',
      condition: 'New, unmarked, anonymous',
    },
    function: 'Contains encrypted files linking Wolfe to criminal network',
    symbolism: 'Digital secrets, the truth waiting to be unlocked',
  },
  linkedScenes: [],
  linkedObjects: [],
  created: new Date('2025-11-01'),
  modified: new Date('2025-11-01'),
};

// -----------------------------------------------------------------------------
// AUDIO (3)
// -----------------------------------------------------------------------------

export const AUDIO_NOIR_SCORE: UniversalObject<AudioObjectData> = {
  id: 'audio_music_001',
  type: 'audio',
  version: 1,
  name: 'Noir Jazz Score',
  description: 'Moody jazz with walking bass and muted trumpet',
  tags: ['music', 'noir', 'atmospheric'],
  data: {
    category: 'music',
    content: 'Slow jazz with walking double bass, brushed drums, muted trumpet playing melancholic melody',
    delivery: 'Subdued, atmospheric, building tension',
    duration: 'throughout',
    mood: ['melancholy', 'tense', 'mysterious'],
  },
  linkedScenes: [],
  linkedObjects: [],
  created: new Date('2025-11-01'),
  modified: new Date('2025-11-01'),
};

export const AUDIO_RAIN_AMBIENT: UniversalObject<AudioObjectData> = {
  id: 'audio_ambient_001',
  type: 'audio',
  version: 1,
  name: 'Rain and City Ambience',
  description: 'Steady rain with distant city sounds',
  tags: ['ambient', 'noir', 'environmental'],
  data: {
    category: 'ambient',
    content: 'Steady rain falling, water dripping from gutters, distant traffic, occasional siren',
    duration: 'continuous',
    mood: ['atmospheric', 'moody', 'isolating'],
  },
  linkedScenes: [],
  linkedObjects: [],
  created: new Date('2025-11-01'),
  modified: new Date('2025-11-01'),
};

export const AUDIO_FOOTSTEPS_SFX: UniversalObject<AudioObjectData> = {
  id: 'audio_sfx_001',
  type: 'audio',
  version: 1,
  name: 'Echoing Footsteps',
  description: 'Footsteps echoing in empty warehouse',
  tags: ['sfx', 'footsteps', 'tension'],
  data: {
    category: 'sfx',
    content: 'Slow, deliberate footsteps on concrete, echoing in vast space',
    duration: '3s',
    mood: ['tense', 'suspenseful'],
  },
  linkedScenes: [],
  linkedObjects: [],
  created: new Date('2025-11-01'),
  modified: new Date('2025-11-01'),
};

// =============================================================================
// INTERMEDIATE V3 TEST DATA (10 Examples)
// =============================================================================

// -----------------------------------------------------------------------------
// DIALOGUE SCENES (2)
// -----------------------------------------------------------------------------

export const INTERMEDIATE_DIALOGUE_1: IntermediateV3 = {
  id: 'int_dialogue_001',
  promptId: 'prompt_001',
  version: 3,
  title: 'Warehouse Confrontation',
  created: new Date('2025-11-20'),
  modified: new Date('2025-11-20'),
  components: {
    cinematography: {
      type: 'object_reference',
      objectId: 'cam_handheld_001',
      objectType: 'camera',
    } as ObjectReferenceComponent<CameraObjectData>,
    subject: {
      type: 'multi_subject',
      subjects: [
        {
          type: 'object_reference',
          objectId: 'char_hero_001',
          objectType: 'character',
        } as ObjectReferenceComponent<CharacterObjectData>,
        {
          type: 'object_reference',
          objectId: 'char_villain_001',
          objectType: 'character',
        } as ObjectReferenceComponent<CharacterObjectData>,
      ],
      relationship: 'facing each other across empty space, tense standoff',
    },
    action: {
      type: 'action',
      verb: 'confronts',
      target: {
        type: 'object_reference',
        objectId: 'char_villain_001',
        objectType: 'character',
      },
      manner: 'cautiously approaching, hand near holster',
      timing: 'gradual escalation over 8 seconds',
    } as ActionComponent,
    context: {
      type: 'context',
      location: {
        type: 'object_reference',
        objectId: 'loc_warehouse_001',
        objectType: 'location',
      },
      timeOfDay: 'night',
      atmosphere: 'tense, oppressive silence broken only by dripping water',
    } as ContextComponent,
    style: {
      type: 'style',
      visualStyle: ['film-noir', 'high-contrast'],
      mood: ['tense', 'suspenseful', 'dramatic'],
      colorPalette: ['deep blacks', 'cool blues', 'harsh whites from single light source'],
      technique: ['rack-focus between characters', 'shallow depth of field'],
    } as StyleComponent,
  },
  linkedObjects: {
    characters: ['char_hero_001', 'char_villain_001'],
    locations: ['loc_warehouse_001'],
    cameras: ['cam_handheld_001'],
  },
  audio: [
    {
      type: 'dialogue',
      content: 'I know what you did, Wolfe. The evidence doesn\'t lie.',
      timing: {
        start: '2s',
        duration: '3s',
      },
      originalSyntax: 'Sarah says "I know what you did, Wolfe. The evidence doesn\'t lie." (firm, controlled anger)',
    },
    {
      type: 'dialogue',
      content: 'Evidence? My dear detective, evidence is just a matter of perspective.',
      timing: {
        start: '6s',
        duration: '3s',
      },
      originalSyntax: 'Wolfe says "Evidence? My dear detective, evidence is just a matter of perspective." (amused, condescending)',
    },
    {
      type: 'sfx',
      content: 'Water dripping echoes in empty space, footsteps scrape on concrete',
      timing: {
        duration: 'throughout',
      },
      originalSyntax: 'SFX: Water dripping echoes in empty space, footsteps scrape on concrete',
    },
  ],
  promptingStrategy: {
    method: 'continuous_narrative',
    selectionMode: 'auto',
    reasoning: 'Dialogue-heavy scene benefits from narrative flow',
  },
};

export const INTERMEDIATE_DIALOGUE_2: IntermediateV3 = {
  id: 'int_dialogue_002',
  promptId: 'prompt_002',
  version: 3,
  title: 'Partner Debriefing',
  created: new Date('2025-11-21'),
  modified: new Date('2025-11-21'),
  components: {
    cinematography: {
      type: 'text',
      text: 'Medium two-shot, over-the-shoulder angles alternating between speakers, static camera',
    } as TextComponent,
    subject: {
      type: 'multi_subject',
      subjects: [
        {
          type: 'object_reference',
          objectId: 'char_hero_001',
          objectType: 'character',
        } as ObjectReferenceComponent<CharacterObjectData>,
        {
          type: 'object_reference',
          objectId: 'char_side_001',
          objectType: 'character',
        } as ObjectReferenceComponent<CharacterObjectData>,
      ],
      relationship: 'sitting across from each other at desk, working through evidence',
    },
    action: {
      type: 'action',
      verb: 'discusses',
      target: 'case evidence and digital forensics results',
      manner: 'collaborative, Sarah stern but Jamie enthusiastic',
      timing: 'natural conversation pace',
    } as ActionComponent,
    context: {
      type: 'context',
      location: {
        type: 'text',
        text: 'Police precinct office, fluorescent lighting, cluttered desk with case files',
      },
      timeOfDay: 'late evening',
      atmosphere: 'focused, tired but determined',
    } as ContextComponent,
    style: {
      type: 'style',
      visualStyle: ['naturalistic', 'procedural-drama'],
      mood: ['focused', 'determined'],
      colorPalette: ['cool fluorescent blues', 'warm desk lamp amber', 'neutral office tones'],
      technique: ['rack-focus to evidence on desk', 'shallow depth on close-ups'],
    } as StyleComponent,
  },
  linkedObjects: {
    characters: ['char_hero_001', 'char_side_001'],
    props: ['prop_drive_001'],
  },
  audio: [
    {
      type: 'dialogue',
      content: 'The encryption is military-grade, but I think I can crack it.',
      timing: {
        start: '1s',
        duration: '3s',
      },
      originalSyntax: 'Jamie says "The encryption is military-grade, but I think I can crack it." (excited, confident)',
    },
    {
      type: 'dialogue',
      content: 'How long?',
      timing: {
        start: '4.5s',
        duration: '1s',
      },
      originalSyntax: 'Sarah says "How long?" (direct, focused)',
    },
    {
      type: 'dialogue',
      content: 'Give me until morning. Maybe less if I\'m lucky.',
      timing: {
        start: '6s',
        duration: '3s',
      },
      originalSyntax: 'Jamie says "Give me until morning. Maybe less if I\'m lucky." (determined)',
    },
    {
      type: 'ambient',
      content: 'Quiet office hum, keyboard typing, papers shuffling',
      timing: {
        duration: 'throughout',
      },
      originalSyntax: 'Ambient noise: Quiet office hum, keyboard typing, papers shuffling',
    },
  ],
  promptingStrategy: {
    method: 'component_formula',
    selectionMode: 'auto',
    reasoning: 'Standard dialogue scene with clear component structure',
  },
};

// -----------------------------------------------------------------------------
// CINEMATIC SCENES (2)
// -----------------------------------------------------------------------------

export const INTERMEDIATE_CINEMATIC_1: IntermediateV3 = {
  id: 'int_cinematic_001',
  promptId: 'prompt_003',
  version: 3,
  title: 'Night Drive Through City',
  created: new Date('2025-11-22'),
  modified: new Date('2025-11-22'),
  components: {
    cinematography: {
      type: 'object_reference',
      objectId: 'cam_steadicam_001',
      objectType: 'camera',
      overrides: {
        movement: {
          type: 'dolly',
          speed: 'slow',
          direction: 'following car from side',
          easing: 'linear',
        },
      },
    } as ObjectReferenceComponent<CameraObjectData>,
    subject: {
      type: 'object_reference',
      objectId: 'prop_car_001',
      objectType: 'prop',
    } as ObjectReferenceComponent<PropObjectData>,
    action: {
      type: 'action',
      verb: 'drives',
      target: 'through rain-soaked city streets',
      manner: 'steadily, headlights cutting through mist',
      duration: '10s',
      temporalPacing: {
        speed: 'slow-motion',
        intensity: 'subtle',
        description: 'Slightly slowed to emphasize atmosphere',
      },
    } as ActionComponent,
    context: {
      type: 'context',
      location: {
        type: 'text',
        text: 'Downtown city streets at night, neon signs reflected in wet pavement',
      },
      timeOfDay: 'night, around midnight',
      weather: {
        condition: 'rainy',
        intensity: 'moderate',
        visibility: 'reduced',
      },
      atmosphere: 'moody, introspective, noir aesthetic',
    } as ContextComponent,
    style: {
      type: 'style',
      visualStyle: ['cinematic-noir', 'neon-noir', 'blade-runner-inspired'],
      mood: ['melancholy', 'atmospheric', 'mysterious'],
      colorPalette: ['neon blues and pinks', 'wet street reflections', 'amber streetlights', 'deep shadows'],
      technique: ['motion-blur on background', 'rain streaks on lens', 'bokeh from city lights'],
    } as StyleComponent,
  },
  linkedObjects: {
    props: ['prop_car_001'],
    cameras: ['cam_steadicam_001'],
    audio: ['audio_music_001', 'audio_ambient_001'],
  },
  audio: [
    {
      type: 'music',
      content: 'Slow jazz with walking double bass, brushed drums, muted trumpet playing melancholic melody',
      timing: {
        duration: 'throughout',
      },
      originalSyntax: 'Music: Slow jazz with walking double bass, brushed drums, muted trumpet playing melancholic melody',
      objectReference: {
        objectId: 'audio_music_001',
        objectType: 'audio',
      },
    },
    {
      type: 'ambient',
      content: 'Rain on car roof, windshield wipers rhythmic, tires on wet pavement',
      timing: {
        duration: 'throughout',
      },
      originalSyntax: 'Ambient noise: Rain on car roof, windshield wipers rhythmic, tires on wet pavement',
    },
  ],
  timestamps: [
    {
      timeRange: '(0s-3s)',
      components: {
        action: {
          type: 'action',
          verb: 'drives',
          manner: 'entering frame from left, headlights first',
        } as ActionComponent,
      },
      audio: [
        {
          type: 'sfx',
          content: 'Engine rumble grows louder as car approaches',
          originalSyntax: 'SFX: Engine rumble grows louder as car approaches',
        },
      ],
    },
    {
      timeRange: '(3s-7s)',
      components: {
        cinematography: {
          type: 'text',
          text: 'Camera dollies alongside car, matching speed perfectly',
        } as TextComponent,
        action: {
          type: 'action',
          verb: 'cruises',
          manner: 'steady pace through frame center',
        } as ActionComponent,
      },
      audio: [],
    },
    {
      timeRange: '(7s-10s)',
      components: {
        action: {
          type: 'action',
          verb: 'exits',
          manner: 'continuing out of frame right, taillights fading',
        } as ActionComponent,
      },
      audio: [
        {
          type: 'sfx',
          content: 'Engine sound fades into distance',
          originalSyntax: 'SFX: Engine sound fades into distance',
        },
      ],
    },
  ],
  promptingStrategy: {
    method: 'timestamp_segmented',
    selectionMode: 'auto',
    segmentDuration: 3,
    reasoning: 'Time-based progression important for camera movement sync',
  },
};

export const INTERMEDIATE_CINEMATIC_2: IntermediateV3 = {
  id: 'int_cinematic_002',
  promptId: 'prompt_004',
  version: 3,
  title: 'Warehouse Establishing Shot',
  created: new Date('2025-11-22'),
  modified: new Date('2025-11-22'),
  components: {
    cinematography: {
      type: 'object_reference',
      objectId: 'cam_static_001',
      objectType: 'camera',
      overrides: {
        movement: {
          type: 'crane',
          speed: 'slow',
          direction: 'descending from high angle to eye-level',
          easing: 'ease-in',
        },
      },
    } as ObjectReferenceComponent<CameraObjectData>,
    subject: {
      type: 'text',
      text: 'Abandoned warehouse exterior, no human subjects visible',
    } as TextComponent,
    action: {
      type: 'action',
      verb: 'establishes',
      target: 'location and atmosphere',
      manner: 'slow reveal through descending camera',
      duration: '8s',
    } as ActionComponent,
    context: {
      type: 'context',
      location: {
        type: 'object_reference',
        objectId: 'loc_warehouse_001',
        objectType: 'location',
      },
      timeOfDay: 'dusk, last light fading',
      weather: {
        condition: 'overcast',
        intensity: 'heavy',
        visibility: 'reduced',
      },
      atmosphere: 'foreboding, isolated, danger lurking',
    } as ContextComponent,
    style: {
      type: 'style',
      visualStyle: ['cinematic-wide', 'atmospheric-establishing'],
      mood: ['ominous', 'tense', 'isolated'],
      colorPalette: ['dark greys', 'muted blues', 'dying amber light', 'silhouetted structure'],
      technique: ['deep focus throughout', 'volumetric fog', 'lens flare from setting sun'],
    } as StyleComponent,
  },
  linkedObjects: {
    locations: ['loc_warehouse_001'],
    cameras: ['cam_static_001'],
  },
  audio: [
    {
      type: 'ambient',
      content: 'Distant foghorn, wind through metal structures, seagulls crying',
      timing: {
        duration: 'throughout',
      },
      originalSyntax: 'Ambient noise: Distant foghorn, wind through metal structures, seagulls crying',
    },
    {
      type: 'sfx',
      content: 'Creaking metal, chains swaying in wind',
      timing: {
        duration: 'throughout',
      },
      originalSyntax: 'SFX: Creaking metal, chains swaying in wind',
    },
  ],
  promptingStrategy: {
    method: 'continuous_narrative',
    selectionMode: 'auto',
    reasoning: 'Single establishing shot with consistent atmosphere throughout',
  },
};

// -----------------------------------------------------------------------------
// ACTION SCENES (2)
// -----------------------------------------------------------------------------

export const INTERMEDIATE_ACTION_1: IntermediateV3 = {
  id: 'int_action_001',
  promptId: 'prompt_005',
  version: 3,
  title: 'Alley Chase',
  created: new Date('2025-11-23'),
  modified: new Date('2025-11-23'),
  components: {
    cinematography: {
      type: 'object_reference',
      objectId: 'cam_handheld_001',
      objectType: 'camera',
      overrides: {
        movement: {
          type: 'handheld',
          speed: 'fast',
          direction: 'pursuing subject, dynamic camera shake',
          easing: 'linear',
        },
      },
    } as ObjectReferenceComponent<CameraObjectData>,
    subject: {
      type: 'object_reference',
      objectId: 'char_hero_001',
      objectType: 'character',
    } as ObjectReferenceComponent<CharacterObjectData>,
    action: {
      type: 'action',
      verb: 'chases',
      target: 'fleeing suspect',
      manner: 'sprinting at full speed, vaulting obstacles',
      duration: '7s',
      secondaryActions: [
        {
          verb: 'dodges',
          target: 'overflowing dumpster',
          timing: '2s',
        },
        {
          verb: 'slides',
          target: 'under fire escape ladder',
          timing: '4s',
        },
      ],
    } as ActionComponent,
    context: {
      type: 'context',
      location: {
        type: 'object_reference',
        objectId: 'loc_alley_001',
        objectType: 'location',
      },
      timeOfDay: 'night',
      weather: {
        condition: 'rainy',
        intensity: 'light',
        visibility: 'reduced',
      },
      atmosphere: 'adrenaline-fueled, urgent, chaotic',
    } as ContextComponent,
    style: {
      type: 'style',
      visualStyle: ['gritty-realism', 'bourne-style-action'],
      mood: ['intense', 'urgent', 'chaotic'],
      colorPalette: ['harsh neon', 'motion-blur streaks', 'wet reflections'],
      technique: ['motion-blur on background', 'quick-cut feel', 'tight framing on action'],
    } as StyleComponent,
  },
  linkedObjects: {
    characters: ['char_hero_001'],
    locations: ['loc_alley_001'],
    cameras: ['cam_handheld_001'],
  },
  audio: [
    {
      type: 'sfx',
      content: 'Rapid footsteps splashing in puddles',
      timing: {
        duration: 'throughout',
      },
      originalSyntax: 'SFX: Rapid footsteps splashing in puddles',
    },
    {
      type: 'sfx',
      content: 'Heavy breathing, exertion',
      timing: {
        duration: 'throughout',
      },
      originalSyntax: 'SFX: Heavy breathing, exertion',
    },
    {
      type: 'ambient',
      content: 'Distant sirens, neon buzz, rain on metal',
      timing: {
        duration: 'throughout',
      },
      originalSyntax: 'Ambient noise: Distant sirens, neon buzz, rain on metal',
    },
  ],
  timestamps: [
    {
      timeRange: '(0s-2s)',
      components: {
        action: {
          type: 'action',
          verb: 'sprints',
          manner: 'entering alley at full speed',
        } as ActionComponent,
      },
      audio: [],
    },
    {
      timeRange: '(2s-4s)',
      components: {
        action: {
          type: 'action',
          verb: 'dodges',
          target: 'dumpster',
          manner: 'quick side-step without losing speed',
        } as ActionComponent,
      },
      audio: [
        {
          type: 'sfx',
          content: 'Hand slaps dumpster metal as she pushes off',
          originalSyntax: 'SFX: Hand slaps dumpster metal as she pushes off',
        },
      ],
    },
    {
      timeRange: '(4s-7s)',
      components: {
        action: {
          type: 'action',
          verb: 'slides',
          target: 'under fire escape',
          manner: 'baseball slide through puddle, quickly back to feet',
        } as ActionComponent,
      },
      audio: [
        {
          type: 'sfx',
          content: 'Water splash from slide, grunt of effort',
          originalSyntax: 'SFX: Water splash from slide, grunt of effort',
        },
      ],
    },
  ],
  promptingStrategy: {
    method: 'timestamp_segmented',
    selectionMode: 'auto',
    segmentDuration: 2,
    reasoning: 'Action scenes need precise timing for choreography',
  },
};

export const INTERMEDIATE_ACTION_2: IntermediateV3 = {
  id: 'int_action_002',
  promptId: 'prompt_006',
  version: 3,
  title: 'Rooftop Standoff',
  created: new Date('2025-11-23'),
  modified: new Date('2025-11-23'),
  components: {
    cinematography: {
      type: 'text',
      text: 'Dynamic circular tracking shot, crane movement ascending, wide to medium framing',
    } as TextComponent,
    subject: {
      type: 'multi_subject',
      subjects: [
        {
          type: 'object_reference',
          objectId: 'char_hero_001',
          objectType: 'character',
        } as ObjectReferenceComponent<CharacterObjectData>,
        {
          type: 'object_reference',
          objectId: 'char_villain_001',
          objectType: 'character',
        } as ObjectReferenceComponent<CharacterObjectData>,
      ],
      relationship: 'facing off across rooftop, circling each other',
    },
    action: {
      type: 'action',
      verb: 'draws',
      target: 'weapon',
      manner: 'slow deliberate movement, both characters mirror each other',
      duration: '5s',
      temporalPacing: {
        speed: 'slow-motion',
        intensity: 'extreme',
        description: 'Key moment slowed for dramatic emphasis',
      },
    } as ActionComponent,
    context: {
      type: 'context',
      location: {
        type: 'text',
        text: 'High-rise rooftop, city skyline visible behind, helicopter spotlight sweeping',
      },
      timeOfDay: 'night',
      weather: {
        condition: 'windy',
        intensity: 'heavy',
        visibility: 'clear',
      },
      atmosphere: 'climactic confrontation, life-or-death stakes',
    } as ContextComponent,
    style: {
      type: 'style',
      visualStyle: ['epic-action', 'heat-inspired'],
      mood: ['intense', 'dramatic', 'epic'],
      colorPalette: ['stark white from spotlight', 'city lights bokeh', 'silhouettes against sky'],
      technique: ['slow-motion', 'dramatic lighting shifts', 'lens flare from helicopter'],
    } as StyleComponent,
  },
  linkedObjects: {
    characters: ['char_hero_001', 'char_villain_001'],
  },
  audio: [
    {
      type: 'ambient',
      content: 'Wind howling, helicopter blades thumping, distant city sounds',
      timing: {
        duration: 'throughout',
      },
      originalSyntax: 'Ambient noise: Wind howling, helicopter blades thumping, distant city sounds',
    },
    {
      type: 'music',
      content: 'Tense orchestral score building, strings and brass swelling',
      timing: {
        duration: 'throughout',
      },
      originalSyntax: 'Music: Tense orchestral score building, strings and brass swelling',
    },
  ],
  promptingStrategy: {
    method: 'continuous_narrative',
    selectionMode: 'manual',
    reasoning: 'Single moment stretched for dramatic effect',
  },
};

// -----------------------------------------------------------------------------
// PRODUCT SHOTS (2)
// -----------------------------------------------------------------------------

export const INTERMEDIATE_PRODUCT_1: IntermediateV3 = {
  id: 'int_product_001',
  promptId: 'prompt_007',
  version: 3,
  title: 'Evidence Drive Reveal',
  created: new Date('2025-11-24'),
  modified: new Date('2025-11-24'),
  components: {
    cinematography: {
      type: 'text',
      text: 'Macro lens, extreme close-up, slow rotating dolly around subject, shallow depth of field',
    } as TextComponent,
    subject: {
      type: 'object_reference',
      objectId: 'prop_drive_001',
      objectType: 'prop',
    } as ObjectReferenceComponent<PropObjectData>,
    action: {
      type: 'action',
      verb: 'reveals',
      target: 'encrypted drive',
      manner: 'slow 360-degree rotation, dramatic lighting highlights details',
      duration: '6s',
    } as ActionComponent,
    context: {
      type: 'context',
      location: {
        type: 'text',
        text: 'Dark surface, spotlight illumination, abstract background out of focus',
      },
      atmosphere: 'mysterious, important, weighted with significance',
    } as ContextComponent,
    style: {
      type: 'style',
      visualStyle: ['product-photography', 'commercial-grade', 'dramatic-reveal'],
      mood: ['mysterious', 'important'],
      colorPalette: ['matte black of drive', 'single red LED glow', 'dark background', 'rim lighting'],
      technique: ['macro photography', 'bokeh background', 'rim lighting', 'slow reveal'],
    } as StyleComponent,
  },
  linkedObjects: {
    props: ['prop_drive_001'],
  },
  audio: [
    {
      type: 'music',
      content: 'Minimal electronic drone, building tension',
      timing: {
        duration: 'throughout',
      },
      originalSyntax: 'Music: Minimal electronic drone, building tension',
    },
  ],
  promptingStrategy: {
    method: 'component_formula',
    selectionMode: 'auto',
    reasoning: 'Product-focused shot with clear component breakdown',
  },
};

export const INTERMEDIATE_PRODUCT_2: IntermediateV3 = {
  id: 'int_product_002',
  promptId: 'prompt_008',
  version: 3,
  title: 'Vintage Mustang Beauty Shot',
  created: new Date('2025-11-24'),
  modified: new Date('2025-11-24'),
  components: {
    cinematography: {
      type: 'text',
      text: 'Wide establishing shot transitioning to dolly-in close-ups, golden hour lighting',
    } as TextComponent,
    subject: {
      type: 'object_reference',
      objectId: 'prop_car_001',
      objectType: 'prop',
    } as ObjectReferenceComponent<PropObjectData>,
    action: {
      type: 'action',
      verb: 'showcases',
      target: 'vehicle',
      manner: 'static beauty shot with slow camera movement revealing details',
      duration: '8s',
    } as ActionComponent,
    context: {
      type: 'context',
      location: {
        type: 'text',
        text: 'Empty warehouse parking lot, concrete and brick background, golden hour sunlight streaming through',
      },
      timeOfDay: 'golden hour, late afternoon',
      weather: {
        condition: 'clear',
        intensity: 'light',
        visibility: 'clear',
      },
      atmosphere: 'nostalgic, classic American muscle, timeless',
    } as ContextComponent,
    style: {
      type: 'style',
      visualStyle: ['automotive-photography', 'cinematic-commercial', 'nostalgic'],
      mood: ['nostalgic', 'powerful', 'classic'],
      colorPalette: ['deep blue metallic', 'golden sunlight', 'chrome reflections', 'warm concrete tones'],
      technique: ['rack-focus on chrome details', 'lens flare from sun', 'reflection in paint'],
    } as StyleComponent,
  },
  linkedObjects: {
    props: ['prop_car_001'],
  },
  audio: [
    {
      type: 'ambient',
      content: 'Gentle wind, distant city sounds faded',
      timing: {
        duration: 'throughout',
      },
      originalSyntax: 'Ambient noise: Gentle wind, distant city sounds faded',
    },
    {
      type: 'music',
      content: 'Classic rock guitar riff, nostalgic Americana',
      timing: {
        duration: 'throughout',
      },
      originalSyntax: 'Music: Classic rock guitar riff, nostalgic Americana',
    },
  ],
  timestamps: [
    {
      timeRange: '(0s-3s)',
      components: {
        cinematography: {
          type: 'text',
          text: 'Wide shot, full car in frame, establishing context',
        } as TextComponent,
      },
      audio: [],
    },
    {
      timeRange: '(3s-6s)',
      components: {
        cinematography: {
          type: 'text',
          text: 'Dolly-in to medium shot, focusing on front grille and headlights',
        } as TextComponent,
      },
      audio: [],
    },
    {
      timeRange: '(6s-8s)',
      components: {
        cinematography: {
          type: 'text',
          text: 'Close-up rack focus on chrome details, bokeh background',
        } as TextComponent,
      },
      audio: [],
    },
  ],
  promptingStrategy: {
    method: 'timestamp_segmented',
    selectionMode: 'auto',
    segmentDuration: 3,
    reasoning: 'Automotive showcase with distinct visual phases',
  },
};

// -----------------------------------------------------------------------------
// EDGE CASES (2)
// -----------------------------------------------------------------------------

export const INTERMEDIATE_EDGE_MINIMAL: IntermediateV3 = {
  id: 'int_edge_minimal',
  promptId: 'prompt_009',
  version: 3,
  title: 'Minimal Scene - Single Subject',
  created: new Date('2025-11-25'),
  modified: new Date('2025-11-25'),
  components: {
    cinematography: {
      type: 'text',
      text: 'Static medium shot',
    } as TextComponent,
    subject: {
      type: 'text',
      text: 'Person standing',
    } as TextComponent,
    action: {
      type: 'action',
      verb: 'stands',
      manner: 'still',
    } as ActionComponent,
    context: {
      type: 'context',
      location: {
        type: 'text',
        text: 'Empty room',
      },
    } as ContextComponent,
    style: {
      type: 'style',
      visualStyle: ['minimalist'],
      mood: ['neutral'],
      colorPalette: ['white'],
    } as StyleComponent,
  },
  promptingStrategy: {
    method: 'component_formula',
    selectionMode: 'auto',
    reasoning: 'Minimal data, basic component structure',
  },
};

export const INTERMEDIATE_EDGE_MAXIMAL: IntermediateV3 = {
  id: 'int_edge_maximal',
  promptId: 'prompt_010',
  version: 3,
  title: 'Maximal Scene - All Features',
  created: new Date('2025-11-25'),
  modified: new Date('2025-11-25'),
  components: {
    cinematography: {
      type: 'object_reference',
      objectId: 'cam_steadicam_001',
      objectType: 'camera',
      overrides: {
        lens: {
          focalLength: '85mm',
          aperture: 'f/1.2',
          depthOfField: 'shallow',
          type: 'telephoto',
          opticalEffects: ['lens-flare', 'bokeh'],
        },
        cinematicTechniques: ['long-take', 'match-cut', 'rack-focus'],
      },
    } as ObjectReferenceComponent<CameraObjectData>,
    subject: {
      type: 'multi_subject',
      subjects: [
        {
          type: 'object_reference',
          objectId: 'char_hero_001',
          objectType: 'character',
        } as ObjectReferenceComponent<CharacterObjectData>,
        {
          type: 'object_reference',
          objectId: 'char_villain_001',
          objectType: 'character',
        } as ObjectReferenceComponent<CharacterObjectData>,
        {
          type: 'object_reference',
          objectId: 'char_side_001',
          objectType: 'character',
        } as ObjectReferenceComponent<CharacterObjectData>,
      ],
      relationship: 'complex three-way dynamic, hero and sidekick confronting villain',
    },
    action: {
      type: 'action',
      verb: 'confronts',
      target: {
        type: 'object_reference',
        objectId: 'char_villain_001',
        objectType: 'character',
      },
      manner: 'intensely dramatic, weapons drawn, circling',
      duration: '12s',
      timing: 'building from tension to climax',
      temporalPacing: {
        speed: 'slow-motion',
        intensity: 'extreme',
        description: 'Climactic moment stretched for maximum drama',
      },
      secondaryActions: [
        {
          verb: 'aims',
          target: 'weapon at villain',
          timing: '2s',
        },
        {
          verb: 'shouts',
          target: 'warning',
          timing: '5s',
        },
        {
          verb: 'steps',
          target: 'forward aggressively',
          timing: '8s',
        },
      ],
    } as ActionComponent,
    context: {
      type: 'context',
      location: {
        type: 'object_reference',
        objectId: 'loc_warehouse_001',
        objectType: 'location',
      },
      timeOfDay: 'night, around 2 AM',
      season: 'winter',
      era: 'contemporary, 2025',
      weather: {
        condition: 'stormy',
        intensity: 'heavy',
        visibility: 'obscured',
        progression: {
          from: 'light rain',
          to: 'thunderstorm',
          duration: '12s',
        },
      },
      atmosphere: 'apocalyptic intensity, life-or-death stakes, emotional climax',
      culturalContext: 'Urban American noir tradition',
      historicalContext: 'Echoes of classic detective films',
    } as ContextComponent,
    style: {
      type: 'style',
      visualStyle: ['neo-noir', 'blade-runner-inspired', 'high-contrast', 'volumetric-lighting'],
      mood: ['intense', 'dramatic', 'epic', 'melancholy', 'tense'],
      colorPalette: [
        'deep blacks',
        'neon blues',
        'warm amber highlights',
        'cold steel greys',
        'blood red accents',
        'volumetric fog diffusion',
      ],
      styleReferences: ['Heat finale', 'Blade Runner aesthetic', 'John Wick lighting'],
      technique: [
        'practical lighting effects',
        'smoke/fog atmosphere',
        'rack-focus between characters',
        'motion-blur on rapid movements',
        'lens-flare from lightning',
      ],
      wildcards: {
        lighting: ['volumetric', 'dramatic', 'high-contrast'],
        mood: ['epic', 'tense', 'climactic'],
        style: ['neo-noir', 'cinematic'],
      },
    } as StyleComponent,
  },
  linkedObjects: {
    characters: ['char_hero_001', 'char_villain_001', 'char_side_001'],
    locations: ['loc_warehouse_001'],
    cameras: ['cam_steadicam_001'],
    props: ['prop_evidence_001', 'prop_drive_001'],
    audio: ['audio_music_001', 'audio_ambient_001'],
  },
  audio: [
    {
      type: 'dialogue',
      content: 'It\'s over, Wolfe. The drives, the evidence, everything.',
      timing: {
        start: '1s',
        duration: '3s',
        sync: 'as Sarah steps forward',
      },
      originalSyntax: 'Sarah says "It\'s over, Wolfe. The drives, the evidence, everything." (fierce determination)',
      objectReference: {
        objectId: 'char_hero_001',
        objectType: 'audio',
      },
    },
    {
      type: 'dialogue',
      content: 'Detective, you\'re making assumptions.',
      timing: {
        start: '5s',
        duration: '2s',
        sync: 'with Wolfe\'s cold smile',
      },
      originalSyntax: 'Wolfe says "Detective, you\'re making assumptions." (icy calm)',
      objectReference: {
        objectId: 'char_villain_001',
        objectType: 'audio',
      },
    },
    {
      type: 'dialogue',
      content: 'Sarah, backup is two minutes out!',
      timing: {
        start: '8s',
        duration: '2s',
        sync: 'Jamie\'s voice tense over radio',
      },
      originalSyntax: 'Jamie says "Sarah, backup is two minutes out!" (urgent, worried)',
      objectReference: {
        objectId: 'char_side_001',
        objectType: 'audio',
      },
    },
    {
      type: 'sfx',
      content: 'Thunder crash, rain intensifies, lightning illuminates scene',
      timing: {
        start: '3s',
        duration: '1s',
      },
      originalSyntax: 'SFX: Thunder crash, rain intensifies, lightning illuminates scene',
    },
    {
      type: 'sfx',
      content: 'Multiple footsteps echoing, weapons cocking',
      timing: {
        duration: 'throughout',
      },
      originalSyntax: 'SFX: Multiple footsteps echoing, weapons cocking',
    },
    {
      type: 'ambient',
      content: 'Storm raging outside, wind howling through broken windows, rain pounding',
      timing: {
        duration: 'throughout',
      },
      originalSyntax: 'Ambient noise: Storm raging outside, wind howling through broken windows, rain pounding',
      objectReference: {
        objectId: 'audio_ambient_001',
        objectType: 'audio',
      },
    },
    {
      type: 'music',
      content: 'Epic orchestral score, strings and brass at climax, percussion driving tension',
      timing: {
        duration: 'throughout',
      },
      originalSyntax: 'Music: Epic orchestral score, strings and brass at climax, percussion driving tension',
      objectReference: {
        objectId: 'audio_music_001',
        objectType: 'audio',
      },
    },
  ],
  timestamps: [
    {
      timeRange: '(0s-3s)',
      components: {
        cinematography: {
          type: 'text',
          text: 'Wide shot establishing all three characters, low angle',
        } as TextComponent,
        action: {
          type: 'action',
          verb: 'enters',
          manner: 'Sarah and Jamie burst through door, dramatic entrance',
        } as ActionComponent,
      },
      audio: [
        {
          type: 'sfx',
          content: 'Door slamming open, footsteps rushing',
          originalSyntax: 'SFX: Door slamming open, footsteps rushing',
        },
      ],
      transition: {
        type: 'none',
        description: 'Continuous action',
      },
    },
    {
      timeRange: '(3s-6s)',
      components: {
        cinematography: {
          type: 'text',
          text: 'Rack focus from hero to villain, close-ups',
        } as TextComponent,
        action: {
          type: 'action',
          verb: 'confronts',
          manner: 'verbal exchange, weapons raised',
        } as ActionComponent,
      },
      audio: [],
      transition: {
        type: 'rack-focus',
        duration: '0.5s',
        description: 'Focus pulls from Sarah to Wolfe',
      },
    },
    {
      timeRange: '(6s-9s)',
      components: {
        cinematography: {
          type: 'text',
          text: 'Circling dolly shot, medium framing all three',
        } as TextComponent,
        action: {
          type: 'action',
          verb: 'circles',
          manner: 'all characters slowly repositioning, Mexican standoff',
        } as ActionComponent,
      },
      audio: [],
      transition: {
        type: 'camera-movement',
        duration: '3s',
        description: 'Smooth transition into circular dolly',
      },
    },
    {
      timeRange: '(9s-12s)',
      components: {
        cinematography: {
          type: 'text',
          text: 'Extreme slow-motion, tight close-ups on faces',
        } as TextComponent,
        action: {
          type: 'action',
          verb: 'reaches',
          manner: 'climactic moment, extreme slow-mo',
          temporalPacing: {
            speed: 'slow-motion',
            intensity: 'extreme',
            description: 'Time nearly frozen',
          },
        } as ActionComponent,
      },
      audio: [
        {
          type: 'sfx',
          content: 'Lightning strike, thunder immediate',
          originalSyntax: 'SFX: Lightning strike, thunder immediate',
        },
      ],
      transition: {
        type: 'freeze-blend',
        duration: '1s',
        description: 'Transition to slow-motion',
      },
    },
  ],
  promptingStrategy: {
    method: 'timestamp_segmented',
    selectionMode: 'manual',
    segmentDuration: 3,
    reasoning: 'Complex multi-character scene with precise choreography',
  },
  parentSceneId: 'scene_parent_001',
  childSceneIds: ['scene_child_001', 'scene_child_002'],
};

// =============================================================================
// EXPECTED TRANSFORMER OUTPUTS
// =============================================================================

/**
 * Expected Veo 3.1 Continuous Narrative output
 * For INTERMEDIATE_DIALOGUE_1
 */
export const EXPECTED_VEO3_DIALOGUE_1 = `A tense confrontation unfolds in an abandoned waterfront warehouse at night. Detective Sarah Chen faces criminal mastermind Marcus Wolfe across a vast, cavernous space, their figures dramatically lit by a single hanging bulb casting harsh shadows. Sarah, hand near her holster, cautiously approaches as she confronts Wolfe.

Sarah says "I know what you did, Wolfe. The evidence doesn't lie." (firm, controlled anger)

Wolfe responds with amused condescension, replying "Evidence? My dear detective, evidence is just a matter of perspective." (amused, condescending)

SFX: Water dripping echoes in empty space, footsteps scrape on concrete

The scene is captured with a handheld close-up from a low angle, creating gritty realism with shallow depth of field. The film-noir aesthetic features high contrast with deep blacks and cool blues, enhanced by harsh whites from the single light source. The lighting employs rack focus between the characters against the warehouse's exposed brick and steel beams, while the atmosphere remains oppressive with tension broken only by dripping water.`;

/**
 * Expected Sora 2 Narrative output
 * For INTERMEDIATE_CINEMATIC_1
 */
export const EXPECTED_SORA2_CINEMATIC_1 = `In this atmospheric noir sequence, a 1967 Mustang GT drives through rain-soaked downtown city streets at midnight. The dark blue metallic muscle car cuts through the mist with its headlights, moving steadily along neon-lit streets where blues and pinks reflect off wet pavement and amber streetlights create pools of warm light against deep shadows.

The camera follows with a smooth dolly shot from the side, slightly slowed to emphasize the moody atmosphere. Rain streaks the lens while bokeh effects from distant city lights create an atmospheric backdrop reminiscent of Blade Runner's neo-noir aesthetic.

Music: Slow jazz with walking double bass, brushed drums, muted trumpet playing melancholic melody
Ambient noise: Rain on car roof, windshield wipers rhythmic, tires on wet pavement

The sequence progresses through three distinct beats:
- Opening (0s-3s): The Mustang enters frame from left, headlights first, with engine rumble growing louder
- Middle (3s-7s): Camera dollies perfectly alongside the car as it cruises through the frame center at steady pace
- Closing (7s-10s): The car continues out of frame right, taillights fading as engine sound diminishes into the distance

The overall mood is melancholic and mysterious, with cinematic noir styling that emphasizes motion blur on the background and the interplay between neon colors and shadow.`;

/**
 * Expected Veo 3.1 Timestamp-Segmented output
 * For INTERMEDIATE_ACTION_1
 */
export const EXPECTED_VEO3_ACTION_1 = `(0s-2s): Detective Sarah Chen sprints into the rain-soaked downtown alley at full speed. Handheld close-up from low angle captures her determined expression, harsh neon lighting reflecting in puddles. SFX: Rapid footsteps splashing in puddles, heavy breathing.

(2s-4s): She dodges an overflowing dumpster with a quick side-step, maintaining her sprint without losing momentum. Camera shakes dynamically following the action. SFX: Hand slaps dumpster metal as she pushes off, continued footsteps and exertion.

(4s-7s): Sarah executes a baseball slide under the fire escape ladder, water splashing dramatically, then quickly springs back to her feet to continue pursuit. Tight framing emphasizes the intensity. SFX: Water splash from slide, grunt of effort, footsteps resume.

Ambient noise: Distant sirens, neon buzz, rain on metal (throughout)

The scene employs gritty Bourne-style action cinematography with motion blur on the background, harsh neon colors, and wet reflections creating an intense, urgent, chaotic atmosphere.`;

/**
 * Expected Veo 3.1 Component Formula output
 * For INTERMEDIATE_PRODUCT_1
 */
export const EXPECTED_VEO3_PRODUCT_1 = `CINEMATOGRAPHY: Macro lens extreme close-up with slow rotating dolly circling the subject, shallow depth of field creating cinematic bokeh in the background

SUBJECT: Encrypted USB drive with matte black metal housing and single red LED glowing, appearing mysterious and weighted with significance

ACTION: Dramatic reveal through slow 360-degree rotation over 6 seconds, with lighting highlighting the drive's details and craftsmanship

CONTEXT: Positioned on a dark surface under spotlight illumination, abstract background completely out of focus, creating isolation and emphasis on the subject

STYLE: Product photography with commercial-grade dramatic reveal aesthetic. Color palette dominated by the matte black of the drive, punctuated by red LED glow, with rim lighting creating separation from dark background. Macro photography techniques with bokeh and rim lighting emphasize the object's importance.

Music: Minimal electronic drone, building tension`;

/**
 * Expected Sora 2 output for minimal edge case
 */
export const EXPECTED_SORA2_MINIMAL = `A minimalist scene featuring a person standing still in an empty room. The static medium shot employs a neutral mood with a white color palette. The subject remains motionless in this understated composition that emphasizes simplicity and negative space.`;

/**
 * Expected Veo 3.1 output for maximal edge case (abbreviated)
 */
export const EXPECTED_VEO3_MAXIMAL = `(0s-3s): In an abandoned waterfront warehouse during a raging thunderstorm at 2 AM, Detective Sarah Chen and Tech Officer Jamie Park burst through the door in a dramatic entrance. Wide shot from low angle establishes all three characters - the two officers and criminal mastermind Marcus Wolfe. The neo-noir aesthetic features volumetric lighting cutting through fog, deep blacks contrasted with neon blues and warm amber highlights. SFX: Door slamming open, footsteps rushing, storm raging.

[... additional timestamp segments 3s-12s with full detail ...]

CINEMATOGRAPHY: Steadicam long-take with telephoto 85mm f/1.2 lens creating shallow depth of field. Advanced techniques include rack-focus between characters, lens flare from lightning strikes, and match-cut transitions. The camera work echoes Heat's climactic confrontation aesthetic.

AUDIO THROUGHOUT:
- Ambient noise: Storm raging outside, wind howling through broken windows, rain pounding
- Music: Epic orchestral score, strings and brass at climax, percussion driving tension
- SFX: Multiple footsteps echoing, weapons cocking

The scene represents an apocalyptic intensity climax with life-or-death stakes, utilizing all available cinematic techniques for maximum dramatic impact.`;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all character objects
 */
export function getAllCharacters(): UniversalObject<CharacterObjectData>[] {
  return [CHARACTER_HERO, CHARACTER_VILLAIN, CHARACTER_SIDEKICK];
}

/**
 * Get all location objects
 */
export function getAllLocations(): UniversalObject<LocationObjectData>[] {
  return [LOCATION_WAREHOUSE, LOCATION_PENTHOUSE, LOCATION_ALLEY];
}

/**
 * Get all camera objects
 */
export function getAllCameras(): UniversalObject<CameraObjectData>[] {
  return [CAMERA_STEADICAM_FOLLOW, CAMERA_STATIC_WIDE, CAMERA_HANDHELD_INTENSE];
}

/**
 * Get all prop objects
 */
export function getAllProps(): UniversalObject<PropObjectData>[] {
  return [PROP_EVIDENCE_BOX, PROP_VINTAGE_CAR, PROP_ENCRYPTED_DRIVE];
}

/**
 * Get all audio objects
 */
export function getAllAudio(): UniversalObject<AudioObjectData>[] {
  return [AUDIO_NOIR_SCORE, AUDIO_RAIN_AMBIENT, AUDIO_FOOTSTEPS_SFX];
}

/**
 * Get all object library items
 */
export function getAllObjects(): UniversalObject[] {
  return [
    ...getAllCharacters(),
    ...getAllLocations(),
    ...getAllCameras(),
    ...getAllProps(),
    ...getAllAudio(),
  ];
}

/**
 * Get all IntermediateV3 test fixtures
 */
export function getAllIntermediates(): IntermediateV3[] {
  return [
    INTERMEDIATE_DIALOGUE_1,
    INTERMEDIATE_DIALOGUE_2,
    INTERMEDIATE_CINEMATIC_1,
    INTERMEDIATE_CINEMATIC_2,
    INTERMEDIATE_ACTION_1,
    INTERMEDIATE_ACTION_2,
    INTERMEDIATE_PRODUCT_1,
    INTERMEDIATE_PRODUCT_2,
    INTERMEDIATE_EDGE_MINIMAL,
    INTERMEDIATE_EDGE_MAXIMAL,
  ];
}

/**
 * Get intermediates by scene type
 */
export function getIntermediatesByType(type: 'dialogue' | 'cinematic' | 'action' | 'product' | 'edge'): IntermediateV3[] {
  switch (type) {
    case 'dialogue':
      return [INTERMEDIATE_DIALOGUE_1, INTERMEDIATE_DIALOGUE_2];
    case 'cinematic':
      return [INTERMEDIATE_CINEMATIC_1, INTERMEDIATE_CINEMATIC_2];
    case 'action':
      return [INTERMEDIATE_ACTION_1, INTERMEDIATE_ACTION_2];
    case 'product':
      return [INTERMEDIATE_PRODUCT_1, INTERMEDIATE_PRODUCT_2];
    case 'edge':
      return [INTERMEDIATE_EDGE_MINIMAL, INTERMEDIATE_EDGE_MAXIMAL];
    default:
      return [];
  }
}

/**
 * Get expected transformer output for a given intermediate
 */
export function getExpectedOutput(
  intermediateId: string,
  transformer: 'veo3' | 'sora2'
): string | null {
  const outputs: Record<string, Record<string, string>> = {
    int_dialogue_001: {
      veo3: EXPECTED_VEO3_DIALOGUE_1,
      sora2: EXPECTED_VEO3_DIALOGUE_1, // Veo and Sora handle dialogue similarly
    },
    int_cinematic_001: {
      veo3: EXPECTED_VEO3_ACTION_1, // Uses similar timestamp format
      sora2: EXPECTED_SORA2_CINEMATIC_1,
    },
    int_action_001: {
      veo3: EXPECTED_VEO3_ACTION_1,
      sora2: EXPECTED_SORA2_CINEMATIC_1, // Adapted for action
    },
    int_product_001: {
      veo3: EXPECTED_VEO3_PRODUCT_1,
      sora2: EXPECTED_VEO3_PRODUCT_1, // Product shots similar across models
    },
    int_edge_minimal: {
      veo3: EXPECTED_SORA2_MINIMAL,
      sora2: EXPECTED_SORA2_MINIMAL,
    },
    int_edge_maximal: {
      veo3: EXPECTED_VEO3_MAXIMAL,
      sora2: EXPECTED_VEO3_MAXIMAL,
    },
  };

  return outputs[intermediateId]?.[transformer] || null;
}
