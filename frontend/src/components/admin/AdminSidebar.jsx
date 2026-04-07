import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${isActive
            ? "border-l-4 border-emerald-500 bg-emerald-500/10 font-bold text-emerald-600 shadow-lg shadow-emerald-500/5 dark:text-emerald-500"
            : "text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
        }`;

    return (
        <aside className="flex w-72 flex-col gap-8 border-r border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-[#0f172a]">
            <div className="flex items-center gap-3 px-2">
                <div className="size-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                    <span className="material-symbols-outlined text-white">shield_with_heart</span>
                </div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Health<span className="text-emerald-500">Sync</span></h1>
            </div>

            <nav className="flex flex-col gap-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-2">System Control</p>
                <NavLink to="/admin/users" className={linkClass}>
                    <span className="material-symbols-outlined">group</span>
                    User Management
                </NavLink>
                <NavLink to="/admin/permissions" className={linkClass}>
                    <span className="material-symbols-outlined">rule_settings</span>
                    Role Permissions
                </NavLink>
            </nav>

            <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">System Health</p>
                <div className="flex items-center gap-2 mb-2">
                    <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">API Gateway Online</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="size-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">DB Records Encrypted</span>
                </div>
            </div>
        </aside>
    );
}
