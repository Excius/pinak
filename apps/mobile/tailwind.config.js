/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary Gold palette - refined metallic gold
        primary: {
          DEFAULT: "#C9A962", // Main gold
          light: "#D4BA7A", // Light gold
          dark: "#A68B4A", // Dark gold
          50: "#FCF9F0",
          100: "#F7F0DC",
          200: "#ECDCB0",
          300: "#DFC785",
          400: "#D4BA7A",
          500: "#C9A962",
          600: "#A68B4A",
          700: "#856E3B",
          800: "#64522C",
          900: "#43371D",
        },

        // Background blacks - deep, luxurious blacks
        background: {
          DEFAULT: "#0A0A0A", // Primary black background
          light: "#121212", // Slightly lighter black
          dark: "#050505", // Pure deep black
          elevated: "#1A1A1A", // Elevated surface
        },

        // Surface colors - for cards, modals, etc.
        surface: {
          DEFAULT: "#1A1A1A", // Card/surface background
          light: "#242424", // Lighter surface
          dark: "#0F0F0F", // Darker surface
          border: "#2A2A2A", // Border on dark surfaces
        },

        // Text colors
        text: {
          primary: "#FFFFFF", // Primary text (white on dark)
          secondary: "#B8B8B8", // Secondary text (muted)
          muted: "#8B8B8B", // Muted/disabled text (improved contrast)
          gold: "#C9A962", // Gold accent text
        },

        // Accent colors
        accent: {
          gold: "#C9A962",
          bronze: "#CD7F32",
          champagne: "#F7E7CE",
          cream: "#FFFDD0",
        },

        // Status colors (adapted for dark theme)
        success: {
          DEFAULT: "#22C55E",
          dark: "#166534",
          light: "#86EFAC",
        },
        error: {
          DEFAULT: "#EF4444",
          dark: "#991B1B",
          light: "#FCA5A5",
        },
        warning: {
          DEFAULT: "#F59E0B",
          dark: "#92400E",
          light: "#FCD34D",
        },

        // Legacy colors (for backwards compatibility)
        "primary-dark": "#A68B4A",
        "background-light": "#0A0A0A",
        "surface-light": "#1A1A1A",
        blush: "#2A1A1A",
        whatsapp: "#25D366",
        "muted-taupe": "#8A8A8A",
        "soft-border": "#2A2A2A",
      },
      fontFamily: {
        display: "System",
        body: "System",
        serif: "System",
        sans: "System",
      },
      borderRadius: {
        DEFAULT: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        gold: "0 4px 14px 0 rgba(201, 169, 98, 0.25)",
        "gold-lg": "0 10px 25px -3px rgba(201, 169, 98, 0.25)",
      },
    },
  },
  plugins: [],
};
