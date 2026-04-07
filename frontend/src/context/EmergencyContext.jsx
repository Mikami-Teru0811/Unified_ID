import { createContext, useContext, useState, useEffect } from "react";

const EmergencyContext = createContext();

export const EmergencyProvider = ({ children }) => {
    const [emergency, setEmergency] = useState(null); // { active: true, by: user, startedAt: Date.now() }
    const resetEmergency = () => setEmergency(null);

    // Auto-expire rule (MANDATORY)
    useEffect(() => {
        if (!emergency) return;

        const timer = setTimeout(() => {
            setEmergency(null);
        }, 15 * 60 * 1000); // 15 minutes

        return () => clearTimeout(timer);
    }, [emergency]);

    return (
        <EmergencyContext.Provider value={{ emergency, setEmergencySession: setEmergency, resetEmergency }}>
            {children}
        </EmergencyContext.Provider>
    );
};

export const useEmergency = () => {
    const context = useContext(EmergencyContext);
    if (!context) {
        throw new Error("useEmergency must be used within an EmergencyProvider");
    }
    return context;
};
