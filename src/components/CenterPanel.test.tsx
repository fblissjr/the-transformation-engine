import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CenterPanel from './CenterPanel';

// Mock all required contexts
vi.mock('../contexts/PromptContext', () => ({
  usePrompts: () => ({
    settings: {
      schemaKeys: ['scene', 'audio'],
      mixOptions: [],
    },
    setSettings: vi.fn(),
    naturalLanguageInput: 'A chef teaches a cooking class',
    setNaturalLanguageInput: vi.fn(),
    mediaReferences: [],
    addMediaReference: vi.fn(),
    removeMediaReference: vi.fn(),
    describeMedia: vi.fn(),
    isDescribing: false,
    describingMessage: '',
    generate: vi.fn(),
    isLoading: false,
    progress: 0,
    loadingMessage: '',
    inferSchema: vi.fn(),
    structuredOutput: null,
    setStructuredOutput: vi.fn(),
    selectPrompt: vi.fn(),
    addPrompt: vi.fn(),
  }),
}));

vi.mock('../contexts/ProviderContext', () => ({
  useProviders: () => ({
    providers: [
      {
        id: 'gemini',
        name: 'Google Gemini',
        enabled: true,
        apiKeys: [{ key: 'test-key', name: 'Test Key' }],
      },
    ],
    fetchModels: vi.fn(),
  }),
}));

vi.mock('../contexts/GenerationContext', () => ({
  useGeneration: () => ({
    generatedIntermediate: null,
    selectedExportModel: 'generic',
    setSelectedExportModel: vi.fn(),
    cancelGeneration: vi.fn(),
    revisionRequest: null,
    conversationHistory: [],
    answerRevisionRequest: vi.fn(),
    clearRevisionRequest: vi.fn(),
    finalOutput: null,
    genericFinalOutput: null,
    systemSpecificFinalOutput: null,
    structuredViewData: null,
    handleExportFormatChange: vi.fn(),
  }),
}));

vi.mock('../contexts/SceneClassificationContext', () => ({
  useSceneClassification: () => ({
    classification: 'narrative',
    setClassification: vi.fn(),
    selectedPresetId: null,
    customPresets: [],
    selectPreset: vi.fn(),
    promptingStrategy: 'continuous',
    setPromptingStrategy: vi.fn(),
    autoSuggestedPresetId: null,
    suggestionReasoning: '',
  }),
}));

// Mock hooks
vi.mock('../../hooks/useMediaBlobUrls', () => ({
  useMediaBlobUrls: () => new Map(),
}));

// Mock services to avoid actual API calls
vi.mock('../services/taskRouter', () => ({
  taskRouter: {
    executeTask: vi.fn(),
  },
}));

vi.mock('../services/promptService', () => ({
  generatePrimaryPrompt: vi.fn(() => 'mocked system prompt'),
}));

describe('CenterPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the creative idea label', () => {
    render(<CenterPanel />);
    expect(screen.getByText(/Creative Idea/i)).toBeInTheDocument();
  });

  it('renders the generate button', () => {
    render(<CenterPanel />);
    expect(screen.getByRole('button', { name: /Generate Prompt/i })).toBeInTheDocument();
  });

  it('renders the main input textarea', () => {
    render(<CenterPanel />);
    const textarea = screen.getByPlaceholderText(/A chef teaches/i);
    expect(textarea).toBeInTheDocument();
  });

  it('renders the export format selector', () => {
    render(<CenterPanel />);
    expect(screen.getByText('Export Format:')).toBeInTheDocument();
  });
});
