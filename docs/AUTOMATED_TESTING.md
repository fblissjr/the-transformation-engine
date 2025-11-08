# Automated Testing Guide

**Version**: Phase 9 Complete
**Last Updated**: 2025-10-12

---

## Quick Start

```bash
# Run automated tests (30+ tests, ~2 seconds)
npm run test:auto

# Run automated tests + build verification
npm run test:all
```

---

## What Gets Tested Automatically

### ✅ Automated (No Browser Required)

**1. File Structure** (6 tests):
- Core directories exist (components, services, context, types)
- Phase 9 files present (intermediates, transformers, migrations)
- System prompts exist (primary, sora2, veo3, intermediate)
- Logo assets in correct locations
- Documentation files present
- Management scripts exist

**2. Migration Logic** (3 tests):
- Temporal progression parsing (`[HH:MM-HH:MM]` format)
- YAML key extraction (scene, sound_effects, camera_movement)
- Multiline block handling (`|` syntax)

**3. Transformer Logic** (4 tests):
- Sora 2 canonical keys (7 keys)
- Veo 3 canonical keys (9 keys)
- Temporal segment time calculation
- Character counter logic (2500 char limit)

**4. Model Detection** (3 tests):
- Audio-rich content → Veo 3
- Temporal progression → Sora 2
- Simple content → Generic

**5. Configuration** (5 tests):
- Default port is 7392 (non-standard)
- Nginx config uses correct port
- CSP allows required domains
- Package.json scripts present
- TypeScript config valid

**6. Documentation** (4 tests):
- README references correct port
- CLAUDE.md updated for Phase 9
- User guide documents intermediate mode
- Operations guide complete

**7. Build Artifacts** (5 tests, if `dist/` exists):
- index.html present
- Assets directory present
- Logo copied to dist (favicon)
- Core prompts copied
- Fragments copied

**Total**: 30 automated tests

---

## Manual Testing Still Required

### ❌ Not Automated (Browser Required)

These require manual testing with the UI running:

1. **API Integration**:
   - API key validation
   - Gemini API calls
   - Response parsing
   - Error handling

2. **User Interactions**:
   - Button clicks
   - Form inputs
   - Drag-and-drop
   - Modal dialogs
   - Dropdown selections

3. **State Management**:
   - Context updates
   - React re-renders
   - Local storage
   - IndexedDB CRUD

4. **Visual Elements**:
   - Logo display
   - CSS rendering
   - Responsive layout
   - Color themes

5. **Performance**:
   - Load times
   - Search speed
   - Memory usage
   - Network latency

6. **Cross-Browser**:
   - Chrome/Edge
   - Firefox
   - Safari

**See `TESTING_CHECKLIST.md` for full manual test suite (400+ tests)**

---

## Test Output

### Success (All Pass):
```
🧪 Running Automated Tests

================================================================================

📁 File Structure Tests
✅ Core directories exist
✅ Phase 9 files exist
...

📊 Test Results
✅ Passed: 30
❌ Failed: 0
📈 Total:  30
================================================================================
```

### Failure Example:
```
❌ Failed Tests:

  • Migration can extract YAML keys
    Speech extraction failed

================================================================================

📊 Test Results
✅ Passed: 29
❌ Failed: 1
📈 Total:  30
```

**Exit Code**:
- `0` = All tests passed
- `1` = One or more tests failed

---

## Running Tests

### During Development
```bash
# Quick automated tests (2 seconds)
npm run test:auto

# Full check (automated + build)
npm run test:all

# TypeScript check only
npx tsc --noEmit
```

### Before Commit
```bash
# 1. Automated tests
npm run test:auto

# 2. Build verification
npm run build

# 3. Manual smoke test (5 min)
# See TESTING_CHECKLIST.md "Quick Smoke Test"
```

### Before Release
```bash
# 1. All automated tests + build
npm run test:all

# 2. Full manual test suite
# See TESTING_CHECKLIST.md (1-2 hours)

# 3. Cross-browser testing
# Chrome, Firefox, Safari

# 4. Deployment verification
./manage.sh build
./manage.sh start
# Test at http://localhost:7392
```

---

## Adding New Tests

### To Automated Suite

Edit `scripts/automated-tests.js`:

```javascript
test('Your test name', () => {
  // Test logic here
  assert(condition, 'Failure message');
});
```

**Good Candidates for Automation**:
- File existence checks
- String parsing/regex
- Configuration validation
- Build artifact verification
- Documentation completeness
- Logic tests (no API/UI)

**Bad Candidates** (keep manual):
- API calls (require real API key)
- User interactions (clicks, forms)
- Visual rendering
- State management
- Performance metrics

### Test Categories

```javascript
console.log('📁 Your Category Name\n');

test('Test 1', () => { /* ... */ });
test('Test 2', () => { /* ... */ });

console.log('');
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Automated Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:all
```

### Pre-commit Hook

`.git/hooks/pre-commit`:
```bash
#!/bin/bash
npm run test:auto
if [ $? -ne 0 ]; then
  echo "❌ Automated tests failed. Commit aborted."
  exit 1
fi
```

---

## Test Coverage

### Current Coverage

| Category | Automated | Manual | Total |
|----------|-----------|--------|-------|
| File Structure | 100% | 0% | 100% |
| Migration Logic | 80% | 20% | 100% |
| Transformer Logic | 60% | 40% | 100% |
| Model Detection | 70% | 30% | 100% |
| Configuration | 90% | 10% | 100% |
| Documentation | 100% | 0% | 100% |
| UI Components | 0% | 100% | 100% |
| API Integration | 0% | 100% | 100% |
| **Overall** | **~25%** | **~75%** | **100%** |

### Target Coverage

**Automated**: 30-40% (logic, structure, config)
**Manual**: 60-70% (UI, API, integration)

This is appropriate for a hobbyist project. Enterprise projects typically aim for 70-80% automated coverage.

---

## Troubleshooting

### Tests Fail After Changes

1. **Check file paths**: Did you move/rename files?
2. **Check constants**: Did you change CANONICAL_SCHEMA_KEYS?
3. **Check config**: Did you change port numbers?
4. **Run build**: Some tests check `dist/` artifacts

### Tests Pass But App Broken

Automated tests don't cover:
- UI rendering
- API integration
- User interactions
- Performance

**Solution**: Run manual smoke test (see TESTING_CHECKLIST.md)

### Build Fails But Tests Pass

Tests don't include:
- TypeScript type checking
- Build process
- Bundler configuration

**Solution**:
```bash
npx tsc --noEmit  # Check types
npm run build     # Check build
```

---

## Best Practices

### Test Organization

✅ **DO**:
- Group related tests in sections
- Use descriptive test names
- Assert one thing per test
- Keep tests independent

❌ **DON'T**:
- Test UI interactions (use manual tests)
- Test API calls (use mocks or manual tests)
- Make tests depend on each other
- Test implementation details

### Assertion Style

```javascript
// Good: Clear failure message
assert(value === expected, `Expected ${expected}, got ${value}`);

// Bad: No context
assert(value === expected);

// Good: Test one thing
test('Port is 7392', () => {
  assert(port === 7392, 'Port incorrect');
});

// Bad: Test multiple things
test('Config is correct', () => {
  assert(port === 7392);
  assert(host === '127.0.0.1');
  assert(name === 'transformation-engine');
});
```

---

## Performance

**Automated tests**: ~2 seconds (30 tests)
**Full build**: ~1 second
**Total**: ~3 seconds for `npm run test:all`

Fast enough to run before every commit.

---

## Maintenance

### When to Update Tests

**File structure changes**:
- Added new Phase 9 files → Update file existence tests
- Moved files → Update paths

**Configuration changes**:
- Changed port numbers → Update port tests
- Changed canonical keys → Update key tests

**Documentation changes**:
- Updated CLAUDE.md → Tests verify automatically

**New features**:
- Add logic tests for pure functions
- Add file structure tests for new files
- Keep UI/API tests manual

### Test Maintenance Schedule

- **Weekly**: Run full test suite manually
- **Before commit**: Run automated tests
- **Before release**: Run all tests (automated + manual)
- **After dependencies update**: Re-run all tests

---

## Summary

**Automated Testing**:
- 30 tests covering file structure, logic, config, docs
- Runs in ~2 seconds
- No browser or API key required
- Good for CI/CD and pre-commit hooks

**Manual Testing**:
- 400+ tests covering UI, API, interactions
- Requires browser and API key
- Takes 1-2 hours for full suite
- Required before releases

**Best Practice**: Run automated tests frequently, manual tests before releases.

---

**Questions?** See TESTING_CHECKLIST.md for full manual test suite.
