import { useEffect, useState } from "react";
import patientApi from "../../services/patient.api";
import toast from "react-hot-toast";

export default function Dashboard() {
    const [emr, setEmr] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        patientApi.getPatientEMR()
            .then(res => {
                setEmr(res);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load EMR:", err);
                setError("Unable to load medical records. Please try again.");
                setLoading(false);
            });
    }, []);

    const downloadPDF = async (type) => {
        setExporting(true);
        try {
            const blob = type === 'profile' 
                ? await patientApi.exportProfilePDF()
                : await patientApi.exportMedicalHistoryPDF();
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = type === 'profile' ? 'smart-id-profile.pdf' : 'smart-id-medical-history.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('PDF downloaded successfully');
        } catch (err) {
            console.error('PDF export failed:', err);
            toast.error('Failed to export PDF. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin size-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center p-20">
            <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
                <p className="text-slate-500 font-medium">{error}</p>
            </div>
        </div>
    );

    const visits = emr?.visits || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-emerald-50">Medical History</h1>
                <div className="flex gap-3">
                    <button 
                        onClick={() => downloadPDF('profile')}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-emerald-900/40 rounded-xl text-sm font-bold text-slate-600 dark:text-emerald-200/60 hover:bg-slate-50 transition-all disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-sm">badge</span>
                        Profile PDF
                    </button>
                    <button 
                        onClick={() => downloadPDF('history')}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-sm">download</span>
                        {exporting ? 'Exporting...' : 'Export History PDF'}
                    </button>
                </div>
            </div>

            {visits.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                    <span className="material-symbols-outlined text-6xl mb-4">folder_open</span>
                    <p className="font-medium">No medical records found</p>
                    <p className="text-sm mt-2">Your medical history will appear here after your first visit.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {visits.map((visit, idx) => (
                        <div key={idx} className="group p-6 bg-white dark:bg-[#11221f] rounded-2xl border border-slate-200 dark:border-emerald-900/30 hover:border-emerald-500/50 transition-all shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-emerald-50">{visit.hospital}</h3>
                                    <p className="text-sm font-medium text-slate-500 dark:text-emerald-200/40">
                                        {visit.doctor} • {visit.date ? new Date(visit.date).toLocaleDateString() : "N/A"}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${visit.category === 'Illness' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                                    }`}>
                                    {visit.category || 'Visit'}
                                </span>
                            </div>
                            <p className="text-slate-600 dark:text-emerald-100/80 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl">
                                {visit.summary}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
