import { usePatientRegistration } from "../../../context/PatientRegistrationContext";
import { useNavigate } from "react-router-dom";

export default function Step2Contact() {
    const { data, update } = usePatientRegistration();
    const navigate = useNavigate();

    const submit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        update("contact", Object.fromEntries(formData.entries()));
        navigate("/hospital/register/medical");
    };

    const goBack = () => {
        navigate("/hospital/register");
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Contact Details</h3>
                <p className="text-sm text-slate-500">How we and doctors can reach the patient.</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                    <input
                        name="phone"
                        type="tel"
                        defaultValue={data.contact.phone}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        required
                    />
                </div>

                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
                    <label className="text-xs font-bold text-slate-500 uppercase">Emergency Contact Name</label>
                    <input
                        name="emergencyName"
                        defaultValue={data.contact.emergencyName}
                        placeholder="Full Name"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Emergency Contact Phone</label>
                    <input
                        name="emergencyPhone"
                        type="tel"
                        defaultValue={data.contact.emergencyPhone}
                        placeholder="Phone Number"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        required
                    />
                </div>

                <div className="pt-6 flex gap-4">
                    <button
                        type="button"
                        onClick={goBack}
                        className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back
                    </button>
                    <button
                        type="submit"
                        className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                    >
                        Continue to Medical Info
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
