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
        background: "#0A0A0F",
        card: "#12121A",
        border: "#1E1E2E",
        primary: "#6366F1",
        secondary: "#8B5CF6",
        muted: "#A1A1AA"
      },
    },
  },
  plugins: [],
};
export default config;
