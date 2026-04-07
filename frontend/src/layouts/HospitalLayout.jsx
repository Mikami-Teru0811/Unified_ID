import { Outlet } from "react-router-dom";
import HospitalSidebar from "../components/hospital/HospitalSidebar";
import HospitalHeader from "../components/hospital/HospitalHeader";
import SessionTimeout from "../components/SessionTimeout";
import OfflineStatus from "../components/OfflineStatus";

export default function HospitalLayout() {
    return (
        <div className="flex h-screen bg-white dark:bg-slate-950">
            <HospitalSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <HospitalHeader />
                <SessionTimeout />
                <OfflineStatus />
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
