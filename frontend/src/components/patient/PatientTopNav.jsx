import { useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import ThemeToggle from "../ThemeToggle";

export default function TopNav() {
    const { user, logout } = useAuth();
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = () => {
        logout();
        window.location.href = "/";
    };

    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-[#11221f] border-b border-slate-200 dark:border-emerald-900/30 px-6 py-4 backdrop-blur-md bg-white/80 dark:bg-[#11221f]/80">
            <div className="flex justify-between items-center max-w-[1200px] mx-auto">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600">health_metrics</span>
                    <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-emerald-50">SmartID Patient</span>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-emerald-200/60">
                    <ThemeToggle className="border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-emerald-900/30 dark:bg-[#16302c] dark:text-emerald-100 dark:hover:bg-[#1b3833]" />
                    
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-emerald-900/20 rounded-lg px-2 py-1 transition-colors"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="font-bold text-slate-800 dark:text-emerald-50">{user?.name || "Patient"}</p>
                                <p className="text-[10px] uppercase tracking-widest opacity-60">ID #{user?.id?.substring(0, 8)}</p>
                            </div>
                            <div className="size-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {user?.name?.charAt(0) || "P"}
                            </div>
                            <span className="material-symbols-outlined">expand_more</span>
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-20">
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">logout</span>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
