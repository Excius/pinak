/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#b08d55",
        "primary-dark": "#8c6b3d",
        "background-light": "#FFF9F5",
        "surface-light": "#FFFFFF",
        "blush": "#FFF0F0",
        "whatsapp": "#25D366",
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
    },
  },
  plugins: [],
};
