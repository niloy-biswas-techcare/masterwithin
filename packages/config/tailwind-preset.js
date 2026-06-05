module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary, #1E9AE0)",
        deep: "var(--color-deep, #1A5C8A)",
        accent: "var(--color-accent, #1E9AE0)",
        dark: "var(--color-dark, #3D4858)",
        text: "var(--color-text, #2C3340)",
        muted: "var(--color-muted, #C8CFDA)",
        bg: "var(--color-bg, #F7F8FA)",
        surface: "var(--color-surface, #FFFFFF)",
        border: "var(--color-border, #E3E7ED)",
        success: "var(--color-success, #2E8B57)",
        warning: "var(--color-warning, #C9892B)",
        danger: "var(--color-danger, #C0392B)"
      },
      fontFamily: {
        display: ["var(--font-display)", "Lora", "Georgia", "serif"],
        body: ["var(--font-body)", "DM Sans", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"]
      },
      borderRadius: {
        sm: "var(--radius-sm, 6px)",
        md: "var(--radius-md, 10px)",
        lg: "var(--radius-lg, 16px)"
      },
      boxShadow: {
        sm: "var(--shadow-sm, 0 1px 2px rgba(45,51,64,.06))",
        md: "var(--shadow-md, 0 4px 16px rgba(45,51,64,.08))"
      }
    }
  },
  plugins: []
};
