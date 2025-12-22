/**
 * Integration Tests: Object Library UI Components
 *
 * These tests validate the Object Library UI components work correctly
 * with mocked context providers. They test component behavior in isolation
 * but with realistic data structures.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Components under test
import { ObjectTypeSelector } from '../../../src/components/ObjectLibrary/ObjectTypeSelector';
import { ObjectSearchBar } from '../../../src/components/ObjectLibrary/ObjectSearchBar';
import { ObjectList } from '../../../src/components/ObjectLibrary/ObjectList';

// Context
import { OBJECT_TYPES } from '../../../src/contexts/ObjectLibraryContext';

// Mock data
const MOCK_OBJECTS = [
  {
    id: 'char_001',
    type: 'character',
    name: 'Detective Sarah Chen',
    version: 1,
    tags: ['protagonist', 'detective'],
    data: { role: 'detective', age: '35-40' },
    created: new Date('2025-11-20'),
    modified: new Date('2025-11-20'),
  },
  {
    id: 'char_002',
    type: 'character',
    name: 'Marcus Wolfe',
    version: 1,
    tags: ['antagonist', 'villain'],
    data: { role: 'villain', age: '50-55' },
    created: new Date('2025-11-20'),
    modified: new Date('2025-11-20'),
  },
  {
    id: 'loc_001',
    type: 'location',
    name: 'Warehouse',
    version: 1,
    tags: ['industrial', 'dark'],
    data: { setting: 'industrial' },
    created: new Date('2025-11-21'),
    modified: new Date('2025-11-21'),
  },
  {
    id: 'cam_001',
    type: 'camera',
    name: 'Handheld Intense',
    version: 1,
    tags: ['action', 'handheld'],
    data: { shotType: 'close-up' },
    created: new Date('2025-11-22'),
    modified: new Date('2025-11-22'),
  },
];

// Mock context value
const createMockContextValue = (overrides = {}) => ({
  objects: MOCK_OBJECTS,
  selectedObjectId: null,
  selectedObjectType: null,
  isLoading: false,
  error: null,
  setSelectedObject: vi.fn(),
  clearSelection: vi.fn(),
  refreshObjects: vi.fn(),
  createObject: vi.fn(),
  updateObject: vi.fn(),
  deleteObject: vi.fn(),
  duplicateObject: vi.fn(),
  getObjectsByType: (type: string) => MOCK_OBJECTS.filter(obj => obj.type === type),
  getObjectById: (id: string, type: string) => MOCK_OBJECTS.find(obj => obj.id === id && obj.type === type),
  ...overrides,
});

// Mock the context hook
vi.mock('../../../src/contexts/ObjectLibraryContext', async () => {
  const actual = await vi.importActual('../../../src/contexts/ObjectLibraryContext');
  return {
    ...actual,
    useObjectLibrary: vi.fn(() => createMockContextValue()),
  };
});

// Import the mock after setting it up
import { useObjectLibrary } from '../../../src/contexts/ObjectLibraryContext';
const mockUseObjectLibrary = vi.mocked(useObjectLibrary);

// ============================================================================
// OBJECT TYPE SELECTOR TESTS
// ============================================================================

describe('ObjectTypeSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseObjectLibrary.mockReturnValue(createMockContextValue());
  });

  it('should render all 7 object types', () => {
    const onTypeChange = vi.fn();
    render(<ObjectTypeSelector selectedType="character" onTypeChange={onTypeChange} />);

    // Check all types are rendered
    expect(screen.getByText('Characters')).toBeInTheDocument();
    expect(screen.getByText('Locations')).toBeInTheDocument();
    expect(screen.getByText('Cameras')).toBeInTheDocument();
    expect(screen.getByText('Props')).toBeInTheDocument();
    expect(screen.getByText('Audio')).toBeInTheDocument();
    expect(screen.getByText('Concepts')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('should show item counts for each type', () => {
    const onTypeChange = vi.fn();
    render(<ObjectTypeSelector selectedType="character" onTypeChange={onTypeChange} />);

    // Characters: 2 items
    expect(screen.getByText('2 items')).toBeInTheDocument();
    // Locations: 1 item, Cameras: 1 item (both show "1 item")
    const singleItems = screen.getAllByText('1 item');
    expect(singleItems.length).toBe(2); // location and camera each have 1 item
  });

  it('should call onTypeChange when a type is clicked', async () => {
    const user = userEvent.setup();
    const onTypeChange = vi.fn();
    render(<ObjectTypeSelector selectedType="character" onTypeChange={onTypeChange} />);

    // Click on Locations
    const locationsButton = screen.getByText('Locations').closest('button');
    await user.click(locationsButton!);

    expect(onTypeChange).toHaveBeenCalledWith('location');
  });

  it('should highlight the selected type', () => {
    const onTypeChange = vi.fn();
    render(<ObjectTypeSelector selectedType="camera" onTypeChange={onTypeChange} />);

    // The camera button should have the selected style (bg-blue-600)
    const cameraButton = screen.getByText('Cameras').closest('button');
    expect(cameraButton).toHaveClass('bg-blue-600');
  });
});

// ============================================================================
// OBJECT SEARCH BAR TESTS
// ============================================================================

describe('ObjectSearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseObjectLibrary.mockReturnValue(createMockContextValue());
  });

  it('should render a search input', () => {
    const onSearchChange = vi.fn();
    render(<ObjectSearchBar searchQuery="" onSearchChange={onSearchChange} />);

    const input = screen.getByPlaceholderText(/search/i);
    expect(input).toBeInTheDocument();
  });

  it('should call onSearchChange when typing', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<ObjectSearchBar searchQuery="" onSearchChange={onSearchChange} />);

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'S');

    // onSearchChange should be called with the typed character
    expect(onSearchChange).toHaveBeenCalled();
    expect(onSearchChange).toHaveBeenCalledWith('S');
  });

  it('should display current search value', () => {
    const onSearchChange = vi.fn();
    render(<ObjectSearchBar searchQuery="Detective" onSearchChange={onSearchChange} />);

    const input = screen.getByPlaceholderText(/search/i) as HTMLInputElement;
    expect(input.value).toBe('Detective');
  });

  it('should show clear button when search query exists', () => {
    const onSearchChange = vi.fn();
    render(<ObjectSearchBar searchQuery="test" onSearchChange={onSearchChange} />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    expect(clearButton).toBeInTheDocument();
  });

  it('should clear search when clear button clicked', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<ObjectSearchBar searchQuery="test" onSearchChange={onSearchChange} />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(onSearchChange).toHaveBeenCalledWith('');
  });
});

// ============================================================================
// OBJECT LIST TESTS
// ============================================================================

describe('ObjectList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseObjectLibrary.mockReturnValue(createMockContextValue());
  });

  // Add linkedScenes to mock objects for the ObjectList component
  const MOCK_OBJECTS_WITH_SCENES = MOCK_OBJECTS.map(obj => ({
    ...obj,
    linkedScenes: [],
  }));

  it('should render a list of objects', () => {
    const onSelectObject = vi.fn();
    // Filter to just characters for this test
    const characters = MOCK_OBJECTS_WITH_SCENES.filter(obj => obj.type === 'character');

    render(<ObjectList objects={characters} selectedObjectId={null} onSelectObject={onSelectObject} />);

    expect(screen.getByText('Detective Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('Marcus Wolfe')).toBeInTheDocument();
  });

  it('should call onSelectObject when an object is clicked', async () => {
    const user = userEvent.setup();
    const onSelectObject = vi.fn();
    const characters = MOCK_OBJECTS_WITH_SCENES.filter(obj => obj.type === 'character');

    render(<ObjectList objects={characters} selectedObjectId={null} onSelectObject={onSelectObject} />);

    // Click on Sarah
    const sarahItem = screen.getByText('Detective Sarah Chen');
    await user.click(sarahItem);

    expect(onSelectObject).toHaveBeenCalledWith('char_001', 'character');
  });

  it('should show empty state when no objects', () => {
    const onSelectObject = vi.fn();
    render(<ObjectList objects={[]} selectedObjectId={null} onSelectObject={onSelectObject} />);

    // Should show empty state message
    expect(screen.getByText(/no objects/i)).toBeInTheDocument();
  });

  it('should highlight selected object', () => {
    const onSelectObject = vi.fn();
    const characters = MOCK_OBJECTS_WITH_SCENES.filter(obj => obj.type === 'character');

    render(
      <ObjectList
        objects={characters}
        selectedObjectId="char_001"
        onSelectObject={onSelectObject}
      />
    );

    // The selected item should have the border-blue-500 class
    const sarahButton = screen.getByText('Detective Sarah Chen').closest('button');
    expect(sarahButton).toHaveClass('border-blue-500');
  });

  it('should display object tags', () => {
    const onSelectObject = vi.fn();
    const characters = MOCK_OBJECTS_WITH_SCENES.filter(obj => obj.type === 'character');

    render(<ObjectList objects={characters} selectedObjectId={null} onSelectObject={onSelectObject} />);

    // Sarah has tags: protagonist, detective
    expect(screen.getByText('protagonist')).toBeInTheDocument();
    expect(screen.getByText('detective')).toBeInTheDocument();
  });
});

// ============================================================================
// LOADING AND ERROR STATES
// ============================================================================

describe('Loading and Error States', () => {
  it('should show zero counts in loading state for ObjectTypeSelector', () => {
    mockUseObjectLibrary.mockReturnValue(createMockContextValue({
      isLoading: true,
      objects: [],
      getObjectsByType: () => [], // Override to return empty array
    }));

    const onTypeChange = vi.fn();
    render(<ObjectTypeSelector selectedType="character" onTypeChange={onTypeChange} />);

    // Even in loading state, the types should be visible
    expect(screen.getByText('Characters')).toBeInTheDocument();
    // All types should have 0 items - use getAllByText since multiple exist
    const zeroItems = screen.getAllByText('0 items');
    expect(zeroItems.length).toBe(7); // All 7 types show 0 items
  });
});
