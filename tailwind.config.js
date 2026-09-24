/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#14241d",
          muted: "#5a6b62",
        },
        sage: {
          DEFAULT: "#2f6a55",
          hover: "#265a48",
        },
        cream: {
          DEFAULT: "#f3eee6",
          card: "#fbf8f3",
        },
        sand: "#e4dcd0",
      },
      fontFamily: {
        sans: ['"Source Sans 3"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
      boxShadow: {
        lift: "0 1px 0 rgba(20,36,29,0.04), 0 18px 40px -24px rgba(20,36,29,0.28)",
      },
    },
  },
  plugins: [],
};
