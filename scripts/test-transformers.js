// Test script for Phase 9.2 transformers
// Run with: node scripts/test-transformers.js

/**
 * Mock IntermediatePrompt with all structures populated for testing.
 */
const mockIntermediate = {
  id: 'test-intermediate-001',
  version: '1.0.0',
  created: new Date('2025-10-12'),
  modified: new Date('2025-10-12'),
  title: 'Test Transformation',
  description: 'Testing transformer system',
  tags: ['test', 'sora2', 'veo3'],
  
  sources: {
    text: 'A serene beach scene at sunset with a person walking along the shore',
  },
  
  structure: {
    temporal: {
      totalDuration: 10,
      segments: [
        {
          startTime: 0,
          endTime: 3,
          description: 'A silhouetted figure enters frame left, walking along wet sand',
          camera: 'Wide establishing shot',
          visual: 'Backlit by setting sun',
          audio: 'Gentle waves lapping'
        },
        {
          startTime: 3,
          endTime: 7,
          description: 'Subject progresses through middle distance as waves lap at feet',
          camera: 'Smooth dolly forward',
          visual: 'Golden hour sunlight glints off water',
          audio: 'Continuous ocean sounds'
        },
        {
          startTime: 7,
          endTime: 10,
          description: 'Figure exits frame right as sun touches horizon',
          camera: 'Static wide shot',
          visual: 'Final rays illuminate spray from larger wave',
          audio: 'Wave crescendo'
        }
      ]
    },
    
    visual: {
      setting: 'Serene coastal beach during golden hour',
      subjects: ['Silhouetted figure in casual clothing walking along the shore'],
      environment: 'Wet sand reflecting warm orange and pink sunset hues, small waves creating rhythmic patterns',
      colors: 'Warm orange, pink, and golden tones from sunset sky',
      lighting: 'Natural golden hour lighting from low sun, warm color temperature (3500K), rim lighting on subject',
      composition: '16:9 widescreen, subject in left third, horizon at upper third, open negative space showing destination',
      style: 'Cinematic naturalism with emphasis on color and light'
    },
    
    audio: {
      dialogue: 'I have thought about this moment for three years',
      ambient: 'Gentle ocean waves with rhythmic ebb and flow',
      soundEffects: 'Soft water lapping at shore, footsteps on wet sand',
      music: 'Peaceful ambient soundscape'
    },
    
    camera: {
      movement: 'Smooth dolly forward at 0.3 meters/second from wide shot to medium shot',
      angles: 'Eye level at 1.5 meters for relatable perspective',
      techniques: '35mm lens equivalent, f/2.8 aperture for shallow depth of field'
    },
    
    narrative: {
      beginning: 'A lone figure appears on an empty beach at sunset',
      middle: 'They walk contemplatively along the shore as waves wash away their footprints',
      end: 'The figure disappears into the golden light, leaving only memories in the sand',
      arc: 'A meditation on impermanence and beauty'
    }
  },
  
  relationships: {
    parentId: null,
    childIds: [],
    mixedFrom: [],
    branchName: 'main'
  }
};

console.log('=== Phase 9.2 Transformer Test ===\n');

// Import transformers
let sora2Transformer, veo3Transformer, genericTransformer, transformToModel, validateForModel;
try {
  const transformers = await import('../services/transformers/index.ts');
  sora2Transformer = transformers.sora2Transformer;
  veo3Transformer = transformers.veo3Transformer;
  genericTransformer = transformers.genericTransformer;
  transformToModel = transformers.transformToModel;
  validateForModel = transformers.validateForModel;
} catch (error) {
  console.error('ERROR: Failed to import transformers:', error.message);
  process.exit(1);
}

// Test 1: Sora 2 Transformer
console.log('TEST 1: Sora 2 Transformer');
console.log('----------------------------');
try {
  const sora2Output = sora2Transformer.transform(mockIntermediate);
  
  // Validation checks
  const checks = {
    hasTemporalProgression: sora2Output.includes('temporal_progression:'),
    hasVisualDescription: sora2Output.includes('visual_description:'),
    hasCameraMovement: sora2Output.includes('camera_movement:'),
    hasCinematography: sora2Output.includes('cinematography:'),
    hasLighting: sora2Output.includes('lighting:'),
    hasAudioDesign: sora2Output.includes('audio_design:'),
    hasStyle: sora2Output.includes('style:'),
    hasTimestamps: sora2Output.includes('[00:00-00:03]') && sora2Output.includes('[00:03-00:07]'),
    underCharLimit: sora2Output.length <= 2500,
  };
  
  const allChecksPassed = Object.values(checks).every(v => v === true);
  
  console.log(`\nValidation Results:`);
  console.log(`  - All 7 canonical keys present: ${checks.hasTemporalProgression && checks.hasVisualDescription && checks.hasCameraMovement && checks.hasCinematography && checks.hasLighting && checks.hasAudioDesign && checks.hasStyle ? 'PASS' : 'FAIL'}`);
  console.log(`  - Timestamp format [HH:MM-HH:MM]: ${checks.hasTimestamps ? 'PASS' : 'FAIL'}`);
  console.log(`  - Character count (${sora2Output.length} chars): ${checks.underCharLimit ? 'PASS' : 'FAIL'} (limit: 2500)`);
  console.log(`\nOverall: ${allChecksPassed ? 'PASS' : 'FAIL'}`);
  
  if (!allChecksPassed) {
    console.log(`\nMissing checks:`, Object.entries(checks).filter(([k, v]) => !v).map(([k]) => k));
  }
  
  console.log(`\nSample Output (first 500 chars):\n${sora2Output.substring(0, 500)}...\n`);
} catch (error) {
  console.log('FAIL:', error.message);
}

// Test 2: Veo 3 Transformer
console.log('\nTEST 2: Veo 3 Transformer');
console.log('----------------------------');
try {
  const veo3Output = veo3Transformer.transform(mockIntermediate);
  
  // Count words (rough estimate)
  const wordCount = veo3Output.split(/\s+/).length;
  
  // Validation checks
  const checks = {
    hasSubject: veo3Output.includes('subject:'),
    hasContext: veo3Output.includes('context:'),
    hasAction: veo3Output.includes('action:'),
    hasStyle: veo3Output.includes('style:'),
    hasCameraMotion: veo3Output.includes('camera_motion:'),
    hasAudioElements: veo3Output.includes('audio_elements:'),
    hasLightingMood: veo3Output.includes('lighting_mood:'),
    hasBackgroundSetting: veo3Output.includes('background_setting:'),
    hasComposition: veo3Output.includes('composition:'),
    audioNotWarning: !veo3Output.includes('WARNING: Audio required'),
    wordCountInRange: wordCount >= 200 && wordCount <= 400,
  };
  
  const allChecksPassed = Object.values(checks).every(v => v === true);
  
  console.log(`\nValidation Results:`);
  console.log(`  - All 9 canonical keys present: ${checks.hasSubject && checks.hasContext && checks.hasAction && checks.hasStyle && checks.hasCameraMotion && checks.hasAudioElements && checks.hasLightingMood && checks.hasBackgroundSetting && checks.hasComposition ? 'PASS' : 'FAIL'}`);
  console.log(`  - Audio elements present (not warning): ${checks.audioNotWarning ? 'PASS' : 'FAIL'}`);
  console.log(`  - Word count (${wordCount} words): ${checks.wordCountInRange ? 'PASS' : 'FAIL'} (optimal: 200-400)`);
  console.log(`\nOverall: ${allChecksPassed ? 'PASS' : 'FAIL'}`);
  
  if (!allChecksPassed) {
    console.log(`\nMissing checks:`, Object.entries(checks).filter(([k, v]) => !v).map(([k]) => k));
  }
  
  console.log(`\nSample Output (first 500 chars):\n${veo3Output.substring(0, 500)}...\n`);
} catch (error) {
  console.log('FAIL:', error.message);
}

// Test 3: Generic Transformer
console.log('\nTEST 3: Generic Transformer');
console.log('----------------------------');
try {
  const genericOutput = genericTransformer.transform(mockIntermediate);
  
  const checks = {
    hasScene: genericOutput.includes('scene:'),
    hasVisuals: genericOutput.includes('visuals:'),
    hasAudio: genericOutput.includes('audio:'),
    hasCamera: genericOutput.includes('camera:'),
    hasTimeline: genericOutput.includes('timeline:'),
  };
  
  const allChecksPassed = Object.values(checks).every(v => v === true);
  
  console.log(`\nValidation Results:`);
  console.log(`  - All generic keys present: ${allChecksPassed ? 'PASS' : 'FAIL'}`);
  console.log(`\nSample Output (first 400 chars):\n${genericOutput.substring(0, 400)}...\n`);
} catch (error) {
  console.log('FAIL:', error.message);
}

// Test 4: Cache Behavior
console.log('\nTEST 4: Cache Behavior');
console.log('----------------------------');
try {
  const { transformerCache } = await import('../services/transformers/cache.ts');
  
  // First transform (should be cache miss)
  const output1 = sora2Transformer.transform(mockIntermediate);
  transformerCache.set(mockIntermediate, 'sora2', output1);
  
  const stats1 = transformerCache.getStats();
  
  // Second transform (should be cache hit)
  const cached = transformerCache.get(mockIntermediate, 'sora2');
  const stats2 = transformerCache.getStats();
  
  console.log(`\nCache Statistics:`);
  console.log(`  - Initial stats: ${JSON.stringify(stats1)}`);
  console.log(`  - After cache hit: ${JSON.stringify(stats2)}`);
  console.log(`  - Cache hit successful: ${cached !== null && cached === output1 ? 'PASS' : 'FAIL'}`);
  console.log(`  - Hit count increased: ${stats2.hits > stats1.hits ? 'PASS' : 'FAIL'}`);
  
  // Test invalidation (modify timestamp)
  const modifiedIntermediate = {
    ...mockIntermediate,
    modified: new Date('2025-10-13'), // Different timestamp
  };
  const cachedAfterModification = transformerCache.get(modifiedIntermediate, 'sora2');
  
  console.log(`  - Cache invalidation on timestamp change: ${cachedAfterModification === null ? 'PASS' : 'FAIL'}`);
  
  console.log(`\nCache test: PASS`);
} catch (error) {
  console.log('FAIL:', error.message);
}

console.log('\n=== All Tests Complete ===\n');
