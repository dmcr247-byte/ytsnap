import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E62117",
          hover: "#C91910",
          light: "#FEE2E2",
          dark: "#991B1B",
        },
        secondary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          light: "#DBEAFE",
          dark: "#1E40AF",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#0F172A",
          muted: "#F8FAFC",
          "muted-dark": "#1E293B",
        },
        border: {
          light: "#E2E8F0",
          dark: "#334155",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
