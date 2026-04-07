import { useEffect, useState } from "react";
import { recommendHospital } from "../../utils/recommendHospital";
import hospitalApi from "../../services/hospital.api";

export default function RecommendedHospital({ scheme }) {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const data = await hospitalApi.getHospitals();
                setHospitals(data || []);
            } catch (err) {
                console.error('Failed to fetch hospitals:', err);
                setHospitals([]);
            } finally {
                setLoading(false);
            }
        };
        fetchHospitals();
    }, []);

    if (loading) {
        return (
            <div className="mt-6 p-6 bg-slate-900/50 rounded-2xl border border-slate-800 text-xs font-bold text-slate-500 flex items-center gap-3">
                <span className="material-symbols-outlined text-sm animate-pulse">hourglass_empty</span>
                Loading recommendations...
            </div>
        );
    }

    const hospital = recommendHospital(scheme, hospitals);

    if (!hospital) {
        return (
            <div className="mt-6 p-6 bg-slate-900/50 rounded-2xl border border-slate-800 text-xs font-bold text-slate-500 flex items-center gap-3">
                <span className="material-symbols-outlined text-sm">info</span>
                No direct empanelled recommendations found for this specific scheme.
            </div>
        );
    }

    return (
        <div className="mt-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-8 animate-in zoom-in-95 duration-500">
            <div className="flex items-center gap-3 mb-6">
                <div className="size-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <span className="material-symbols-outlined text-white text-sm">verified</span>
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500">
                    Smart Recommendation
                </h3>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h4 className="text-2xl font-black text-white tracking-tight">
                        {hospital.name}
                    </h4>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-sm text-slate-400 font-medium flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-xs">location_on</span>
                            {hospital.city}
                        </p>
                        <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                        <p className="text-sm text-emerald-500 font-black">
                            {hospital.distanceKm} km away
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {hospital.isGovernment && (
                        <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 text-center">Government</span>
                    )}
                    {hospital.hasEmergency && (
                        <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 text-center">Emergency Ready</span>
                    )}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-emerald-500/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Success Rate</span>
                        <span className="text-lg font-black text-white">{hospital.claimSuccessRate}%</span>
                    </div>
                    <div className="w-[1px] h-8 bg-slate-800"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Score</span>
                        <span className="text-lg font-black text-white">{Math.round(hospital.score)}</span>
                    </div>
                </div>

                <button className="px-5 py-2.5 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                    View Facility
                </button>
            </div>

            <p className="text-[9px] text-slate-600 font-bold mt-6 uppercase tracking-tight leading-relaxed opacity-60">
                Recommendation engine evaluates scheme acceptance, proximity, emergency infrastructure, and historical claim settlements.
            </p>
        </div>
    );
}
