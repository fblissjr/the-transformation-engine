import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../tests/utils/test-utils';
import CenterPanel from './CenterPanel';

// Mock generation to avoid API calls
vi.mock('../context/GenerationContext', () => ({
  useGeneration: () => ({
    isLoading: false,
    error: null,
    generate: vi.fn(),
  }),
}));

describe('CenterPanel', () => {
  it('renders the creative idea label', () => {
    render(<CenterPanel />);
    expect(screen.getByText(/Creative Idea/i)).toBeInTheDocument();
  });

  it('renders the generate button', () => {
    render(<CenterPanel />);
    expect(screen.getByRole('button', { name: /Generate/i })).toBeInTheDocument();
  });
});
