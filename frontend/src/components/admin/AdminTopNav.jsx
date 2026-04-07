import { useAuth } from "../../auth/AuthProvider";
import ThemeToggle from "../ThemeToggle";

export default function AdminTopNav() {
    const { user, logout } = useAuth();

    return (
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4 text-slate-900 dark:border-slate-800 dark:bg-[#0f172a] dark:text-white">
            <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-slate-400 lg:hidden">menu</span>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Management Intelligence</h2>
            </div>
            <div className="flex items-center gap-4">
                <ThemeToggle className="border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800" />
                <button
                    onClick={logout}
                    className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-all hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                >
                    <span className="material-symbols-outlined text-base">logout</span>
                    Logout
                </button>
                <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name || "System Admin"}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">Master Root Access</p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-500">
                    <span className="material-symbols-outlined">admin_panel_settings</span>
                </div>
            </div>
        </header>
    );
}
