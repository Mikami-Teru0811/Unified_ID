import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopNav from "../components/admin/AdminTopNav";

export default function AdminLayout() {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-900 dark:bg-[#0a0f1c] dark:text-white">
            <AdminSidebar />
            <div className="flex flex-col flex-1">
                <AdminTopNav />
                <main className="flex-1 overflow-y-auto p-8 lg:p-12">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
