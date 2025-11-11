import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';

// Simple re-export for now - context providers will be added per-test as needed
// This avoids complex provider setup that requires specific props

const customRender = (
  ui: ReactElement,
  options?: RenderOptions
) => rtlRender(ui, options);

export * from '@testing-library/react';
export { customRender as render };
