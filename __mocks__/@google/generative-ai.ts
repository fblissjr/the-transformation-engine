export const GoogleGenerativeAI = vi.fn(() => ({
  getGenerativeModel: vi.fn(() => ({
    generateContent: vi.fn(() => Promise.resolve({ response: { text: () => 'mocked response' } }))
  }))
}));
