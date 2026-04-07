import { Routes, Route } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { ROLES } from "../utils/roles";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import UserManagement from "../pages/admin/UserManagement";
import Permissions from "../pages/admin/Permissions";

export default function AdminRoutes() {
    const { user } = useAuth();
    
    if (import.meta.env.DEV) {
        console.log("AdminRoutes Mounting. Role:", user?.role);
    }

    if (!user || user.role !== ROLES.ADMIN) {
        return (
            <div className="p-20 text-white bg-red-900 font-bold text-center">
                <h1 className="text-4xl mb-4">ACCESS DENIED</h1>
                <p>Required: {ROLES.ADMIN} | Current: {user?.role || "NOT_LOGGED_IN"}</p>
                <a href="/" className="mt-8 inline-block bg-white text-red-900 px-6 py-2 rounded-xl">Return to Safety</a>
            </div>
        );
    }

    return (
        <Routes>
            <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="permissions" element={<Permissions />} />
            </Route>
        </Routes>
    );
}
