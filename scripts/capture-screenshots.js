#!/usr/bin/env node

/**
 * Automated Screenshot Capture for The Transformation Engine
 *
 * Captures screenshots with realistic mock data injected into IndexedDB.
 * This ensures screenshots show a fully functional app state without
 * requiring real API keys or network calls.
 *
 * Usage:
 *   npm run screenshots           # Capture all screenshots
 *   npm run screenshots:desktop   # Desktop only
 *   npm run screenshots:mobile    # Mobile only
 *   npm run screenshots:clean     # Clear mock data and recapture
 */

import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { injectMockData, waitForAppReady, verifyMockData, clearIndexedDB } from '../tests/helpers/mock-setup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const assetsDir = join(rootDir, 'assets');
const mockDataPath = join(rootDir, 'tests', 'fixtures', 'screenshot-data.json');

// Ensure assets directory exists
if (!existsSync(assetsDir)) {
  mkdirSync(assetsDir, { recursive: true });
}

// Load mock data fixture
let mockData;
try {
  const mockDataContent = readFileSync(mockDataPath, 'utf-8');
  mockData = JSON.parse(mockDataContent);
  console.log('Loaded mock data fixture from:', mockDataPath);
} catch (error) {
  console.error('Failed to load mock data fixture:', error.message);
  console.error('Please ensure tests/fixtures/screenshot-data.json exists');
  process.exit(1);
}

// Viewport configurations
const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 390, height: 844 }, // iPhone 14 Pro
};

// Screenshot definitions
const SCREENSHOTS = [
  {
    name: 'main-interface',
    title: 'Main Interface',
    url: 'https://localhost:1847',
    actions: async (page) => {
      // Wait for app to fully initialize with mock data
      await waitForAppReady(page, 10000);

      // Give UI time to settle and render intermediates
      await page.waitForTimeout(1500);
    },
    desktop: true,
    mobile: true,
  },
  {
    name: 'intermediate-refinement',
    title: 'Intermediate Refinement Panel',
    url: 'https://localhost:1847',
    actions: async (page) => {
      await waitForAppReady(page);

      // Click on first intermediate to open refinement panel
      const firstIntermediate = await page.$('[data-intermediate-id]').catch(() => null);
      if (firstIntermediate) {
        await firstIntermediate.click();
        await page.waitForTimeout(800);
      }
    },
    desktop: true,
    mobile: true,
  },
  {
    name: 'prompt-preview',
    title: 'Prompt Preview & Transparency',
    url: 'https://localhost:1847',
    actions: async (page) => {
      await waitForAppReady(page);

      // Click on an intermediate to select it
      const intermediate = await page.$('[data-intermediate-id]').catch(() => null);
      if (intermediate) {
        await intermediate.click();
        await page.waitForTimeout(500);
      }

      // Try to expand preview prompt section if it exists
      const previewButton = await page.$('button:has-text("Preview")').catch(() => null);
      if (previewButton) {
        await previewButton.click();
        await page.waitForTimeout(500);
      }
    },
    desktop: true,
    mobile: false,
  },
  {
    name: 'settings-providers',
    title: 'Settings: Providers Tab',
    url: 'https://localhost:1847',
    actions: async (page) => {
      await waitForAppReady(page);

      // Open settings dialog/modal
      const settingsButton = await page.$('button[aria-label="Settings"]').catch(() => null);
      if (settingsButton) {
        await settingsButton.click();
        await page.waitForTimeout(500);

        // Click Providers tab if exists
        const providersTab = await page.$('button:has-text("Providers")').catch(() => null);
        if (providersTab) {
          await providersTab.click();
          await page.waitForTimeout(500);
        }
      }
    },
    desktop: true,
    mobile: true,
  },
  {
    name: 'settings-model-selection',
    title: 'Settings: Model Selection',
    url: 'https://localhost:1847',
    actions: async (page) => {
      await waitForAppReady(page);

      const settingsButton = await page.$('button[aria-label="Settings"]').catch(() => null);
      if (settingsButton) {
        await settingsButton.click();
        await page.waitForTimeout(500);

        // Click Model Selection tab if exists
        const modelTab = await page.$('button:has-text("Model")').catch(() => null);
        if (modelTab) {
          await modelTab.click();
          await page.waitForTimeout(500);
        }
      }
    },
    desktop: true,
    mobile: false,
  },
  {
    name: 'privacy-dashboard',
    title: 'Privacy Dashboard',
    url: 'https://localhost:1847',
    actions: async (page) => {
      await waitForAppReady(page);

      // Click privacy dashboard button if exists
      const privacyButton = await page.$('button[aria-label="Privacy"]').catch(() => null);
      if (privacyButton) {
        await privacyButton.click();
        await page.waitForTimeout(800);
      }
    },
    desktop: true,
    mobile: false,
  },
];

async function captureScreenshot(browser, screenshot, viewport, viewportName, shouldInjectMockData = true) {
  const context = await browser.newContext({
    viewport,
    ignoreHTTPSErrors: true, // For local HTTPS certificates
  });

  const page = await context.newPage();

  try {
    console.log(`  📸 Capturing: ${screenshot.title} (${viewportName})`);

    // Navigate to URL first
    await page.goto(screenshot.url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Inject mock data into IndexedDB
    if (shouldInjectMockData) {
      console.log('     Injecting mock data...');
      await injectMockData(page, mockData);

      // Verify injection was successful
      const verification = await verifyMockData(page);
      console.log('     Mock data injected:', JSON.stringify(verification));

      // Reload page to pick up mock data
      await page.reload({ waitUntil: 'domcontentloaded' });
    }

    // Wait for network to settle
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      console.log('     Network idle timeout - continuing anyway');
    });

    // Run custom actions if defined
    if (screenshot.actions) {
      await screenshot.actions(page);
    }

    // Capture screenshot
    const filename = viewportName === 'desktop'
      ? `${screenshot.name}.png`
      : `${screenshot.name}-mobile.png`;

    const filepath = join(assetsDir, filename);

    await page.screenshot({
      path: filepath,
      fullPage: false, // Capture visible viewport only
    });

    console.log(`     ✅ Saved: ${filename}`);

  } catch (error) {
    console.error(`     ❌ Failed: ${screenshot.title} (${viewportName})`);
    console.error(`     Error: ${error.message}`);
    if (error.stack) {
      console.error(`     Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
    }
  } finally {
    await context.close();
  }
}

async function captureAll(viewportFilter = null, cleanFirst = false) {
  console.log('\n🎬 Starting Screenshot Capture with Mock Data\n');
  console.log(`📁 Output directory: ${assetsDir}`);
  console.log(`📦 Mock data: ${mockDataPath}`);
  console.log(`🔧 Clean first: ${cleanFirst ? 'Yes' : 'No'}\n`);

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    // If clean flag is set, clear IndexedDB first
    if (cleanFirst) {
      console.log('🧹 Cleaning IndexedDB before capture...\n');
      const page = await browser.newPage();
      await page.goto('https://localhost:1847', { waitUntil: 'domcontentloaded' });
      await clearIndexedDB(page);
      await page.close();
      console.log('✅ IndexedDB cleaned\n');
    }

    let captureCount = 0;
    let failureCount = 0;

    for (const screenshot of SCREENSHOTS) {
      // Desktop screenshots
      if (screenshot.desktop && (!viewportFilter || viewportFilter === 'desktop')) {
        console.log(`\n[${++captureCount}/${SCREENSHOTS.length * 2}] ${screenshot.title} (Desktop)`);
        try {
          await captureScreenshot(browser, screenshot, VIEWPORTS.desktop, 'desktop', true);
        } catch (error) {
          failureCount++;
          console.error(`Failed to capture ${screenshot.title} (desktop):`, error.message);
        }
      }

      // Mobile screenshots
      if (screenshot.mobile && (!viewportFilter || viewportFilter === 'mobile')) {
        console.log(`\n[${++captureCount}/${SCREENSHOTS.length * 2}] ${screenshot.title} (Mobile)`);
        try {
          await captureScreenshot(browser, screenshot, VIEWPORTS.mobile, 'mobile', true);
        } catch (error) {
          failureCount++;
          console.error(`Failed to capture ${screenshot.title} (mobile):`, error.message);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Screenshot capture complete!');
    console.log(`📊 Captured: ${captureCount - failureCount}/${captureCount}`);
    if (failureCount > 0) {
      console.log(`⚠️  Failures: ${failureCount}`);
    }
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Screenshot capture failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Parse command-line arguments
const args = process.argv.slice(2);
const viewportFilter = args.includes('--desktop') ? 'desktop'
  : args.includes('--mobile') ? 'mobile'
  : null;
const cleanFirst = args.includes('--clean');

// Run capture
captureAll(viewportFilter, cleanFirst).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
