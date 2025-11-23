/**
 * Integration test for Multi-Provider Architecture (Phase 10)
 *
 * Tests the complete flow from provider registration → task assignment → generation
 */

import { providerService } from '../services/providerService';
import { taskAssignmentService } from '../services/taskAssignmentService';
import { taskRouter } from '../services/taskRouter';
import { TASK_IDS } from '../types/providers';
import { GeminiProvider } from '../services/providers/geminiProvider';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

const results: TestResult[] = [];

/**
 * Logs the result of a test case.
 * @param name - The name of the test case.
 * @param passed - Whether the test passed or failed.
 * @param error - Optional error message if the test failed.
 * @param duration - Optional duration of the test in milliseconds.
 */
function logTest(name: string, passed: boolean, error?: string, duration?: number) {
  results.push({ name, passed, error, duration });
  const status = passed ? '✓' : '✗';
  const durationStr = duration ? ` (${duration}ms)` : '';
  console.log(`${status} ${name}${durationStr}`);
  if (error) {
    console.error(`  Error: ${error}`);
  }
}

/**
 * Test 1: Verifies that a provider can be created successfully.
 * @returns A Promise resolving to the created provider ID.
 */
async function test1_ProviderCreation() {
  const start = Date.now();
  try {
    // Create a test Gemini provider
    const provider = await providerService.addProvider(
      'Test Gemini',
      'gemini',
      'https://generativelanguage.googleapis.com/v1beta'
    );

    if (!provider.id || provider.name !== 'Test Gemini') {
      throw new Error('Provider creation returned invalid data');
    }

    logTest('Provider Creation', true, undefined, Date.now() - start);
    return provider.id;
  } catch (e: any) {
    logTest('Provider Creation', false, e.message);
    throw e;
  }
}

/**
 * Test 2: Verifies that an API key can be stored and retrieved for a provider.
 * @param providerId - The ID of the provider to test.
 */
async function test2_ApiKeyStorage(providerId: string) {
  const start = Date.now();
  try {
    // Use a fake API key for testing (won't actually call API)
    const testKey = 'test_key_' + Math.random().toString(36).substring(7);

    await providerService.addProviderKey(providerId, testKey, 'Test Key');

    // Verify key was stored
    const retrievedKey = await providerService.getFirstValidKey(providerId);

    if (!retrievedKey) {
      throw new Error('API key was not stored or retrieved correctly');
    }

    logTest('API Key Storage', true, undefined, Date.now() - start);
  } catch (e: any) {
    logTest('API Key Storage', false, e.message);
    throw e;
  }
}

/**
 * Test 3: Verifies that tasks can be assigned to a provider.
 * @param providerId - The ID of the provider to assign tasks to.
 */
async function test3_TaskAssignment(providerId: string) {
  const start = Date.now();
  try {
    // Set global default
    await taskAssignmentService.setGlobalDefault(providerId, 'gemini-2.0-flash-exp');

    // Verify it was set
    const globalDefault = await taskAssignmentService.getGlobalDefault();

    if (!globalDefault || globalDefault.providerId !== providerId) {
      throw new Error('Global default was not set correctly');
    }

    // Create per-task assignment
    await taskAssignmentService.setTaskAssignment({
      taskId: TASK_IDS.PRIMARY_GENERATION,
      providerId,
      modelId: 'gemini-2.0-flash-exp',
      enableRewrite: false,
      enableStreaming: false,
      temperature: 1.0,
      maxTokens: 2048,
      topP: 0.95,
      updatedAt: Date.now(),
    });

    const assignment = await taskAssignmentService.getOrCreateAssignment(TASK_IDS.PRIMARY_GENERATION);

    if (assignment.providerId !== providerId) {
      throw new Error('Task assignment was not created correctly');
    }

    logTest('Task Assignment', true, undefined, Date.now() - start);
  } catch (e: any) {
    logTest('Task Assignment', false, e.message);
    throw e;
  }
}

/**
 * Test 4: Verifies the provider registration flow.
 * Note: This is expected to fail with "No valid API key" since we use a fake key.
 * @param providerId - The ID of the provider to test registration for.
 */
async function test4_ProviderRegistration(providerId: string) {
  const start = Date.now();
  try {
    // This will fail without a real API key, but tests the registration flow
    try {
      const { ProviderRegistry } = await import('../services/providerRegistry');
      const registry = new ProviderRegistry();

      // This should throw because we don't have a valid API key
      await registry.getProvider(providerId);

      // If we get here, something is wrong (should have thrown)
      throw new Error('Provider registry should have thrown without valid API key');
    } catch (e: any) {
      if (e.message.includes('No valid API key')) {
        // Expected error - system is working correctly
        logTest('Provider Registration', true, undefined, Date.now() - start);
        return;
      }
      throw e;
    }
  } catch (e: any) {
    logTest('Provider Registration', false, e.message);
  }
}

/**
 * Test 5: Verifies that the GeminiProvider class correctly implements the IProvider interface.
 */
async function test5_GeminiProviderInterface() {
  const start = Date.now();
  try {
    // Test that GeminiProvider implements IProvider correctly
    const provider = new GeminiProvider(
      'test-id',
      'Test Provider',
      'fake-key'
    );

    // Check readonly properties
    if (provider.id !== 'test-id') throw new Error('id property incorrect');
    if (provider.name !== 'Test Provider') throw new Error('name property incorrect');
    if (provider.type !== 'gemini') throw new Error('type property incorrect');
    if (!provider.supportsVision) throw new Error('supportsVision should be true');
    if (!provider.supportsStreaming) throw new Error('supportsStreaming should be true');

    // Check methods exist
    if (typeof provider.listModels !== 'function') throw new Error('listModels missing');
    if (typeof provider.generate !== 'function') throw new Error('generate missing');
    if (typeof provider.generateStream !== 'function') throw new Error('generateStream missing');

    logTest('GeminiProvider Interface', true, undefined, Date.now() - start);
  } catch (e: any) {
    logTest('GeminiProvider Interface', false, e.message);
  }
}

/**
 * Test 6: Verifies that the database schema contains all required object stores.
 */
async function test6_DatabaseSchema() {
  const start = Date.now();
  try {
    // Verify DB schema is correct
    const { openDB } = await import('idb');
    const db = await openDB('TransformationEngineDB', 8); // Should be v8 after Phase 10

    const storeNames = Array.from(db.objectStoreNames);

    const requiredStores = [
      'prompts',
      'intermediates',
      'versions',
      'promptConfigs',
      'appSettings',
      'media',
      'providers',
      'providerKeys',
      'taskAssignments',
      'conversations',
      'conversationTurns',
      'tokenUsage',
    ];

    const missing = requiredStores.filter(name => !storeNames.includes(name));

    if (missing.length > 0) {
      throw new Error(`Missing stores: ${missing.join(', ')}`);
    }

    db.close();

    logTest('Database Schema', true, undefined, Date.now() - start);
  } catch (e: any) {
    logTest('Database Schema', false, e.message);
  }
}

/**
 * Cleans up test data by deleting the test provider.
 */
async function cleanup() {
  try {
    // Clean up test data
    const providers = await providerService.getAllProviders();
    for (const provider of providers) {
      if (provider.name.includes('Test')) {
        await providerService.deleteProvider(provider.id);
      }
    }
  } catch (e) {
    console.warn('Cleanup failed:', e);
  }
}

// Run tests
async function runTests() {
  console.log('\n=== Multi-Provider Architecture Integration Tests ===\n');

  let providerId: string | undefined;

  try {
    // Run tests in sequence
    providerId = await test1_ProviderCreation();
    await test2_ApiKeyStorage(providerId);
    await test3_TaskAssignment(providerId);
    await test4_ProviderRegistration(providerId);
    await test5_GeminiProviderInterface();
    await test6_DatabaseSchema();
  } catch (e) {
    console.error('\nTest suite aborted due to critical failure\n');
  }

  // Cleanup
  await cleanup();

  // Summary
  console.log('\n=== Test Summary ===\n');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Passed: ${passed}/${total}`);
  console.log(`Failed: ${failed}/${total}`);

  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n✓ All tests passed!');
    process.exit(0);
  }
}

runTests();
