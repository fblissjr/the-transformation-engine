/**
 * Test script for v7 migration
 * Tests the migration logic without requiring a browser
 */

// Mock a Prompt object (based on current schema)
const mockPrompt = {
  id: 'test_prompt_123',
  name: 'Beach Sunset Walk',
  input: 'A woman walks along a beach at sunset',
  structuredOutput: `
temporal_progression: |
  [00:00-00:03] A silhouetted figure enters frame left, their form backlit by the setting sun. They walk along wet sand, each footstep leaving a brief impression before being washed away by gentle waves lapping at the shore.

  [00:03-00:07] The subject progresses through the middle distance as small waves continue to lap at their feet. Golden hour sunlight glints off the water surface, creating shimmering reflections. The camera maintains smooth forward dolly motion, gradually closing distance.

  [00:07-00:10] The figure exits frame right as the sun touches the horizon line. Final rays of sunlight illuminate spray from a larger wave. Camera settles to static wide shot capturing the empty beach with fresh footprints being erased by the tide.

visual_description: |
  The scene captures a serene coastal moment during golden hour. Wet sand reflects the warm orange and pink hues of the sunset sky. Small waves create rhythmic patterns of foam and water on the shore.

camera_movement: "Smooth dolly forward at 0.3 meters/second from wide establishing shot (10 meters from subject) to medium shot (5 meters from subject). 35mm lens equivalent, f/2.8 aperture."

cinematography: "16:9 widescreen framing maintains subject in center-left third as they walk. Depth of field creates separation between sharp subject and softly blurred background ocean."

lighting: "Natural golden hour lighting from setting sun positioned low on horizon. Warm color temperature (3500K) with high dynamic range."

audio_design: "Gentle ocean waves with rhythmic ebb and flow, soft water lapping at shore. Distant seabirds calling intermittently."

style: "Cinematic naturalism with emphasis on color and light. Slight color grading enhancing warm sunset tones."
  `,
  normalizedOutput: null,
  createdAt: new Date('2025-01-15T10:00:00Z'),
  updatedAt: new Date('2025-01-15T11:30:00Z'),
  tags: ['cinematic', 'landscape', 'sunset'],
};

// Load migration functions (Node.js compatible)
function extractTemporalSegments(yaml) {
  const match = yaml.match(/temporal_progression:\s*\|\s*([\s\S]*?)(?=\n\w+:|$)/);
  if (!match) return [];

  const content = match[1];
  const segments = [];

  const timeRegex = /\[(\d+):(\d+)-(\d+):(\d+)\]\s*([^\[]+)/g;
  let m;
  while ((m = timeRegex.exec(content)) !== null) {
    const startMin = parseInt(m[1]);
    const startSec = parseInt(m[2]);
    const endMin = parseInt(m[3]);
    const endSec = parseInt(m[4]);
    const description = m[5].trim();

    segments.push({
      startTime: startMin * 60 + startSec,
      endTime: endMin * 60 + endSec,
      description,
    });
  }

  return segments;
}

function extractKey(yaml, key) {
  // Try quoted string first
  let match = yaml.match(new RegExp(`${key}:\\s*"([^"]+)"`));
  if (match) return match[1].trim();

  // Try single-quoted string
  match = yaml.match(new RegExp(`${key}:\\s*'([^']+)'`));
  if (match) return match[1].trim();

  // Try multiline block (|)
  match = yaml.match(new RegExp(`${key}:\\s*\\|\\s*([\\s\\S]*?)(?=\\n\\w+:|$)`));
  if (match) return match[1].trim();

  // Try simple value
  match = yaml.match(new RegExp(`${key}:\\s*([^\\n]+)`));
  if (match) return match[1].trim();

  return undefined;
}

function extractVisualDetails(yaml) {
  const visual = {};

  visual.setting = extractKey(yaml, 'scene_setting') || extractKey(yaml, 'context');
  const subjects = extractKey(yaml, 'subjects_and_actions');
  visual.subjects = subjects ? subjects.split(',').map(s => s.trim()) : undefined;
  visual.environment = extractKey(yaml, 'visual_description');
  visual.colors = extractKey(yaml, 'colors') || extractKey(yaml, 'color_palette');
  visual.lighting = extractKey(yaml, 'lighting');
  visual.composition = extractKey(yaml, 'composition');
  visual.style = extractKey(yaml, 'style');

  return visual;
}

function extractAudioDetails(yaml) {
  const audio = {};

  audio.dialogue = extractKey(yaml, 'dialogue');
  audio.ambient = extractKey(yaml, 'ambient') || extractKey(yaml, 'ambient_sounds');
  audio.soundEffects = extractKey(yaml, 'sound_effects') || extractKey(yaml, 'audio_design');
  audio.music = extractKey(yaml, 'music');

  return audio;
}

function extractCameraDetails(yaml) {
  const camera = {};

  camera.movement = extractKey(yaml, 'camera_movement') || extractKey(yaml, 'camera_motion');
  camera.angles = extractKey(yaml, 'camera_angle');
  camera.techniques = extractKey(yaml, 'cinematography');

  return camera;
}

function migratePromptToIntermediate(oldPrompt) {
  const temporalSegments = extractTemporalSegments(oldPrompt.structuredOutput);
  const visualDetails = extractVisualDetails(oldPrompt.structuredOutput);
  const audioDetails = extractAudioDetails(oldPrompt.structuredOutput);
  const cameraDetails = extractCameraDetails(oldPrompt.structuredOutput);

  return {
    id: `migrated_${oldPrompt.id}`,
    version: '1.0.0',
    created: oldPrompt.createdAt,
    modified: oldPrompt.updatedAt || oldPrompt.createdAt,
    title: oldPrompt.name,
    description: `Migrated from prompt: ${oldPrompt.name}`,
    tags: oldPrompt.tags || [],

    sources: {
      text: oldPrompt.input,
      images: [],
      videos: [],
      basePrompts: [],
    },

    structure: {
      temporal: temporalSegments.length > 0 ? {
        totalDuration: 10,
        segments: temporalSegments,
      } : undefined,
      visual: visualDetails,
      audio: audioDetails,
      camera: cameraDetails,
    },

    relationships: {
      parentId: undefined,
      childIds: [],
      mixedFrom: [],
    },
  };
}

// Run test
console.log('🧪 Testing v7 Migration Logic\n');
console.log('Input Prompt:');
console.log(JSON.stringify(mockPrompt, null, 2));
console.log('\n' + '='.repeat(80) + '\n');

const intermediate = migratePromptToIntermediate(mockPrompt);

console.log('Migrated Intermediate:');
console.log(JSON.stringify(intermediate, null, 2));
console.log('\n' + '='.repeat(80) + '\n');

// Validation checks
const checks = {
  'Has ID': !!intermediate.id,
  'ID has migrated_ prefix': intermediate.id.startsWith('migrated_'),
  'Has version': intermediate.version === '1.0.0',
  'Title preserved': intermediate.title === mockPrompt.name,
  'Tags preserved': JSON.stringify(intermediate.tags) === JSON.stringify(mockPrompt.tags),
  'Input text preserved': intermediate.sources.text === mockPrompt.input,
  'Has temporal segments': intermediate.structure.temporal?.segments.length > 0,
  'Temporal segment count': intermediate.structure.temporal?.segments.length === 3,
  'First segment parsed': intermediate.structure.temporal?.segments[0].startTime === 0,
  'Has visual details': Object.keys(intermediate.structure.visual).length > 0,
  'Has audio details': Object.keys(intermediate.structure.audio).length > 0,
  'Has camera details': Object.keys(intermediate.structure.camera).length > 0,
  'Audio soundEffects extracted': !!intermediate.structure.audio.soundEffects,
  'Lighting extracted': !!intermediate.structure.visual.lighting,
  'Style extracted': !!intermediate.structure.visual.style,
};

console.log('Validation Results:');
let passed = 0;
let failed = 0;

for (const [check, result] of Object.entries(checks)) {
  const status = result ? '✅' : '❌';
  console.log(`${status} ${check}`);
  if (result) passed++;
  else failed++;
}

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('✅ All checks passed! Migration logic is working correctly.');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Review the output above.');
  process.exit(1);
}
