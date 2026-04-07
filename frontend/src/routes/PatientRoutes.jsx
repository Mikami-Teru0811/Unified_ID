import { Routes, Route } from "react-router-dom";
import PatientLayout from "../layouts/PatientLayout";
import Dashboard from "../pages/patient/Dashboard";
import AuditLog from "../pages/patient/AuditLog";
import InsuranceSchemes from "../pages/patient/InsuranceSchemes";
import { useAuth } from "../auth/AuthProvider";
import { ROLES } from "../utils/roles";
import { Navigate } from "react-router-dom";

function RequirePatient({ children }) {
    const { user } = useAuth();
    if (!user || user.role !== ROLES.PATIENT) {
        return <div className="p-10 text-center text-red-500 font-bold">Unauthorized Patient Access</div>;
    }
    return children;
}

export default function PatientRoutes() {
    return (
        <RequirePatient>
            <Routes>
                <Route element={<PatientLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="audit-log" element={<AuditLog />} />
                    <Route path="insurance" element={<InsuranceSchemes />} />
                </Route>
            </Routes>
        </RequirePatient>
    );
}
