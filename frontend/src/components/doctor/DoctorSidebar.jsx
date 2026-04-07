import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";

export default function Sidebar() {
    const { logout } = useAuth();

    return (
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-3 text-primary mb-10">
                    <span className="material-symbols-outlined text-3xl">contactless</span>
                    <span className="font-bold text-xl">NFC Viewer</span>
                </div>

                <nav className="space-y-4">
                    <NavLink
                        to="/doctor"
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                ? "bg-primary/10 text-primary font-bold"
                                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`
                        }
                    >
                        <span className="material-symbols-outlined">dashboard</span>
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/doctor/history"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                ? "bg-primary/10 text-primary font-bold"
                                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`
                        }
                    >
                        <span className="material-symbols-outlined">history</span>
                        <span>Patient History</span>
                    </NavLink>
                </nav>
            </div>

            <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all font-semibold"
            >
                <span className="material-symbols-outlined">logout</span>
                <span>Logout</span>
            </button>
        </aside>
    );
}
