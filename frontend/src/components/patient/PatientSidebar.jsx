import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";

export default function Sidebar() {
    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
            ? "bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/20"
            : "text-slate-500 dark:text-emerald-200/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
        }`;

    return (
        <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white dark:bg-[#11221f] rounded-2xl p-4 border border-slate-200 dark:border-emerald-900/20 shadow-sm sticky top-24">
                <nav className="flex flex-col gap-2">
                    <NavLink to="/patient/dashboard" className={linkClass}>
                        <span className="material-symbols-outlined text-xl">medical_information</span>
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/patient/audit-log" className={linkClass}>
                        <span className="material-symbols-outlined text-xl">history_edu</span>
                        <span>Audit Log</span>
                    </NavLink>
                    <NavLink to="/patient/insurance" className={linkClass}>
                        <span className="material-symbols-outlined text-xl">policy</span>
                        <span>Insurance Schemes</span>
                    </NavLink>
                </nav>

                <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Support</p>
                    <button
                        type="button"
                        onClick={() => toast("Help center is not available yet. Please contact your hospital administrator or support team.")}
                        className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-emerald-200/60 hover:text-emerald-600 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">help</span>
                        Help Center
                    </button>
                </div>
            </div>
        </aside>
    );
}
