"use client"

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [isDark, setIsDark] = useState<boolean>(theme === 'dark');

  useEffect(() => {
    setIsDark(theme === 'dark');
  }, [theme]);

  const onToggle = () => {
    toggleTheme();
    setIsDark(!isDark);
  };

  return (
    <div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300",
        isDark
          ? "bg-primary/20 border border-primary/30"
          : "bg-background border border-border",
        className
      )}
      onClick={onToggle}
      role="button"
      tabIndex={0}
    >
      <div className="flex justify-between items-center w-full">
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
            isDark
              ? "transform translate-x-0 bg-primary"
              : "transform translate-x-8 bg-secondary"
          )}
        >
          {isDark ? (
            <Moon 
              className="w-4 h-4 text-primary-foreground" 
              strokeWidth={1.5}
            />
          ) : (
            <Sun 
              className="w-4 h-4 text-secondary-foreground" 
              strokeWidth={1.5}
            />
          )}
        </div>
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
            isDark
              ? "bg-transparent"
              : "transform -translate-x-8"
          )}
        >
          {isDark ? (
            <Sun 
              className="w-4 h-4 text-muted-foreground" 
              strokeWidth={1.5}
            />
          ) : (
            <Moon 
              className="w-4 h-4 text-muted-foreground" 
              strokeWidth={1.5}
            />
          )}
        </div>
      </div>
    </div>
  );
}
