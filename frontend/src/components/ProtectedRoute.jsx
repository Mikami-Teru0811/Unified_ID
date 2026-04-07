import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import Loader from "./Loader";

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) return <Loader />;

    if (!user) return <Navigate to="/" replace />;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}
