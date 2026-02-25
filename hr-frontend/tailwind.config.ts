import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "IBM Plex Sans Thai", "sans-serif"],
        heading: ["Inter", "IBM Plex Sans Thai", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border) / 1)",
        input: "hsl(var(--input) / 1)",
        ring: "hsl(var(--ring) / 1)",
        background: "hsl(var(--background) / 1)",
        foreground: "hsl(var(--foreground) / 1)",
        primary: {
          DEFAULT: "hsl(var(--primary) / 1)",
          foreground: "hsl(var(--primary-foreground) / 1)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / 1)",
          foreground: "hsl(var(--secondary-foreground) / 1)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / 1)",
          foreground: "hsl(var(--destructive-foreground) / 1)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / 1)",
          foreground: "hsl(var(--muted-foreground) / 1)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / 1)",
          foreground: "hsl(var(--accent-foreground) / 1)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / 1)",
          foreground: "hsl(var(--popover-foreground) / 1)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / 1)",
          foreground: "hsl(var(--card-foreground) / 1)",
        },
        success: {
          DEFAULT: "hsl(var(--success) / 1)",
          foreground: "hsl(var(--success-foreground) / 1)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning) / 1)",
          foreground: "hsl(var(--warning-foreground) / 1)",
        },
        info: {
          DEFAULT: "hsl(var(--info) / 1)",
          foreground: "hsl(var(--info-foreground) / 1)",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background) / 1)",
          foreground: "hsl(var(--sidebar-foreground) / 1)",
          primary: "hsl(var(--sidebar-primary) / 1)",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground) / 1)",
          accent: "hsl(var(--sidebar-accent) / 1)",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground) / 1)",
          border: "hsl(var(--sidebar-border) / 1)",
          ring: "hsl(var(--sidebar-ring) / 1)",
          muted: "hsl(var(--sidebar-muted) / 1)",
        },
        chart: {
          "1": "hsl(var(--chart-1) / 1)",
          "2": "hsl(var(--chart-2) / 1)",
          "3": "hsl(var(--chart-3) / 1)",
          "4": "hsl(var(--chart-4) / 1)",
          "5": "hsl(var(--chart-5) / 1)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
