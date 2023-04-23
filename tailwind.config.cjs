// eslint-disable-next-line @typescript-eslint/no-var-requires
const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#1d283a",
        input: "1d283a",
        ring: "#1d283a",
        background: "#ffffff",
        foreground: "#0f172a",
        primary: {
          DEFAULT: "#f8fafc",
          foreground: "#020205",
        },
        secondary: {
          DEFAULT: "#0f172a",
          foreground: "#f8fafc",
        },
        destructive: {
          DEFAULT: "#811d1d",
          foreground: "#f8fafc",
        },
        muted: {
          DEFAULT: "#0f1629",
          foreground: "#7f8ea3",
        },
        accent: {
          DEFAULT: "#1d283a",
          foreground: "#f8fafc",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#94a3b8",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
      },
      borderRadius: {
        lg: `0.5rem`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
      // fontFamily: {
      //   sans: ["var(--font-sans)", ...fontFamily.sans],
      // },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
