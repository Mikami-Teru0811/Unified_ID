import { Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import SessionTimeout from "../components/SessionTimeout";
import ThemeToggle from "../components/ThemeToggle";

export default function MedicalShopLayout() {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <SessionTimeout />

            {/* HEADER */}
            <header className="fixed top-0 w-full z-50 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined font-bold">medical_services</span>
                        </div>
                        <div>
                            <span className="font-bold text-slate-900 dark:text-white text-lg block leading-none">Medical Hub</span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Authorized Dispenser</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle className="border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" />
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-500 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-all border border-red-100 dark:border-red-900/20"
                        >
                            <span className="material-symbols-outlined text-sm">logout</span>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="pt-24 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
}
