import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import tailwindcssLineClamp from "@tailwindcss/line-clamp";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
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
                sans: ["Inter", "system-ui", "sans-serif"],
                heading: ["Playfair Display", "serif"],
                mono: ["JetBrains Mono", "Consolas", "monospace"],
            },
            colors: {
                border: {
                    DEFAULT: "hsl(var(--border))",
                    light: "hsl(var(--border-light))",
                },
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    hover: "hsl(var(--primary-hover))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    hover: "hsl(var(--accent-hover))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                sidebar: {
                    DEFAULT: "hsl(var(--sidebar-background))",
                    foreground: "hsl(var(--sidebar-foreground))",
                    primary: "hsl(var(--sidebar-primary))",
                    "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
                    accent: "hsl(var(--sidebar-accent))",
                    "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
                    border: "hsl(var(--sidebar-border))",
                    ring: "hsl(var(--sidebar-ring))",
                },
                // Learning Portal Specific Colors
                learning: {
                    primary: "hsl(250, 84%, 60%)",
                    secondary: "hsl(142, 76%, 36%)",
                    accent: "hsl(45, 93%, 47%)",
                    success: "hsl(142, 76%, 36%)",
                    warning: "hsl(48, 96%, 53%)",
                    info: "hsl(210, 100%, 60%)",
                    course: "hsl(240, 8%, 8%)",
                    lesson: "hsl(250, 84%, 60%)",
                    progress: "hsl(240, 6%, 15%)",
                },
                // AI Assistant Colors
                ai: {
                    primary: "hsl(270, 95%, 75%)",
                    secondary: "hsl(280, 100%, 85%)",
                    background: "hsl(270, 20%, 8%)",
                    glow: "rgba(139, 92, 246, 0.3)",
                },
                // Crimson Red Variants (replaces Purple)
                crimson: {
                    50: "#fff5f5",
                    100: "#ffe3e3",
                    200: "#ffbdbd",
                    300: "#ff9b9b",
                    400: "#f86a6a",
                    500: "#ef4444",
                    600: "#dc2626",
                    700: "#b91c1c",
                    800: "#991b1b",
                    900: "#7f1d1d",
                    950: "#450a0a",
                },
                // Blue Variants for Learning
                blue: {
                    50: "#eff6ff",
                    100: "#dbeafe",
                    200: "#bfdbfe",
                    300: "#93c5fd",
                    400: "#60a5fa",
                    500: "#3b82f6",
                    600: "#2563eb",
                    700: "#1d4ed8",
                    800: "#1e40af",
                    900: "#1e3a8a",
                    950: "#172554",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            spacing: {
                18: "4.5rem",
                88: "22rem",
                128: "32rem",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0", opacity: "0" },
                    to: {
                        height: "var(--radix-accordion-content-height)",
                        opacity: "1",
                    },
                },
                "accordion-up": {
                    from: {
                        height: "var(--radix-accordion-content-height)",
                        opacity: "1",
                    },
                    to: { height: "0", opacity: "0" },
                },
                "fade-in": {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                "fade-out": {
                    "0%": { opacity: "1", transform: "translateY(0)" },
                    "100%": { opacity: "0", transform: "translateY(10px)" },
                },
                "scale-in": {
                    "0%": { transform: "scale(0.95)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
                "slide-up": {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                "pulse-glow": {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)" },
                    "50%": { boxShadow: "0 0 30px rgba(239, 68, 68, 0.6)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                shimmer: {
                    "100%": { transform: "translateX(100%)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in 0.3s ease-out",
                "fade-out": "fade-out 0.3s ease-out",
                "scale-in": "scale-in 0.2s ease-out",
                "slide-up": "slide-up 0.4s ease-out",
                "pulse-glow": "pulse-glow 2s ease-in-out infinite",
                float: "float 3s ease-in-out infinite",
                shimmer: "shimmer 2s infinite",
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "learning-hero":
                    "linear-gradient(135deg, hsl(240, 10%, 3.9%) 0%, hsl(250, 20%, 8%) 50%, hsl(260, 30%, 12%) 100%)",
            },
            backdropBlur: {
                xs: "2px",
            },
        },
    },
    plugins: [tailwindcssAnimate, tailwindcssLineClamp],
};

export default config;
