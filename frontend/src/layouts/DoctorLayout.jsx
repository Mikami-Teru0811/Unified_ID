import DoctorSidebar from "../components/doctor/DoctorSidebar";
import { Outlet } from "react-router-dom";
import SessionTimeout from "../components/SessionTimeout";
import OfflineStatus from "../components/OfflineStatus";
import ThemeToggle from "../components/ThemeToggle";

export default function DoctorLayout() {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            <DoctorSidebar role="doctor" />
            <SessionTimeout />
            <OfflineStatus />
            <main className="flex-1 overflow-auto p-8 lg:p-12">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6 flex justify-end">
                        <ThemeToggle className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800" label />
                    </div>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
