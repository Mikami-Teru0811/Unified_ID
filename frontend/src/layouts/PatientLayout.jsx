import { Outlet } from "react-router-dom";
import PatientTopNav from "../components/patient/PatientTopNav";
import PatientSidebar from "../components/patient/PatientSidebar";

export default function PatientLayout() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a1110]">
            <PatientTopNav />
            <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-6 p-4 md:p-10">
                <PatientSidebar />
                <main className="flex-1 min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
