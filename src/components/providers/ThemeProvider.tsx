"use client";

import { createContext, useContext, useCallback, useState } from "react";

type Theme = "dark" | "light";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}>({ theme: "dark", setTheme: () => {}, toggle: () => {} });

interface ThemeProviderProps {
  children: React.ReactNode;
  /** The theme pre-determined by the server (from cookie). */
  initialTheme: Theme;
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);

    // Apply to DOM
    const html = document.documentElement;
    html.classList.remove("dark", "light");
    html.classList.add(t);

    // Persist as cookie (1 year) so SSR reads it on next request
    document.cookie = `exchange286-theme=${t};path=/;max-age=31536000;SameSite=Lax`;
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
