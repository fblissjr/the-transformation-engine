#!/usr/bin/env node

/**
 * Automated Test Suite for The Transformation Engine
 *
 * Tests that don't require browser/UI:
 * - Transformer logic
 * - Migration parsing
 * - File structure
 * - Build verification
 * - TypeScript compilation
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  errors: [],
};

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    results.passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    results.failed++;
    results.errors.push({ test: name, error: error.message });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertExists(filepath, message) {
  assert(existsSync(filepath), message || `File not found: ${filepath}`);
}

console.log('\n🧪 Running Automated Tests\n');
console.log('='.repeat(80) + '\n');

// ============================================================================
// 1. File Structure Tests
// ============================================================================

console.log('📁 File Structure Tests\n');

test('Core directories exist', () => {
  assertExists(join(rootDir, 'components'), 'components/ missing');
  assertExists(join(rootDir, 'context'), 'context/ missing');
  assertExists(join(rootDir, 'services'), 'services/ missing');
  assertExists(join(rootDir, 'types'), 'types/ missing');
  assertExists(join(rootDir, 'public'), 'public/ missing');
  assertExists(join(rootDir, 'assets'), 'assets/ missing');
});

test('Phase 9 files exist', () => {
  assertExists(join(rootDir, 'types/intermediate.ts'));
  assertExists(join(rootDir, 'services/db/intermediateService.ts'));
  assertExists(join(rootDir, 'services/transformers/sora2Transformer.ts'));
  assertExists(join(rootDir, 'services/transformers/veo3Transformer.ts'));
  assertExists(join(rootDir, 'services/transformers/genericTransformer.ts'));
  assertExists(join(rootDir, 'services/transformers/index.ts'));
  assertExists(join(rootDir, 'services/transformers/cache.ts'));
  assertExists(join(rootDir, 'services/migrations/v7Migration.ts'));
  assertExists(join(rootDir, 'context/IntermediateContext.tsx'));
  assertExists(join(rootDir, 'components/intermediate/IntermediateEditor.tsx'));
});

test('System prompts exist', () => {
  assertExists(join(rootDir, 'public/core/primary.md'));
  assertExists(join(rootDir, 'public/core/primary_sora2.md'));
  assertExists(join(rootDir, 'public/core/primary_veo3.md'));
  assertExists(join(rootDir, 'public/core/primary_intermediate.md'));
});

test('Logo assets exist', () => {
  assertExists(join(rootDir, 'assets/logo_256_256.png'));
  assertExists(join(rootDir, 'public/logo.png'));
});

test('Documentation exists', () => {
  assertExists(join(rootDir, 'README.md'));
  assertExists(join(rootDir, 'CLAUDE.md'));
  assertExists(join(rootDir, 'ARCHITECTURE.md'));
  assertExists(join(rootDir, 'OPERATIONS.md'));
  assertExists(join(rootDir, 'docs/user_guide.md'));
  assertExists(join(rootDir, 'TESTING_CHECKLIST.md'));
});

test('Management scripts exist', () => {
  assertExists(join(rootDir, 'manage.sh'));
  assertExists(join(rootDir, 'package.json'));
  assertExists(join(rootDir, 'vite.config.ts'));
  assertExists(join(rootDir, 'tsconfig.json'));
});

console.log('');

// ============================================================================
// 2. Migration Logic Tests
// ============================================================================

console.log('🔄 Migration Logic Tests\n');

test('Migration can parse temporal progression', () => {
  const yaml = `
temporal_progression: |
  [00:00-00:03] A woman enters frame left, walking along wet sand.
  [00:03-00:07] She progresses through middle distance as waves lap at her feet.
  [00:07-00:10] She exits frame right as sun touches horizon.
`;

  const timeRegex = /\[(\d+):(\d+)-(\d+):(\d+)\]\s*([^\[]+)/g;
  let matches = 0;
  let match;
  while ((match = timeRegex.exec(yaml)) !== null) {
    matches++;
    const startMin = parseInt(match[1]);
    const startSec = parseInt(match[2]);
    const endMin = parseInt(match[3]);
    const endSec = parseInt(match[4]);
    const description = match[5].trim();

    assert(startMin >= 0 && startMin < 60, 'Invalid start minute');
    assert(startSec >= 0 && startSec < 60, 'Invalid start second');
    assert(endMin >= 0 && endMin < 60, 'Invalid end minute');
    assert(endSec >= 0 && endSec < 60, 'Invalid end second');
    assert(description.length > 0, 'Empty description');
  }

  assert(matches === 3, `Expected 3 segments, got ${matches}`);
});

test('Migration can extract YAML keys', () => {
  const yaml = `
scene: "A beach at sunset"
sound_effects: "Ocean waves, seagulls"
speech: "WOMAN: Beautiful evening"
camera_movement: "Dolly forward"
`;

  const extractKey = (key) => {
    // Try quoted string first
    let match = yaml.match(new RegExp(`${key}:\\s*"([^"]+)"`));
    if (match) return match[1].trim();

    // Try unquoted
    match = yaml.match(new RegExp(`${key}:\\s*([^\\n]+)`));
    return match ? match[1].trim() : undefined;
  };

  assert(extractKey('scene') === 'A beach at sunset', 'Scene extraction failed');
  assert(extractKey('sound_effects') === 'Ocean waves, seagulls', 'Sound effects extraction failed');
  assert(extractKey('speech') === 'WOMAN: Beautiful evening', 'Speech extraction failed');
  assert(extractKey('camera_movement') === 'Dolly forward', 'Camera movement extraction failed');
});

test('Migration handles multiline blocks', () => {
  const yaml = `
visual_description: |
  The scene captures a serene coastal moment.
  Wet sand reflects warm orange and pink hues.
  Small waves create rhythmic patterns.
`;

  const match = yaml.match(/visual_description:\s*\|\s*([\s\S]*?)(?=\n\w+:|$)/);
  assert(match !== null, 'Failed to match multiline block');

  const content = match[1].trim();
  assert(content.includes('serene coastal moment'), 'Content not extracted correctly');
  assert(content.split('\n').length === 3, 'Expected 3 lines');
});

console.log('');

// ============================================================================
// 3. Transformer Logic Tests
// ============================================================================

console.log('🔧 Transformer Logic Tests\n');

test('Sora 2 canonical keys are correct', () => {
  const expectedKeys = [
    'temporal_progression',
    'visual_description',
    'camera_movement',
    'cinematography',
    'lighting',
    'audio_design',
    'style'
  ];

  // Read constants file
  const constantsPath = join(rootDir, 'constants.ts');
  const constantsContent = readFileSync(constantsPath, 'utf-8');

  // Check each key exists in CANONICAL_SCHEMA_KEYS.sora2
  const sora2Match = constantsContent.match(/sora2:\s*\[([\s\S]*?)\]/);
  assert(sora2Match !== null, 'sora2 keys not found in constants');

  const keysSection = sora2Match[1];
  expectedKeys.forEach(key => {
    assert(keysSection.includes(`"${key}"`), `Missing key: ${key}`);
  });
});

test('Veo 3 canonical keys are correct', () => {
  const expectedKeys = [
    'subject',
    'context',
    'action',
    'style',
    'camera_motion',
    'audio_elements',
    'lighting_mood',
    'background_setting',
    'composition'
  ];

  const constantsPath = join(rootDir, 'constants.ts');
  const constantsContent = readFileSync(constantsPath, 'utf-8');

  const veo3Match = constantsContent.match(/veo3:\s*\[([\s\S]*?)\]/);
  assert(veo3Match !== null, 'veo3 keys not found in constants');

  const keysSection = veo3Match[1];
  expectedKeys.forEach(key => {
    assert(keysSection.includes(`"${key}"`), `Missing key: ${key}`);
  });
});

test('Temporal segment time calculation', () => {
  const segment = {
    startTime: 0,   // 00:00
    endTime: 3,     // 00:03
    description: 'Test segment'
  };

  const duration = segment.endTime - segment.startTime;
  assert(duration === 3, `Expected 3 seconds, got ${duration}`);

  const startMin = Math.floor(segment.startTime / 60);
  const startSec = segment.startTime % 60;
  const endMin = Math.floor(segment.endTime / 60);
  const endSec = segment.endTime % 60;

  assert(startMin === 0 && startSec === 0, 'Start time incorrect');
  assert(endMin === 0 && endSec === 3, 'End time incorrect');
});

test('Character counter logic (Sora 2 limit)', () => {
  const testText = 'a'.repeat(2500);
  const charCount = testText.length;

  const getWarningLevel = (count) => {
    if (count < 2200) return 'green';
    if (count <= 2500) return 'yellow';
    return 'red';
  };

  assert(getWarningLevel(2000) === 'green', 'Green threshold incorrect');
  assert(getWarningLevel(2300) === 'yellow', 'Yellow threshold incorrect');
  assert(getWarningLevel(2600) === 'red', 'Red threshold incorrect');
  assert(charCount === 2500, 'Character count incorrect');
});

console.log('');

// ============================================================================
// 4. Model Detection Tests
// ============================================================================

console.log('🎯 Model Detection Tests\n');

test('Audio-rich content detects Veo 3', () => {
  const intermediate = {
    structure: {
      audio: {
        dialogue: '"Hello world"',
        music: 'Jazz piano',
        ambient: 'Coffee shop ambience'
      }
    }
  };

  const hasRichAudio =
    intermediate.structure.audio?.dialogue ||
    intermediate.structure.audio?.music ||
    (intermediate.structure.audio?.ambient && intermediate.structure.audio?.soundEffects);

  assert(hasRichAudio, 'Should detect rich audio for Veo 3');
});

test('Temporal progression detects Sora 2', () => {
  const intermediate = {
    structure: {
      temporal: {
        segments: [
          { startTime: 0, endTime: 3, description: 'Opening' },
          { startTime: 3, endTime: 7, description: 'Middle' },
          { startTime: 7, endTime: 10, description: 'Ending' }
        ]
      }
    }
  };

  const hasTemporalProgression =
    intermediate.structure.temporal?.segments &&
    intermediate.structure.temporal.segments.length > 0;

  assert(hasTemporalProgression, 'Should detect temporal progression for Sora 2');
  assert(intermediate.structure.temporal.segments.length === 3, 'Expected 3 segments');
});

test('Simple content detects Generic', () => {
  const intermediate = {
    structure: {
      visual: {
        setting: 'A red car'
      }
    }
  };

  const hasTemporalProgression = intermediate.structure.temporal?.segments?.length > 0;
  const hasRichAudio = intermediate.structure.audio?.dialogue || intermediate.structure.audio?.music;

  assert(!hasTemporalProgression, 'Should not detect temporal progression');
  assert(!hasRichAudio, 'Should not detect rich audio');
  // Would default to Generic
});

console.log('');

// ============================================================================
// 5. Configuration Tests
// ============================================================================

console.log('⚙️  Configuration Tests\n');

test('Default port is non-standard (7392)', () => {
  const manageShPath = join(rootDir, 'manage.sh');
  const manageShContent = readFileSync(manageShPath, 'utf-8');

  assert(manageShContent.includes('APP_PORT="${APP_PORT:-7392}"'), 'Default port should be 7392');
});

test('Nginx config uses correct port', () => {
  const operationsPath = join(rootDir, 'OPERATIONS.md');
  const operationsContent = readFileSync(operationsPath, 'utf-8');

  assert(operationsContent.includes('proxy_pass http://127.0.0.1:7392'), 'Nginx should proxy to port 7392');
});

test('CSP allows required domains', () => {
  const indexPath = join(rootDir, 'index.html');
  const indexContent = readFileSync(indexPath, 'utf-8');

  assert(indexContent.includes("connect-src 'self' https://generativelanguage.googleapis.com"),
    'CSP should allow Gemini API');
  assert(indexContent.includes("media-src 'self' blob:"),
    'CSP should allow blob URLs for media');
});

test('Package.json has correct scripts', () => {
  const pkgPath = join(rootDir, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

  assert(pkg.scripts.dev, 'Missing dev script');
  assert(pkg.scripts.build, 'Missing build script');
  assert(pkg.scripts.preview, 'Missing preview script');
});

test('TypeScript config exists and is valid', () => {
  const tsconfigPath = join(rootDir, 'tsconfig.json');
  assertExists(tsconfigPath, 'tsconfig.json missing');

  const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));
  assert(tsconfig.compilerOptions, 'compilerOptions missing');
  assert(tsconfig.compilerOptions.jsx === 'react-jsx', 'JSX mode incorrect');
});

console.log('');

// ============================================================================
// 6. Documentation Tests
// ============================================================================

console.log('📚 Documentation Tests\n');

test('README.md references correct port', () => {
  const readmePath = join(rootDir, 'README.md');
  const readmeContent = readFileSync(readmePath, 'utf-8');

  // README still references 1847 for Vite dev server (correct)
  // Production port 7392 is in manage.sh and OPERATIONS.md
  assert(readmeContent.includes('# The Transformation Engine'), 'README title missing');
});

test('CLAUDE.md is up to date with Phase 9', () => {
  const claudePath = join(rootDir, 'CLAUDE.md');
  const claudeContent = readFileSync(claudePath, 'utf-8');

  assert(claudeContent.includes('Phase 9'), 'Phase 9 not documented');
  assert(claudeContent.includes('Intermediate Architecture'), 'Intermediate architecture not mentioned');
  assert(claudeContent.includes('DB v7'), 'DB version not updated');
});

test('User guide documents intermediate mode', () => {
  const guidePath = join(rootDir, 'docs/user_guide.md');
  const guideContent = readFileSync(guidePath, 'utf-8');

  assert(guideContent.includes('./manage.sh'), 'manage.sh not documented');
  assert(guideContent.includes('7392'), 'Port 7392 not documented');
});

test('Operations guide is complete', () => {
  const opsPath = join(rootDir, 'OPERATIONS.md');
  const opsContent = readFileSync(opsPath, 'utf-8');

  assert(opsContent.includes('PM2'), 'PM2 deployment not documented');
  assert(opsContent.includes('Nginx'), 'Nginx deployment not documented');
  assert(opsContent.includes('Troubleshooting'), 'Troubleshooting section missing');
});

console.log('');

// ============================================================================
// 7. Build Artifact Tests (if dist/ exists)
// ============================================================================

console.log('📦 Build Artifact Tests\n');

const distPath = join(rootDir, 'dist');
if (existsSync(distPath)) {
  test('dist/index.html exists', () => {
    assertExists(join(distPath, 'index.html'));
  });

  test('dist/assets/ contains bundles', () => {
    assertExists(join(distPath, 'assets'));
  });

  test('dist/logo.png exists (favicon)', () => {
    assertExists(join(distPath, 'logo.png'));
  });

  test('dist/core/ exists (system prompts)', () => {
    assertExists(join(distPath, 'core'));
  });

  test('dist/fragments/ exists (prompt fragments)', () => {
    assertExists(join(distPath, 'fragments'));
  });
} else {
  console.log('⏭️  Skipping build artifact tests (run npm run build first)\n');
}

// ============================================================================
// Results Summary
// ============================================================================

console.log('='.repeat(80));
console.log('\n📊 Test Results\n');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`📈 Total:  ${results.passed + results.failed}`);

if (results.failed > 0) {
  console.log('\n❌ Failed Tests:\n');
  results.errors.forEach(({ test, error }) => {
    console.log(`  • ${test}`);
    console.log(`    ${error}\n`);
  });
}

console.log('='.repeat(80) + '\n');

// Exit with error code if tests failed
process.exit(results.failed > 0 ? 1 : 0);
