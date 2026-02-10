"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-bg-secondary border border-border-color hover:bg-bg-tertiary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-text-muted/20 group"
            aria-label="Toggle theme"
        >
            {/* Sun Icon (Light Mode) */}
            <Sun
                className={`absolute w-5 h-5 transition-all duration-300 ${theme === "light"
                        ? "rotate-0 scale-100 opacity-100"
                        : "rotate-90 scale-0 opacity-0"
                    } text-accent-yellow`}
            />

            {/* Moon Icon (Dark Mode) */}
            <Moon
                className={`absolute w-5 h-5 transition-all duration-300 ${theme === "dark"
                        ? "rotate-0 scale-100 opacity-100"
                        : "-rotate-90 scale-0 opacity-0"
                    } text-accent-blue`}
            />
        </button>
    );
}
