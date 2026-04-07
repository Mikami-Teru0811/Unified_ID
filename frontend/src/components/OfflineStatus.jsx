import { useState, useEffect, useCallback } from "react";
import { getPendingScans } from "../services/db.service";

const POLLING_INTERVAL = 30 * 1000; // 30 seconds (optimized from 5s)

export default function OfflineStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingCount, setPendingCount] = useState(0);

    const checkPendingScans = useCallback(async () => {
        if (navigator.onLine) {
            const pending = await getPendingScans();
            setPendingCount(pending.length);
        }
    }, []);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            checkPendingScans();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Initial check (deferred to avoid setState in effect body)
        const timer = setTimeout(checkPendingScans, 0);

        // Optimized polling interval (30 seconds)
        const interval = setInterval(checkPendingScans, POLLING_INTERVAL);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [checkPendingScans]);

    if (isOnline && pendingCount === 0) return null;

    return (
        <div className={`fixed bottom-8 right-8 z-[100] p-4 rounded-3xl shadow-2xl flex items-center gap-4 border transition-all animate-in slide-in-from-bottom-10
      ${isOnline ? "bg-white dark:bg-slate-900 border-green-500/20" : "bg-orange-500 text-white border-orange-400"}
    `}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
        ${isOnline ? "bg-green-100 text-green-600" : "bg-white/20"}
      `}>
                <span className="material-symbols-outlined font-black">
                    {isOnline ? "cloud_done" : "cloud_off"}
                </span>
            </div>

            <div>
                <p className={`text-xs font-black uppercase tracking-widest leading-none mb-1 ${isOnline ? "text-slate-400" : "text-white/80"}`}>
                    {isOnline ? "System Online" : "Disconnected Mode"}
                </p>
                <p className="text-sm font-bold">
                    {pendingCount > 0
                        ? `${pendingCount} Clinical Scans Pending Sync`
                        : "Real-time Link Active"}
                </p>
            </div>

            {!isOnline && (
                <div className="w-2 h-2 bg-white rounded-full animate-ping ml-2"></div>
            )}
        </div>
    );
}
