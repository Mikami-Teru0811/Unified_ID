export default function PermissionConfirmModal({ onClose }) {
    return (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0f172a] rounded-[2.5rem] w-full max-w-lg p-10 border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="text-center mb-10">
                    <div className="mx-auto size-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mb-6 border border-red-500/20 shadow-lg shadow-red-500/5">
                        <span className="material-symbols-outlined text-4xl">vpn_key</span>
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Confirm Policy Change</h3>
                    <p className="text-slate-500 font-medium">Elevated authorization required to update system-level permissions matrix.</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Master Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-slate-900 border border-slate-700 p-5 rounded-2xl outline-none focus:border-emerald-500 transition-all text-white font-bold tracking-[0.3em]"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-4 rounded-2xl font-bold transition-all"
                        >
                            Cancel
                        </button>
                        <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20">
                            Confirm & Apply
                        </button>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-3 text-red-500/60 font-bold text-[10px] uppercase tracking-widest">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Changes are permanent and recorded in the master audit log.
                </div>
            </div>
        </div>
    );
}
