import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as dbService from './indexedDbService';
import { Prompt } from '../../types';

describe('dbService', () => {
  beforeEach(async () => {
    await dbService.initDB();
  });

  afterEach(async () => {
    const prompts = await dbService.getPrompts();
    for (const prompt of prompts) {
      await dbService.deletePrompt(prompt.id);
    }
  });

  it('should add a prompt', async () => {
    const promptData = {
      title: 'Test Prompt',
      naturalLanguageInput: 'Test input',
      structuredOutput: '{}',
      normalizedOutput: 'Test output',
      settingsSnapshot: '{}',
      tags: '[]',
      isFavorite: false,
    };
    const newPrompt = await dbService.addPrompt(promptData);
    expect(newPrompt.id).toBeDefined();
    expect(newPrompt.title).toBe('Test Prompt');
  });

  it('should get prompts', async () => {
    const promptData = {
      title: 'Test Prompt',
      naturalLanguageInput: 'Test input',
      structuredOutput: '{}',
      normalizedOutput: 'Test output',
      settingsSnapshot: '{}',
      tags: '[]',
      isFavorite: false,
    };
    await dbService.addPrompt(promptData);
    const prompts = await dbService.getPrompts();
    expect(prompts.length).toBe(1);
    expect(prompts[0].title).toBe('Test Prompt');
  });

  it('should search prompts', async () => {
    const promptData1 = {
      title: 'First Test Prompt',
      naturalLanguageInput: 'Test input',
      structuredOutput: '{}',
      normalizedOutput: 'Test output',
      settingsSnapshot: '{}',
      tags: '[]',
      isFavorite: false,
    };
    const promptData2 = {
      title: 'Second Test Prompt',
      naturalLanguageInput: 'Test input',
      structuredOutput: '{}',
      normalizedOutput: 'Test output',
      settingsSnapshot: '{}',
      tags: '[]',
      isFavorite: false,
    };
    await dbService.addPrompt(promptData1);
    await dbService.addPrompt(promptData2);

    const prompts = await dbService.searchPrompts('First');
    expect(prompts.length).toBe(1);
    expect(prompts[0].title).toBe('First Test Prompt');
  });

  it('should update a prompt', async () => {
    const promptData = {
      title: 'Test Prompt',
      naturalLanguageInput: 'Test input',
      structuredOutput: '{}',
      normalizedOutput: 'Test output',
      settingsSnapshot: '{}',
      tags: '[]',
      isFavorite: false,
    };
    const newPrompt = await dbService.addPrompt(promptData);
    const updatedPrompt: Prompt = {
      ...newPrompt,
      title: 'Updated Test Prompt',
    };
    await dbService.updatePrompt(updatedPrompt);
    const prompts = await dbService.getPrompts();
    expect(prompts[0].title).toBe('Updated Test Prompt');
  });

  it('should delete a prompt', async () => {
    const promptData = {
      title: 'Test Prompt',
      naturalLanguageInput: 'Test input',
      structuredOutput: '{}',
      normalizedOutput: 'Test output',
      settingsSnapshot: '{}',
      tags: '[]',
      isFavorite: false,
    };
    const newPrompt = await dbService.addPrompt(promptData);
    await dbService.deletePrompt(newPrompt.id);
    const prompts = await dbService.getPrompts();
    expect(prompts.length).toBe(0);
  });
});
