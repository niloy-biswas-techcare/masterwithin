import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import sharedPreset from "@mw/config/eslint-preset.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      ...sharedPreset.rules,
      // Guardrail (§12.6 RC 1 / Phase 6b.4): a raw `<a href="/…">` on an internal route
      // forces a full-page browser reload. Internal navigation must use `next/link`
      // (or a card's `linkComponent` injection point) so it stays a soft transition.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXOpeningElement[name.name='a'] > JSXAttribute[name.name='href'] > Literal[value=/^\\/(?!\\/)/]",
          message:
            'Use next/link for internal navigation — a raw <a href="/…"> causes a full-page reload (§12.6 RC 1).',
        },
      ],
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
