"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-9 h-9 rounded-[var(--border-radius-md)] bg-background-secondary border border-border-tertiary hover:bg-background-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-text-secondary/10 group overflow-hidden"
            aria-label="Toggle theme"
        >
            {/* Sun Icon (Light Mode) */}
            <Sun
                className={`absolute w-4.5 h-4.5 transition-all duration-500 ${theme === "light"
                        ? "translate-y-0 opacity-100 rotate-0"
                        : "translate-y-10 opacity-0 rotate-45"
                    } text-[#CC785C]`}
            />

            {/* Moon Icon (Dark Mode) */}
            <Moon
                className={`absolute w-4.5 h-4.5 transition-all duration-500 ${theme === "dark"
                        ? "translate-y-0 opacity-100 rotate-0"
                        : "-translate-y-10 opacity-0 -rotate-45"
                    } text-text-primary`}
            />
        </button>
    );
}

