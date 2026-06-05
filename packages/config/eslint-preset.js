module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@supabase/*", "supabase-js"],
            message: "Direct imports from @supabase/* are only allowed within backend/adapters/supabase. Import use-cases from @mw/backend instead."
          },
          {
            group: ["cloudinary"],
            message: "Direct imports from cloudinary are only allowed within backend/adapters/supabase. Import storage gateways from @mw/backend instead."
          }
        ]
      }
    ]
  },
  overrides: [
    {
      files: ["**/backend/adapters/supabase/**/*.ts", "**/backend/adapters/supabase/**/*.tsx"],
      rules: {
        "no-restricted-imports": "off"
      }
    }
  ]
};
