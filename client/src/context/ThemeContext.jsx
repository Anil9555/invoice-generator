import React, { createContext,
   useContext,
  useEffect,
   useState,
} from "react";

const ThemeContext = createContext();

const THEME_STORAGE_KEY = "invoicepro-theme";

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    return savedTheme || "light";
  });

  /* Save selected theme */
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  /* Apply theme globally */
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      if (theme === "dark") {
        root.setAttribute("data-theme", "dark");
        return;
      }

      if (theme === "light") {
        root.setAttribute("data-theme", "light");
        return;
      }

      /* System theme */
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;

      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    };

    applyTheme();

    /* Listen for system theme changes */
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleSystemThemeChange = () => {
        applyTheme();
      };

      mediaQuery.addEventListener("change", handleSystemThemeChange);

      return () => {
        mediaQuery.removeEventListener("change", handleSystemThemeChange);
      };
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
