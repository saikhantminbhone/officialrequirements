import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Premium deep-indigo brand. Redefining the ramp shifts the whole site's
        // palette at once (every component already references brand-*).
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        // Near-black "ink" for premium dark sections (hero, footer, CTAs).
        ink: {
          800: "#1a1f37",
          900: "#0f1326",
          950: "#080b18",
        },
        trust: {
          amber: "#b45309",
          green: "#15803d",
          blue: "#4f46e5",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tightish: "-0.011em",
        tighter2: "-0.022em",
      },
      maxWidth: {
        prose: "70ch",
      },
      boxShadow: {
        // Soft, diffuse Apple-style elevation.
        card: "0 1px 2px 0 rgb(15 19 38 / 0.03), 0 6px 16px -6px rgb(15 19 38 / 0.06)",
        "card-hover": "0 14px 38px -14px rgb(15 19 38 / 0.16)",
        premium: "0 24px 60px -28px rgb(67 56 202 / 0.40)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },
      backgroundImage: {
        "ink-radial":
          "radial-gradient(900px 400px at 78% -10%, rgba(99,102,241,0.28), transparent 60%), radial-gradient(700px 380px at 8% 0%, rgba(79,70,229,0.18), transparent 55%)",
      },
    },
  },
  plugins: [],
};

export default config;
