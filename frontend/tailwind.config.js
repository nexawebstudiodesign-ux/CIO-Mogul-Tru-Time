/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f3f7ff",
          100: "#e3ecff",
          200: "#c7d9ff",
          300: "#9fb9ff",
          400: "#6f94ff",
          500: "#466cf6",
          600: "#334ed1",
          700: "#2a40a6",
          800: "#253783",
          900: "#1f2c61",
        },
        ink: {
          500: "#0e1726",
          400: "#1b2536",
          300: "#2a3648",
        },
        sand: {
          50: "#fbf8f3",
          100: "#f4efe7",
          200: "#e6ddcc",
        },
      },
      boxShadow: {
        lift: "0 20px 50px -25px rgba(15, 23, 42, 0.45)",
      },
    },
  },
  plugins: [],
}

