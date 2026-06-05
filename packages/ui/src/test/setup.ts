import '@testing-library/jest-dom/vitest';
import * as axeMatchers from 'vitest-axe/matchers';
import { expect, vi } from 'vitest';

// Accessibility + DOM assertion matchers for component tests (§14, §20).
expect.extend(axeMatchers);

// jsdom has no canvas; axe probes it for icon-ligature detection. Stub it so the
// (unrelated) colour-contrast probe doesn't spam stderr during a11y runs.
if (typeof HTMLCanvasElement !== 'undefined') {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
}
