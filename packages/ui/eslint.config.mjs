import tseslint from 'typescript-eslint';

/**
 * Enforces the design-system layering (§4.4): a component may import only from the
 * layers below it. Concretely:
 *   tokens/lib  →  primitives  →  components
 * Upward imports (a primitive reaching into components, or lib reaching into either)
 * are reported as errors so the dependency graph stays acyclic and legible.
 */
export default tseslint.config(
  // Parse TS/TSX with the typescript-eslint parser across the package.
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['src/lib/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../primitives', '../primitives/*', '../components', '../components/*'],
              message:
                'Layering (§4.4): the lib/tokens layer must not import from primitives or components.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/primitives/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../components', '../components/*'],
              message:
                'Layering (§4.4): a primitive must not import from the UI components layer above it.',
            },
          ],
        },
      ],
    },
  },
);
