import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle({ className = "", label = false }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition-all ${className}`.trim()}
        >
            <span className="material-symbols-outlined text-base">{isDark ? "light_mode" : "dark_mode"}</span>
            {label ? <span>{isDark ? "Light" : "Dark"}</span> : null}
        </button>
    );
}
