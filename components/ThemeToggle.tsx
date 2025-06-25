"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          "hover:bg-accent hover:text-accent-foreground",
          "transition-colors duration-200",
          className
        )}
        disabled
      >
        <div className="w-4 h-4" />
      </button>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center",
        "hover:bg-accent hover:text-accent-foreground",
        "transition-all duration-300 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative w-4 h-4">
        <Sun
          className={cn(
            "absolute inset-0 w-4 h-4 transition-all duration-300",
            theme === "dark" 
              ? "rotate-90 scale-0 opacity-0" 
              : "rotate-0 scale-100 opacity-100"
          )}
        />
        <Moon
          className={cn(
            "absolute inset-0 w-4 h-4 transition-all duration-300",
            theme === "dark" 
              ? "rotate-0 scale-100 opacity-100" 
              : "-rotate-90 scale-0 opacity-0"
          )}
        />
      </div>
    </button>
  );
}