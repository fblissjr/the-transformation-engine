import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Object Library
 *
 * Phase 6.3b: End-to-end tests for the Object Library UI.
 * Tests the full workflow of creating, searching, and managing objects.
 */

test.describe('Object Library', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    // Wait for the app to load
    await expect(page.locator('text=Object Library')).toBeVisible({ timeout: 10000 });
  });

  test('should display the Object Library panel', async ({ page }) => {
    // Verify Object Library header is visible
    await expect(page.locator('h2:has-text("Object Library")')).toBeVisible();

    // Verify type selector with all 7 types
    await expect(page.locator('button:has-text("Characters")')).toBeVisible();
    await expect(page.locator('button:has-text("Locations")')).toBeVisible();
    await expect(page.locator('button:has-text("Cameras")')).toBeVisible();
    await expect(page.locator('button:has-text("Props")')).toBeVisible();
    await expect(page.locator('button:has-text("Audio")')).toBeVisible();
    await expect(page.locator('button:has-text("Concepts")')).toBeVisible();
    await expect(page.locator('button:has-text("Custom")')).toBeVisible();

    // Verify Create button is visible
    await expect(page.locator('button:has-text("Create New Object")')).toBeVisible();
  });

  test('should switch between object types', async ({ page }) => {
    // Start on Characters (default)
    const charactersBtn = page.locator('button:has-text("Characters")');
    await expect(charactersBtn).toHaveClass(/bg-blue-600/);

    // Click on Locations
    const locationsBtn = page.locator('button:has-text("Locations")');
    await locationsBtn.click();
    await expect(locationsBtn).toHaveClass(/bg-blue-600/);

    // Characters should no longer be selected
    await expect(charactersBtn).not.toHaveClass(/bg-blue-600/);
  });

  test('should open Create Object dialog', async ({ page }) => {
    // Click Create New Object button
    await page.locator('button:has-text("Create New Object")').click();

    // Dialog should appear
    await expect(page.locator('h2:has-text("Create Object")')).toBeVisible();

    // All type options should be visible
    await expect(page.locator('button:has-text("Character")')).toBeVisible();
    await expect(page.locator('button:has-text("Location")')).toBeVisible();
    await expect(page.locator('button:has-text("Camera Setup")')).toBeVisible();
  });

  test('should create a new character object', async ({ page }) => {
    // Open dialog
    await page.locator('button:has-text("Create New Object")').click();
    await expect(page.locator('h2:has-text("Create Object")')).toBeVisible();

    // Select Character type
    await page.locator('button:has-text("Character")').first().click();

    // Should now be on details step
    await expect(page.locator('h2:has-text("Create Character")')).toBeVisible();

    // Fill in the form
    await page.locator('input[placeholder*="Detective"]').fill('Test Character');
    await page.locator('textarea[placeholder*="Describe"]').fill('A test character for E2E testing');
    await page.locator('input[placeholder*="sci-fi"]').fill('test, e2e, automated');

    // Create the object
    await page.locator('button:has-text("Create Object")').click();

    // Dialog should close and object should appear in list
    await expect(page.locator('h2:has-text("Create Object")')).not.toBeVisible({ timeout: 5000 });

    // The new object should be visible in the list
    await expect(page.locator('text=Test Character')).toBeVisible();
  });

  test('should search for objects', async ({ page }) => {
    // First create an object to search for
    await page.locator('button:has-text("Create New Object")').click();
    await page.locator('button:has-text("Character")').first().click();
    await page.locator('input[placeholder*="Detective"]').fill('SearchableHero');
    await page.locator('button:has-text("Create Object")').click();
    await expect(page.locator('text=SearchableHero')).toBeVisible();

    // Create another object
    await page.locator('button:has-text("Create New Object")').click();
    await page.locator('button:has-text("Character")').first().click();
    await page.locator('input[placeholder*="Detective"]').fill('OtherCharacter');
    await page.locator('button:has-text("Create Object")').click();
    await expect(page.locator('text=OtherCharacter')).toBeVisible();

    // Now search
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Searchable');

    // Only the matching object should be visible
    await expect(page.locator('text=SearchableHero')).toBeVisible();
    await expect(page.locator('text=OtherCharacter')).not.toBeVisible();

    // Clear search
    await page.locator('button[aria-label="Clear search"]').click();

    // Both should be visible again
    await expect(page.locator('text=SearchableHero')).toBeVisible();
    await expect(page.locator('text=OtherCharacter')).toBeVisible();
  });

  test('should select an object', async ({ page }) => {
    // Create an object
    await page.locator('button:has-text("Create New Object")').click();
    await page.locator('button:has-text("Character")').first().click();
    await page.locator('input[placeholder*="Detective"]').fill('SelectableChar');
    await page.locator('button:has-text("Create Object")').click();
    await expect(page.locator('text=SelectableChar')).toBeVisible();

    // Click on the object to select it
    await page.locator('button:has-text("SelectableChar")').click();

    // The object button should now have the selected style
    const objectButton = page.locator('button:has-text("SelectableChar")');
    await expect(objectButton).toHaveClass(/border-blue-500/);
  });

  test('should display empty state when no objects exist', async ({ page }) => {
    // Switch to a type with no objects (Audio is likely empty)
    await page.locator('button:has-text("Audio")').click();

    // Should show empty state
    await expect(page.locator('text=No objects')).toBeVisible();
  });

  test('should cancel object creation', async ({ page }) => {
    // Open dialog
    await page.locator('button:has-text("Create New Object")').click();
    await expect(page.locator('h2:has-text("Create Object")')).toBeVisible();

    // Select a type
    await page.locator('button:has-text("Character")').first().click();
    await expect(page.locator('h2:has-text("Create Character")')).toBeVisible();

    // Click Cancel
    await page.locator('button:has-text("Cancel")').click();

    // Dialog should close
    await expect(page.locator('h2:has-text("Create Character")')).not.toBeVisible();
  });

  test('should go back from details to type selection', async ({ page }) => {
    // Open dialog
    await page.locator('button:has-text("Create New Object")').click();

    // Select Character
    await page.locator('button:has-text("Character")').first().click();
    await expect(page.locator('h2:has-text("Create Character")')).toBeVisible();

    // Click Back
    await page.locator('button:has-text("Back")').click();

    // Should be back on type selection
    await expect(page.locator('h2:has-text("Create Object")')).toBeVisible();
  });

  test('should require name when creating object', async ({ page }) => {
    // Open dialog and select type
    await page.locator('button:has-text("Create New Object")').click();
    await page.locator('button:has-text("Character")').first().click();

    // Try to create without name - button should be disabled
    const createBtn = page.locator('button:has-text("Create Object")');
    await expect(createBtn).toBeDisabled();

    // Enter name
    await page.locator('input[placeholder*="Detective"]').fill('ValidName');

    // Now button should be enabled
    await expect(createBtn).toBeEnabled();
  });
});
