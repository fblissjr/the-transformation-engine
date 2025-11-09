/**
 * Mock Data Setup Helpers for Screenshots and Testing
 *
 * Provides utilities to inject realistic app state into IndexedDB
 * for screenshot capture and automated testing.
 *
 * Usage in Playwright:
 * ```javascript
 * import { injectMockData } from './tests/helpers/mock-setup.js';
 *
 * await page.goto('https://localhost:1847');
 * await injectMockData(page, mockDataFixture);
 * await page.reload(); // Reload to pick up injected data
 * ```
 */

/**
 * Inject complete mock data fixture into IndexedDB
 * @param {import('playwright').Page} page - Playwright page object
 * @param {Object} mockData - Mock data fixture (from screenshot-data.json)
 * @returns {Promise<void>}
 */
export async function injectMockData(page, mockData) {
  await page.evaluate(async (data) => {
    const DB_NAME = 'TransformationEngineDB';
    const DB_VERSION = data.dbVersion || 9;

    // Open IndexedDB
    const dbRequest = indexedDB.open(DB_NAME, DB_VERSION);

    await new Promise((resolve, reject) => {
      dbRequest.onerror = () => reject(dbRequest.error);
      dbRequest.onsuccess = () => resolve(dbRequest.result);

      dbRequest.onupgradeneeded = (event) => {
        // If database doesn't exist, create schema
        const db = event.target.result;

        // Create all stores if they don't exist
        const storeNames = [
          'providers',
          'providerKeys',
          'taskAssignments',
          'appSettings',
          'intermediates',
          'prompts',
          'versions',
          'promptConfigs',
          'media',
          'conversations',
          'conversationTurns',
          'tokenUsage'
        ];

        storeNames.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' });

            // Add indexes based on store type
            if (storeName === 'providers') {
              store.createIndex('type', 'type', { unique: false });
              store.createIndex('enabled', 'enabled', { unique: false });
            } else if (storeName === 'providerKeys') {
              store.createIndex('providerId', 'providerId', { unique: false });
            } else if (storeName === 'intermediates') {
              store.createIndex('created', 'created', { unique: false });
              store.createIndex('modified', 'modified', { unique: false });
              store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
              store.createIndex('title', 'title', { unique: false });
            } else if (storeName === 'prompts') {
              store.createIndex('createdAt', 'createdAt', { unique: false });
              store.createIndex('title_lowercase', 'title_lowercase', { unique: false });
            } else if (storeName === 'tokenUsage') {
              store.createIndex('providerId', 'providerId', { unique: false });
              store.createIndex('taskId', 'taskId', { unique: false });
              store.createIndex('timestamp', 'timestamp', { unique: false });
            }
          }
        });
      };
    });

    const db = dbRequest.result;

    // Inject providers
    if (data.providers && data.providers.length > 0) {
      const tx1 = db.transaction(['providers'], 'readwrite');
      for (const provider of data.providers) {
        await tx1.objectStore('providers').put(provider);
      }
      await tx1.complete;
    }

    // Inject provider keys
    if (data.providerKeys && data.providerKeys.length > 0) {
      const tx2 = db.transaction(['providerKeys'], 'readwrite');
      for (const key of data.providerKeys) {
        await tx2.objectStore('providerKeys').put(key);
      }
      await tx2.complete;
    }

    // Inject task assignments
    if (data.taskAssignments && data.taskAssignments.length > 0) {
      const tx3 = db.transaction(['taskAssignments'], 'readwrite');
      for (const task of data.taskAssignments) {
        await tx3.objectStore('taskAssignments').put(task);
      }
      await tx3.complete;
    }

    // Inject app settings
    if (data.appSettings && data.appSettings.length > 0) {
      const tx4 = db.transaction(['appSettings'], 'readwrite');
      for (const settings of data.appSettings) {
        await tx4.objectStore('appSettings').put(settings);
      }
      await tx4.complete;
    }

    // Inject intermediates
    if (data.intermediates && data.intermediates.length > 0) {
      const tx5 = db.transaction(['intermediates'], 'readwrite');
      for (const intermediate of data.intermediates) {
        // Convert date strings to Date objects
        const intermediateWithDates = {
          ...intermediate,
          created: new Date(intermediate.created),
          modified: new Date(intermediate.modified),
        };
        await tx5.objectStore('intermediates').put(intermediateWithDates);
      }
      await tx5.complete;
    }

    // Inject prompts
    if (data.prompts && data.prompts.length > 0) {
      const tx6 = db.transaction(['prompts'], 'readwrite');
      for (const prompt of data.prompts) {
        await tx6.objectStore('prompts').put(prompt);
      }
      await tx6.complete;
    }

    db.close();
    console.log('[Mock Setup] Injected mock data into IndexedDB');
  }, mockData);
}

/**
 * Clear all data from IndexedDB (useful for test cleanup)
 * @param {import('playwright').Page} page - Playwright page object
 * @returns {Promise<void>}
 */
export async function clearIndexedDB(page) {
  await page.evaluate(() => {
    const DB_NAME = 'TransformationEngineDB';

    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME);
      request.onsuccess = () => {
        console.log('[Mock Setup] Cleared IndexedDB');
        resolve();
      };
      request.onerror = () => reject(request.error);
      request.onblocked = () => {
        console.warn('[Mock Setup] Database deletion blocked');
        resolve(); // Still resolve, will retry next time
      };
    });
  });
}

/**
 * Verify that mock data was injected correctly
 * @param {import('playwright').Page} page - Playwright page object
 * @returns {Promise<Object>} Verification results
 */
export async function verifyMockData(page) {
  return await page.evaluate(() => {
    const DB_NAME = 'TransformationEngineDB';
    const DB_VERSION = 9;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = async () => {
        const db = request.result;
        const results = {
          providers: 0,
          providerKeys: 0,
          taskAssignments: 0,
          appSettings: 0,
          intermediates: 0,
          prompts: 0,
        };

        try {
          // Count records in each store
          const storeNames = Object.keys(results);

          for (const storeName of storeNames) {
            if (db.objectStoreNames.contains(storeName)) {
              const tx = db.transaction([storeName], 'readonly');
              const store = tx.objectStore(storeName);
              const countRequest = store.count();

              results[storeName] = await new Promise((res, rej) => {
                countRequest.onsuccess = () => res(countRequest.result);
                countRequest.onerror = () => rej(countRequest.error);
              });
            }
          }

          db.close();
          console.log('[Mock Setup] Verification results:', results);
          resolve(results);
        } catch (error) {
          db.close();
          reject(error);
        }
      };
    });
  });
}

/**
 * Inject only provider configuration (useful for minimal setup)
 * @param {import('playwright').Page} page - Playwright page object
 * @param {Object} providerData - Provider and key data
 * @returns {Promise<void>}
 */
export async function injectProviderConfig(page, providerData) {
  await page.evaluate(async (data) => {
    const DB_NAME = 'TransformationEngineDB';
    const DB_VERSION = 9;

    const dbRequest = indexedDB.open(DB_NAME, DB_VERSION);
    await new Promise((resolve, reject) => {
      dbRequest.onerror = () => reject(dbRequest.error);
      dbRequest.onsuccess = () => resolve(dbRequest.result);
    });

    const db = dbRequest.result;

    // Inject provider
    if (data.provider) {
      const tx1 = db.transaction(['providers'], 'readwrite');
      await tx1.objectStore('providers').put(data.provider);
    }

    // Inject provider key
    if (data.providerKey) {
      const tx2 = db.transaction(['providerKeys'], 'readwrite');
      await tx2.objectStore('providerKeys').put(data.providerKey);
    }

    db.close();
    console.log('[Mock Setup] Injected provider config');
  }, providerData);
}

/**
 * Wait for app to initialize and load mock data
 * @param {import('playwright').Page} page - Playwright page object
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 * @returns {Promise<void>}
 */
export async function waitForAppReady(page, timeout = 5000) {
  await page.waitForFunction(
    () => {
      // Check if React root is mounted
      const root = document.querySelector('#root');
      if (!root || !root.children.length) return false;

      // Check if any loading indicators are present
      const loadingIndicators = document.querySelectorAll('[data-loading="true"]');
      if (loadingIndicators.length > 0) return false;

      return true;
    },
    { timeout }
  );

  // Additional wait for any animations to settle
  await page.waitForTimeout(500);
}

/**
 * Set localStorage values (for non-IndexedDB settings)
 * @param {import('playwright').Page} page - Playwright page object
 * @param {Object} data - Key-value pairs to set in localStorage
 * @returns {Promise<void>}
 */
export async function setLocalStorage(page, data) {
  await page.evaluate((items) => {
    for (const [key, value] of Object.entries(items)) {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
    console.log('[Mock Setup] Set localStorage items');
  }, data);
}

/**
 * Get current IndexedDB state (useful for debugging)
 * @param {import('playwright').Page} page - Playwright page object
 * @returns {Promise<Object>} Current database contents
 */
export async function getIndexedDBState(page) {
  return await page.evaluate(async () => {
    const DB_NAME = 'TransformationEngineDB';
    const DB_VERSION = 9;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = async () => {
        const db = request.result;
        const state = {};

        try {
          const storeNames = Array.from(db.objectStoreNames);

          for (const storeName of storeNames) {
            const tx = db.transaction([storeName], 'readonly');
            const store = tx.objectStore(storeName);
            const getAllRequest = store.getAll();

            state[storeName] = await new Promise((res, rej) => {
              getAllRequest.onsuccess = () => res(getAllRequest.result);
              getAllRequest.onerror = () => rej(getAllRequest.error);
            });
          }

          db.close();
          resolve(state);
        } catch (error) {
          db.close();
          reject(error);
        }
      };
    });
  });
}
