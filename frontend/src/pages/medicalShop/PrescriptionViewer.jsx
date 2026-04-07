import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;
const REQUEST_TIMEOUT = 30000;

const createApiInstance = () => {
    const instance = axios.create({
        baseURL: baseURL ? `${baseURL}/api` : undefined,
        timeout: REQUEST_TIMEOUT,
    });

    instance.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

export default function PrescriptionViewer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const urlRef = useRef(null);
    const api = createApiInstance();

    useEffect(() => {
        let isMounted = true;

        const fetchPdf = async () => {
            if (!id) {
                setError("No prescription ID provided");
                setLoading(false);
                return;
            }

            try {
                const decodedId = decodeURIComponent(id);
                const response = await api.get(
                    `/medical-shop/prescriptions/${encodeURIComponent(decodedId)}/pdf`,
                    { responseType: "blob" }
                );

                if (!isMounted) return;
                const url = URL.createObjectURL(response.data);
                urlRef.current = url;
                setPdfUrl(url);
            } catch (err) {
                if (!isMounted) return;
                console.error("PDF Fetch failed:", err);

                if (err.response?.status === 401) {
                    setError("UNAUTHORIZED");
                    toast.error("Session expired. Please login again from the medical shop dashboard.");
                } else if (err.response?.status === 403) {
                    setError("PERMISSION_DENIED");
                    toast.error("You don't have permission to view this prescription.");
                } else if (err.response?.status === 404) {
                    setError("NOT_FOUND");
                    toast.error("Prescription not found.");
                } else {
                    setError("LOAD_FAILED");
                    toast.error("Failed to load prescription. Please try again.");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchPdf();

        return () => {
            isMounted = false;
            if (urlRef.current) {
                URL.revokeObjectURL(urlRef.current);
                urlRef.current = null;
            }
        };
    }, [id]);

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-bold animate-pulse">Decrypting Prescription...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-8">
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-red-500 text-5xl">
                        {error === "UNAUTHORIZED" ? "lock" :
                         error === "PERMISSION_DENIED" ? "gpp_bad" :
                         error === "NOT_FOUND" ? "search_off" : "error"}
                    </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                    {error === "UNAUTHORIZED" ? "Session Expired" :
                     error === "PERMISSION_DENIED" ? "Access Denied" :
                     error === "NOT_FOUND" ? "Not Found" : "Error Loading PDF"}
                </h2>
                <p className="text-slate-500 text-center max-w-md mb-8">
                    {error === "UNAUTHORIZED" ? "Your session has expired. Please return to the medical shop dashboard and re-scan the patient card." :
                     error === "PERMISSION_DENIED" ? "You don't have the required permissions to view this prescription." :
                     error === "NOT_FOUND" ? "The requested prescription could not be found in the system." :
                     "There was a problem loading the prescription. Please try again."}
                </p>
                <button
                    onClick={() => navigate("/medical-shop")}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <header className="px-8 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center shrink-0">
                <div>
                    <h1 className="font-bold text-slate-900 dark:text-white">
                        Pharmacy Dispensing View - SECURE PDF
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Authorized Pharmacist Access - ID: {decodeURIComponent(id || '')}
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Encrypted Stream
                </div>
            </header>

            <div className="flex-1 bg-slate-100 dark:bg-slate-800 p-4">
                {pdfUrl ? (
                    <iframe
                        src={pdfUrl}
                        className="w-full h-full rounded-2xl shadow-2xl border dark:border-slate-700"
                        title="Prescription PDF"
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 font-bold">
                        Failed to load prescription document.
                    </div>
                )}
            </div>
        </div>
    );
}
