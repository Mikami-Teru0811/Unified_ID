import { Outlet, Link, useLocation } from "react-router-dom";
import { PatientRegistrationProvider } from "../../../context/PatientRegistrationContext";

export default function RegisterPatient() {
    const location = useLocation();

    const steps = [
        { path: "/hospital/register", label: "Personal Info", icon: "person" },
        { path: "/hospital/register/contact", label: "Contact Details", icon: "call" },
        { path: "/hospital/register/medical", label: "Medical & NFC", icon: "medical_services" },
        { path: "/hospital/register/fingerprint", label: "Fingerprint", icon: "fingerprint" },
    ];

    const currentStepIndex = steps.findIndex(step =>
        location.pathname === step.path || (step.path === "/hospital/register" && location.pathname === "/hospital/register/")
    );

    return (
        <PatientRegistrationProvider>
            <div className="p-8 max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Patient Registration</h1>
                    <p className="text-slate-500">Complete all steps to issue a new Smart-ID card.</p>
                </div>

                {/* PROGRESS BAR */}
                <div className="flex items-center justify-between mb-12 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0"></div>
                    {steps.map((step, index) => {
                        const isActive = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        return (
                            <div key={step.path} className="relative z-10 flex flex-col items-center gap-2">
                                <div
                                    className={`size-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCurrent
                                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-110"
                                            : isActive
                                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                                                : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                                        }`}
                                >
                                    <span className="material-symbols-outlined">{step.icon}</span>
                                </div>
                                <span className={`text-xs font-bold ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* STEP CONTENT */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <Outlet />
                </div>
            </div>
        </PatientRegistrationProvider>
    );
}
