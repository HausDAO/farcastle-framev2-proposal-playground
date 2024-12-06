import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        raisinBlack: "#17151F",
        darkPurple: "#341A34",
        aliceBlue: "#00B1CC",
        moonstone: "#EAF8FF",
        rasedaGreen: "#707C4E",
        rustyRed: "#CD4A50",
      },
    },
  },
  plugins: [],
} satisfies Config;
