"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-md border border-border bg-muted animate-pulse" />
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      id="theme-toggle"
      aria-label={theme === "dark" ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
      onClick={toggle}
      className="rounded-xl"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-primary" />
      ) : (
        <Moon className="w-4 h-4 text-muted-foreground" />
      )}
    </Button>
  );
}
