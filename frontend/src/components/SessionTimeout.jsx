import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "../auth/AuthProvider";

const TIMEOUT = 15 * 60 * 1000; // 15 minutes
const DEBOUNCE_DELAY = 1000; // 1 second debounce

export default function SessionTimeout() {
    const { logout } = useAuth();
    const timerRef = useRef(null);
    const debounceRef = useRef(null);

    const resetTimer = useCallback(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        
        debounceRef.current = setTimeout(() => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            timerRef.current = setTimeout(logout, TIMEOUT);
        }, DEBOUNCE_DELAY);
    }, [logout]);

    useEffect(() => {
        // Start initial timer
        timerRef.current = setTimeout(logout, TIMEOUT);

        // Throttled event listeners
        const handleActivity = () => resetTimer();

        // Use passive listeners for better performance
        window.addEventListener("mousemove", handleActivity, { passive: true });
        window.addEventListener("keydown", handleActivity, { passive: true });
        window.addEventListener("click", handleActivity, { passive: true });
        window.addEventListener("scroll", handleActivity, { passive: true });

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            window.removeEventListener("mousemove", handleActivity);
            window.removeEventListener("keydown", handleActivity);
            window.removeEventListener("click", handleActivity);
            window.removeEventListener("scroll", handleActivity);
        };
    }, [logout, resetTimer]);

    return null;
}
