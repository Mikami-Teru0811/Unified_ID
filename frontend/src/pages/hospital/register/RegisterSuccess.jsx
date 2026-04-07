import { useLocation, useNavigate } from "react-router-dom";

export default function RegisterSuccess() {
    const { state } = useLocation();
    const navigate = useNavigate();

    // Redirect to dashboard if no state is present (e.g. direct URL access)
    if (!state) {
        navigate("/hospital");
        return null;
    }

    const {
        patientName,
        patientId,
        nfcId,
        govtId,
        dob,
        age,
        gender,
        phone,
        emergencyName,
        emergencyPhone,
        bloodGroup,
        heightCm,
        weightKg,
        allergies,
        surgeries,
        fingerId,
        fingerprintEnrolled,
    } = state;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">

            {/* Header */}
            <header className="border-b border-slate-200 dark:border-slate-800 px-10 py-4 bg-white dark:bg-slate-900 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-white">local_hospital</span>
                    </div>
                    <h2 className="font-bold text-lg text-slate-800 dark:text-white">Smart-ID Hospital Portal</h2>
                </div>
            </header>

            {/* Main */}
            <main className="flex flex-1 items-center justify-center px-4 py-12">
                <div className="max-w-xl w-full text-center">

                    {/* Success Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="w-24 h-24 rounded-full bg-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-bounce-short">
                            <span className="material-symbols-outlined text-white text-5xl">
                                check
                            </span>
                        </div>
                    </div>

                    {/* Text */}
                    <h1 className="text-3xl font-bold mb-3 text-slate-800 dark:text-white">
                        Registration Successful!
                    </h1>

                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                        Patient <span className="font-bold text-slate-900 dark:text-white">{patientName}</span>{" "}
                        has been successfully registered{fingerprintEnrolled ? " with biometric fingerprint enrolled" : ""} and their Smart-ID card is now active.
                    </p>

                    {/* Summary Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-left mb-10 shadow-lg shadow-slate-200/50 dark:shadow-none space-y-4">
                        <div className="flex justify-between py-4 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Patient ID</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-emerald-400">{patientId}</span>
                        </div>
                        <div className="flex justify-between py-4 border-b border-slate-100 dark:border-slate-800 gap-4">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Government ID</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-white text-right">{govtId}</span>
                        </div>
                        <div className="flex justify-between py-4 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">NFC Card Number</span>
                            <span className="flex items-center gap-2 font-mono font-bold text-slate-800 dark:text-emerald-400">
                                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-sm">
                                    contactless
                                </span>
                                {nfcId}
                            </span>
                        </div>
                        <div className="flex justify-between py-4 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Blood Group</span>
                            <span className="font-bold text-slate-800 dark:text-white">{bloodGroup}</span>
                        </div>
                        <div className="flex justify-between py-4 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Fingerprint</span>
                            <span className="flex items-center gap-2">
                                {fingerprintEnrolled ? (
                                    <>
                                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-sm">fingerprint</span>
                                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                            Enrolled
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-amber-500 text-sm">fingerprint</span>
                                        <span className="font-bold text-amber-500">Pending</span>
                                    </>
                                )}
                            </span>
                        </div>
                        {fingerId && (
                            <div className="flex justify-between py-4 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Fingerprint ID</span>
                                <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{fingerId}</span>
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Birth</div>
                                <div className="text-lg font-bold text-slate-800 dark:text-white">{dob ? new Date(dob).toLocaleDateString() : '-'}</div>
                            </div>
                            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Age / Gender</div>
                                <div className="text-lg font-bold text-slate-800 dark:text-white">{age || '-'} / {gender || '-'}</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Height</div>
                                <div className="text-lg font-bold text-slate-800 dark:text-white">{heightCm} cm</div>
                            </div>
                            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Weight</div>
                                <div className="text-lg font-bold text-slate-800 dark:text-white">{weightKg} kg</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</div>
                                <div className="text-lg font-bold text-slate-800 dark:text-white break-all">{phone}</div>
                            </div>
                            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Emergency Contact</div>
                                <div className="text-sm font-bold text-slate-800 dark:text-white">{emergencyName || '-'}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{emergencyPhone || '-'}</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Allergies</div>
                                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{allergies || 'None recorded'}</div>
                            </div>
                            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Surgeries</div>
                                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{surgeries || 'None recorded'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => window.print()}
                            className="px-8 py-3 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined">print</span>
                            Print Details
                        </button>

                        <button
                            onClick={() => navigate("/hospital")}
                            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/25"
                        >
                            <span className="material-symbols-outlined">dashboard</span>
                            Return to Dashboard
                        </button>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 dark:border-slate-900">
                Secure Smart-ID Network • 2026
            </footer>

            <style>{`
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-short {
          animation: bounce-short 2s ease-in-out infinite;
        }
        @media print {
            button, header, footer { display: none !important; }
            body { background: white !important; }
            .shadow-lg { shadow: none !important; }
        }
      `}</style>
        </div>
    );
}
