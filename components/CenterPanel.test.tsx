import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CenterPanel from './CenterPanel';
import { PromptProvider } from '../context/PromptContext';
import { ApiKeyProvider } from '../context/ApiKeyContext';

vi.mock('@google/generative-ai');

describe('CenterPanel', () => {
  it('renders the creative idea label', () => {
    render(
      <ApiKeyProvider>
        <PromptProvider>
          <CenterPanel />
        </PromptProvider>
      </ApiKeyProvider>
    );
    expect(screen.getByText('Creative Idea')).toBeInTheDocument();
  });
});
