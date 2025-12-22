/**
 * Integration Tests: ModelPicker UI Component
 *
 * Tests for the ModelPicker searchable dropdown component.
 * Tests component behavior with realistic model data.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Component under test
import { ModelPicker } from '../../../src/components/ModelPicker';

// Mock model data
const MOCK_MODELS = [
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'Fast and efficient model',
    capabilities: {
      vision: true,
      video: true,
      jsonMode: true,
      maxContextTokens: 1000000,
    },
    tags: ['fast', 'multimodal'],
    pricing: {
      inputPerMillion: 150,
      outputPerMillion: 600,
    },
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Advanced reasoning model',
    capabilities: {
      vision: true,
      video: false,
      jsonMode: true,
      maxContextTokens: 2000000,
    },
    tags: ['pro', 'reasoning'],
    pricing: {
      inputPerMillion: 1250,
      outputPerMillion: 5000,
    },
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'OpenAI flagship model',
    capabilities: {
      vision: true,
      video: false,
      jsonMode: true,
      maxContextTokens: 128000,
    },
    tags: ['openai', 'flagship'],
    pricing: {
      inputPerMillion: 5000,
      outputPerMillion: 15000,
    },
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    description: 'Most capable Anthropic model',
    capabilities: {
      vision: true,
      video: false,
      jsonMode: false,
      maxContextTokens: 200000,
    },
    tags: ['anthropic', 'opus'],
    pricing: {
      inputPerMillion: 15000,
      outputPerMillion: 75000,
    },
  },
];

// ============================================================================
// BASIC RENDERING TESTS
// ============================================================================

describe('ModelPicker - Basic Rendering', () => {
  it('should show "Select model..." when no model is selected', () => {
    const onSelect = vi.fn();
    render(
      <ModelPicker
        providerId="gemini"
        models={MOCK_MODELS}
        selectedModelId=""
        onSelect={onSelect}
      />
    );

    expect(screen.getByText('Select model...')).toBeInTheDocument();
  });

  it('should show selected model name when a model is selected', () => {
    const onSelect = vi.fn();
    render(
      <ModelPicker
        providerId="gemini"
        models={MOCK_MODELS}
        selectedModelId="gemini-2.0-flash"
        onSelect={onSelect}
      />
    );

    expect(screen.getByText('Gemini 2.0 Flash')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    const onSelect = vi.fn();
    render(
      <ModelPicker
        providerId="gemini"
        models={MOCK_MODELS}
        selectedModelId="gemini-2.0-flash"
        onSelect={onSelect}
        disabled={true}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
  });
});

// ============================================================================
// DROPDOWN INTERACTION TESTS
// ============================================================================

describe('ModelPicker - Dropdown Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should open dropdown when clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ModelPicker
        providerId="gemini"
        models={MOCK_MODELS}
        selectedModelId=""
        onSelect={onSelect}
      />
    );

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // Should show search input and model list
    expect(screen.getByPlaceholderText('Search models...')).toBeInTheDocument();
    expect(screen.getByText('Gemini 2.0 Flash')).toBeInTheDocument();
    expect(screen.getByText('GPT-4o')).toBeInTheDocument();
  });

  it('should show model count in footer', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ModelPicker
        providerId="gemini"
        models={MOCK_MODELS}
        selectedModelId=""
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('4 of 4 models')).toBeInTheDocument();
  });

  it('should call onSelect when a model is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ModelPicker
        providerId="gemini"
        models={MOCK_MODELS}
        selectedModelId=""
        onSelect={onSelect}
      />
    );

    // Open dropdown
    await user.click(screen.getByRole('button'));

    // Click on GPT-4o
    const gptOption = screen.getByText('GPT-4o');
    await user.click(gptOption);

    expect(onSelect).toHaveBeenCalledWith('gpt-4o');
  });
});

// ============================================================================
// SEARCH FUNCTIONALITY TESTS
// ============================================================================

describe('ModelPicker - Search Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should filter models by search term', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ModelPicker
        providerId="gemini"
        models={MOCK_MODELS}
        selectedModelId=""
        onSelect={onSelect}
      />
    );

    // Open dropdown
    await user.click(screen.getByRole('button'));

    // Type in search
    const searchInput = screen.getByPlaceholderText('Search models...');
    await user.type(searchInput, 'Gemini');

    // Should only show Gemini models
    expect(screen.getByText('Gemini 2.0 Flash')).toBeInTheDocument();
    expect(screen.getByText('Gemini 1.5 Pro')).toBeInTheDocument();
    expect(screen.queryByText('GPT-4o')).not.toBeInTheDocument();
    expect(screen.queryByText('Claude 3 Opus')).not.toBeInTheDocument();
  });

  it('should show "No models found" when search returns empty', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ModelPicker
        providerId="gemini"
        models={MOCK_MODELS}
        selectedModelId=""
        onSelect={onSelect}
      />
    );

    // Open dropdown
    await user.click(screen.getByRole('button'));

    // Type nonsense search
    const searchInput = screen.getByPlaceholderText('Search models...');
    await user.type(searchInput, 'xyznotamodel');

    expect(screen.getByText('No models found')).toBeInTheDocument();
  });

  it('should search by model tags', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ModelPicker
        providerId="gemini"
        models={MOCK_MODELS}
        selectedModelId=""
        onSelect={onSelect}
      />
    );

    // Open dropdown
    await user.click(screen.getByRole('button'));

    // Search by tag
    const searchInput = screen.getByPlaceholderText('Search models...');
    await user.type(searchInput, 'anthropic');

    // Should only show Claude model (has 'anthropic' tag)
    expect(screen.getByText('Claude 3 Opus')).toBeInTheDocument();
    expect(screen.queryByText('Gemini 2.0 Flash')).not.toBeInTheDocument();
    expect(screen.queryByText('GPT-4o')).not.toBeInTheDocument();
  });
});

// ============================================================================
// CAPABILITY FILTERING TESTS
// ============================================================================

describe('ModelPicker - Capability Filtering', () => {
  it('should filter by video capability', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ModelPicker
        providerId="gemini"
        models={MOCK_MODELS}
        selectedModelId=""
        onSelect={onSelect}
        filterCapabilities={{ video: true }}
      />
    );

    // Open dropdown
    await user.click(screen.getByRole('button'));

    // Only Gemini 2.0 Flash has video capability
    expect(screen.getByText('Gemini 2.0 Flash')).toBeInTheDocument();
    expect(screen.queryByText('Gemini 1.5 Pro')).not.toBeInTheDocument();
    expect(screen.queryByText('GPT-4o')).not.toBeInTheDocument();

    // Should show filtered count
    expect(screen.getByText('1 of 4 models')).toBeInTheDocument();
  });

  it('should filter by vision capability', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ModelPicker
        providerId="gemini"
        models={MOCK_MODELS}
        selectedModelId=""
        onSelect={onSelect}
        filterCapabilities={{ vision: true }}
      />
    );

    // Open dropdown
    await user.click(screen.getByRole('button'));

    // All mock models have vision capability
    expect(screen.getByText('4 of 4 models')).toBeInTheDocument();
  });

  it('should filter by jsonMode capability', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ModelPicker
        providerId="gemini"
        models={MOCK_MODELS}
        selectedModelId=""
        onSelect={onSelect}
        filterCapabilities={{ jsonMode: true }}
      />
    );

    // Open dropdown
    await user.click(screen.getByRole('button'));

    // Claude 3 Opus doesn't have jsonMode
    expect(screen.getByText('Gemini 2.0 Flash')).toBeInTheDocument();
    expect(screen.getByText('GPT-4o')).toBeInTheDocument();
    expect(screen.queryByText('Claude 3 Opus')).not.toBeInTheDocument();

    expect(screen.getByText('3 of 4 models')).toBeInTheDocument();
  });
});

// ============================================================================
// MODEL DISPLAY TESTS
// ============================================================================

describe('ModelPicker - Model Display', () => {
  it('should display model description', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ModelPicker
        providerId="gemini"
        models={MOCK_MODELS}
        selectedModelId=""
        onSelect={onSelect}
      />
    );

    // Open dropdown
    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Fast and efficient model')).toBeInTheDocument();
    expect(screen.getByText('OpenAI flagship model')).toBeInTheDocument();
  });

  it('should display context length in formatted form', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ModelPicker
        providerId="gemini"
        models={MOCK_MODELS}
        selectedModelId=""
        onSelect={onSelect}
      />
    );

    // Open dropdown
    await user.click(screen.getByRole('button'));

    // Gemini 2.0 Flash has 1M context
    expect(screen.getByText('1.0M ctx')).toBeInTheDocument();
    // Gemini 1.5 Pro has 2M context
    expect(screen.getByText('2.0M ctx')).toBeInTheDocument();
    // GPT-4o has 128K context
    expect(screen.getByText('128K ctx')).toBeInTheDocument();
  });

  it('should highlight selected model in dropdown', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ModelPicker
        providerId="gemini"
        models={MOCK_MODELS}
        selectedModelId="gpt-4o"
        onSelect={onSelect}
      />
    );

    // Open dropdown
    await user.click(screen.getByRole('button'));

    // Find all GPT-4o texts - one in trigger, one in list
    const gptElements = screen.getAllByText('GPT-4o');
    // The second one is in the dropdown list
    const gptInList = gptElements[1];
    const gptButton = gptInList.closest('button');
    expect(gptButton).toHaveClass('bg-blue-900/30');
  });
});
