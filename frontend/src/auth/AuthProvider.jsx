import { createContext, useContext, useState } from "react";
import tokenService from "../services/token.service";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext(null);

const hydrateUserFromToken = () => {
    const token = tokenService.get();
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        if (!decoded?.id || !decoded?.role) {
            tokenService.clear();
            return null;
        }
        return {
            id: decoded.id,
            role: decoded.role,
            patientId: decoded.patientId || null,
            name: decoded.name || null,
            username: decoded.username || null,
            phone: decoded.phone || null
        };
    } catch (err) {
        console.error("Token decoding failed:", err);
        tokenService.clear();
        return null;
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => hydrateUserFromToken());

    const login = (token) => {
        tokenService.set(token);
        const decodedUser = hydrateUserFromToken();
        setUser(decodedUser);
        if (import.meta.env.DEV) {
            console.log("AuthProvider: Login successful", decodedUser);
        }
        return decodedUser; // Returning user for immediate navigation
    };

    const logout = () => {
        tokenService.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading: false }}>
            {children}
        </AuthContext.Provider>
    );
}

function useAuth() {
    return useContext(AuthContext);
}

export default AuthProvider;
export { useAuth };
