# Test Suite Overview

This directory contains the comprehensive test suite for The Transformation Engine.

## Quick Start

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run Image Studio tests only
npm run test:image-studio
```

## Directory Structure

```
tests/
├── mocks/                 # Mock implementations (API, database)
├── fixtures/              # Sample test data
├── utils/                 # Reusable test utilities
├── unit/                  # Unit tests (services, utilities)
├── integration/           # Integration tests (multi-service flows)
├── components/            # Component tests (React UI)
├── helpers/               # Legacy test helpers
├── setup.ts               # Global test setup
├── IMAGE_STUDIO_TESTING.md  # Detailed image testing guide
└── README.md              # This file
```

## Test Suites

### Image Studio Tests (110+ tests completed, 180+ pending)

Complete test suite for image generation/editing features.

**Completed**:
- Mock utilities (geminiImageApi, imageDatabase, fixtures)
- imageDbService.test.ts (70+ tests)
- crossWorkspaceService.test.ts (40+ tests)
- imageTestUtils.ts (reusable helpers)

**Pending**:
- imageGenerationService.test.ts (50+ tests)
- Integration tests (70+ tests)
- Component tests (60+ tests)

See [IMAGE_STUDIO_TESTING.md](./IMAGE_STUDIO_TESTING.md) for complete details.

### Video Studio Tests (Existing)

Tests for video prompt engineering features:
- Database service tests (5 tests in services/db/indexedDbService.test.ts)
- Intermediate service tests (13 tests in services/db/intermediateService.test.ts)
- Transformer tests (unit tests for format transformations)

## Running Tests

### All Tests
```bash
npm run test             # Watch mode
npm run test:run         # Run once
npm run test:ui          # Interactive UI
npm run test:coverage    # With coverage report
```

### Image Studio Tests
```bash
npm run test:image-studio           # Run once
npm run test:image-studio:watch     # Watch mode
npm run test:image-studio:ui        # Interactive UI
npm run test:image-studio:coverage  # With coverage
```

### Specific Test Files
```bash
npm run test tests/unit/services/imageDbService.test.ts
npm run test tests/unit/services/crossWorkspaceService.test.ts
```

## Test Patterns

### Unit Test Example

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initImageDatabase, clearImageDatabase } from '../../mocks/imageDatabase';
import { mockImageGeneration } from '../../fixtures/imageData';

describe('myService', () => {
  beforeEach(async () => {
    await initImageDatabase();
  });

  afterEach(async () => {
    await clearImageDatabase();
  });

  it('should perform expected behavior', async () => {
    // Arrange
    const testData = mockImageGeneration;

    // Act
    const result = await myService.doSomething(testData);

    // Assert
    expect(result).toBeTruthy();
  });
});
```

### Mock API Example

```typescript
import { mockGenerateImageResponse } from '../mocks/geminiImageApi';
import { vi } from 'vitest';

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue(
        mockGenerateImageResponse('test prompt')
      )
    })
  }))
}));
```

## Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Unit Tests | 80% | Varies by module |
| Integration Tests | 75% | TBD |
| Component Tests | 70% | TBD |
| Overall | 80% | ~25% (existing) |

## Key Testing Principles

1. **Zero API Costs**: All external APIs mocked
2. **Fast Execution**: Tests run in <5 seconds
3. **Isolated Tests**: Each test is independent
4. **Descriptive Names**: BDD-style "should X when Y"
5. **Clean State**: Database cleared after each test
6. **One Assertion**: Each test verifies one behavior

## Common Issues

### Tests Failing with "Database not initialized"

Ensure `beforeEach` initializes the database:

```typescript
beforeEach(async () => {
  await initImageDatabase();
});
```

### Flaky Tests

Check for:
- Missing `await` keywords
- Shared state between tests
- Time-dependent assertions

### Slow Tests

Verify:
- All API calls are mocked
- Minimal test data is used
- No unnecessary delays

## Contributing

When adding new tests:

1. Place in appropriate directory (unit/integration/components)
2. Use existing mocks from `tests/mocks/`
3. Use existing fixtures from `tests/fixtures/`
4. Follow BDD naming conventions
5. Add cleanup in `afterEach`
6. Keep tests focused (one behavior per test)
7. Update this README if adding new test categories

## Documentation

- [IMAGE_STUDIO_TESTING.md](./IMAGE_STUDIO_TESTING.md) - Complete image testing guide
- [../docs/AUTOMATED_TESTING.md](../docs/AUTOMATED_TESTING.md) - Automation guide
- [Vitest Docs](https://vitest.dev/) - Test framework
- [Testing Library](https://testing-library.com/) - React testing utilities

## Maintenance

### Regular Tasks

- Run `npm run test:coverage` to check coverage
- Review and update fixtures when data models change
- Keep mocks in sync with actual APIs
- Clean up obsolete tests

### When Adding New Features

1. Create mocks first (if needed)
2. Create fixtures for test data
3. Write unit tests (aim for 80% coverage)
4. Write integration tests (for multi-service flows)
5. Write component tests (for UI features)
6. Update documentation

---

Last Updated: 2025-11-15
