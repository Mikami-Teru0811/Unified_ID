import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { useSession } from "../../context/SessionContext";

export default function HospitalSidebar() {
    const { logout } = useAuth();
    const { patient } = useSession();

    return (
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between h-screen">
            <div>
                <div className="flex items-center gap-3 text-primary mb-10">
                    <span className="material-symbols-outlined text-3xl text-[#2d5a52]">contactless</span>
                    <span className="font-bold text-xl text-[#2d5a52]">Hospital Admin</span>
                </div>

                <nav className="space-y-4">
                    <NavLink
                        to="/hospital"
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

                    {/* Placeholder for future hospital specific routes */}
                    <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Management
                    </div>

                    <NavLink
                        to="/hospital/register"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                ? "bg-primary/10 text-primary font-bold"
                                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`
                        }
                    >
                        <span className="material-symbols-outlined">group</span>
                        <span>Register Patient</span>
                    </NavLink>

                    <NavLink
                        to="/hospital/clinical-note/auth"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                ? "bg-primary/10 text-primary font-bold"
                                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`
                        }
                    >
                        <span className="material-symbols-outlined">badge</span>
                        <span>Consent Workflow</span>
                    </NavLink>
                </nav>

                {patient && (
                    <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-2xl animate-in slide-in-from-left-4 duration-300">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="size-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-sm">person</span>
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{patient.name}</p>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Active Session</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                                <span className="text-slate-400 font-bold uppercase">ID</span>
                                <span className="text-slate-700 dark:text-slate-300 font-mono">{patient.id}</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                                <span className="text-slate-400 font-bold uppercase">Location</span>
                                <span className="text-slate-700 dark:text-slate-300">{patient.location}</span>
                            </div>
                        </div>
                    </div>
                )}
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
