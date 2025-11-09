import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f6ff",
          100: "#dce7ff",
          200: "#b7ceff",
          300: "#8eb3ff",
          400: "#5a8eff",
          500: "#2f6aff",
          600: "#1c50db",
          700: "#163eb0",
          800: "#142f85",
          900: "#11256a"
        }
      }
    }
  },
  plugins: []
};

export default config;
