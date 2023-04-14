const grey100 = "#E1E1E6";
const grey200 = "#C4C4CC";
const grey300 = "#8D8D99";
const grey400 = "#7C7C8A";
const grey500 = "#505059";
const grey600 = "#323238";
const grey700 = "#29292E";
const grey800 = "#202024";
const grey900 = "#121214";
const grey950 = "#09090A";

/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "k-kodix-light": "#6A80FF",
        "k-kodix-mid": "#4863F7",
        "k-kodix-dark": "#3249CB",
        "k-kodix-low": "#182049",
        "k-discover-light": "#6A80FF",
        "k-discover-mid": "#4863F7",
        "k-discover-dark": "#3249CB",
        "k-discover-low": "#182049",
        "k-ignite-light": "#00B37E",
        "k-ignite-mid": "#00875F",
        "k-ignite-dark": "#015F43",
        "k-ignite-low": "#00291D",
        "k-ec-light": "#FC4737",
        "k-ec-mid": "#D73628",
        "k-ec-dark": "#AD1E12",
        "k-ec-low": "#42110D",
        "k-success-light": "#04D361",
        "k-success-base": "#1B873F",
        "k-success-low": "#051B0D",
        "k-danger-light": "#F75A68",
        "k-danger-base": "#CC2937",
        "k-danger-low": "#2D090C",
        "k-warning-light": "#FBA94C",
        "k-warning-base": "#EB8A1D",
        "k-warning-low": "#2E1B06",
        "k-new-light": "#1EF7D0",
        "k-new-base": "#07847E",
        "k-new-low": "#163840",
        "k-white": "#FFFFFF",
        "k-black": "#000000",

        "k-text-title": grey100,
        "k-grey-100": grey100,

        "k-text-base": grey200,
        "k-grey-200": grey200,

        "k-grey-300": grey300,
        "k-text-support": grey300,

        "k-grey-400": grey400,
        "k-placeholder": grey400,

        "k-grey-500": grey500,
        "k-inputs-icons": grey500,

        "k-grey-600": grey600,
        "k-shape-tertiary": grey600,

        "k-grey-700": grey700,
        "k-shape-secondary": grey700,

        "k-grey-800": grey800,
        "k-shape-primary": grey800,

        "k-grey-900": grey900,
        "k-color-background": grey900,

        "k-grey-950": grey950,
      },
    },
  },
  plugins: [],
};

module.exports = config;
