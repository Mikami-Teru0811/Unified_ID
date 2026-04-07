import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useAuth } from "../auth/AuthProvider";

const ThemeContext = createContext(null);

const ROLE_THEME_PREFIX = "theme:";

const getThemeKey = (role) => (role ? `${ROLE_THEME_PREFIX}${role}` : null);

const readRoleTheme = (role) => {
    if (!role || typeof window === "undefined") {
        return "light";
    }

    const storedTheme = localStorage.getItem(getThemeKey(role));
    return storedTheme === "dark" ? "dark" : "light";
};

const applyTheme = (theme) => {
    if (typeof document === "undefined") {
        return;
    }

    document.documentElement.classList.toggle("dark", theme === "dark");
};

export function ThemeProvider({ children }) {
    const { user } = useAuth();
    const role = user?.role || null;
    const theme = readRoleTheme(role);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        const newTheme = theme === "dark" ? "light" : "dark";
        if (role) {
            localStorage.setItem(getThemeKey(role), newTheme);
        }
        applyTheme(newTheme);
    }, [theme, role]);

    const setTheme = useCallback((newTheme) => {
        if (typeof newTheme === "function") {
            newTheme = newTheme(theme);
        }
        if (role) {
            localStorage.setItem(getThemeKey(role), newTheme);
        }
        applyTheme(newTheme);
    }, [theme, role]);

    const value = useMemo(() => ({
        theme,
        role,
        setTheme,
        toggleTheme,
    }), [theme, role, setTheme, toggleTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider");
    }

    return context;
}
