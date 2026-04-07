import { useEffect, useState } from "react";
import patientApi from "../../services/patient.api";
import { useTheme } from "../../context/ThemeContext";

const SCHEMES = [
  { 
    code: 'CMCHIS', 
    title: 'CMCHIS', 
    description: "Chief Minister's Comprehensive Health Insurance (Tamil Nadu).",
    link: "https://www.cmchistn.com",
    isGov: true 
  },
  { 
    code: 'PMJAY', 
    title: 'Ayushman Bharat (PM-JAY)', 
    description: "Central government healthcare safety net for vulnerable families.",
    link: "https://pmjay.gov.in",
    isGov: true 
  },
  { 
    code: 'TN_UHS', 
    title: 'Urban Health Scheme', 
    description: "Specialized coverage for TN government employees and pensioners.",
    link: "https://tnuhs.tn.gov.in",
    isGov: true 
  },
  { 
    code: 'STAR_HEALTH', 
    title: 'Star Health', 
    description: "Comprehensive private health insurance plans with local network focus.",
    link: "https://www.starhealth.in",
    isGov: false 
  },
  { 
    code: 'HDFC_ERGO', 
    title: 'HDFC ERGO Health', 
    description: "Premium private insurance with global standards and fast claims.",
    link: "https://www.hdfcergo.com/health-insurance",
    isGov: false 
  },
  { 
    code: 'ICICI_LOMBARD', 
    title: 'ICICI Lombard', 
    description: "Reliable health insurance coverage with 6000+ hospital network.",
    link: "https://www.icicilombard.com/health-insurance",
    isGov: false 
  }
];

const MOCK_CLAIMS = [
  {
    id: "CLM-" + Date.now().toString().slice(-5),
    scheme: "Smart-ID Health Cover",
    hospital: "Smart-ID Network Hospital",
    amount: "Rs. 0",
    date: new Date().toLocaleDateString('en-IN'),
    status: "Active"
  }
];

export default function InsuranceSchemes() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    
    const [loading, setLoading] = useState(true);
    const [patientInfo, setPatientInfo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileData = await patientApi.getProfile().catch(() => null);
                
                if (profileData) {
                    setPatientInfo({
                        age: profileData.age,
                        gender: profileData.gender,
                        bloodGroup: profileData.bloodGroup,
                        employmentStatus: profileData.employmentStatus || 'general',
                        annualIncome: profileData.annualIncome || 0
                    });
                }
            } catch (error) {
                console.error('Failed to fetch insurance data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    const checkEligibility = (schemeCode) => {
        if (!patientInfo) return false;
        
        const { employmentStatus, annualIncome } = patientInfo;
        
        switch (schemeCode) {
            case 'CMCHIS':
                return annualIncome < 72000 || employmentStatus === 'unemployed';
            case 'PMJAY':
                return annualIncome < 100000 || employmentStatus === 'unemployed';
            case 'TN_UHS':
                return employmentStatus === 'government';
            case 'STAR_HEALTH':
            case 'HDFC_ERGO':
            case 'ICICI_LOMBARD':
                return true;
            default:
                return true;
        }
    };

    const getSchemeEligibility = (schemeCode) => {
        const eligible = checkEligibility(schemeCode);
        return {
            eligible,
            reason: eligible 
                ? 'Based on your profile, you may be eligible for this scheme.'
                : 'This scheme may have specific criteria you do not meet.'
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
            <header className="mb-12">
                <div className="flex items-center gap-4 mb-3">
                    <div className="size-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                        <span className="material-symbols-outlined text-3xl">policy</span>
                    </div>
                    <h1 className={`text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                        Insurance Command Center
                    </h1>
                </div>
                <p className={`text-lg ml-16 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                    Profile-based guidance with official scheme links and sample claim visualization.
                </p>
                {patientInfo && (
                    <div className={`mt-4 ml-16 inline-flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold ${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                        <span className="material-symbols-outlined text-sm">person</span>
                        Profile: {patientInfo.gender || 'Not set'} | Age: {patientInfo.age || 'N/A'} | Blood: {patientInfo.bloodGroup || 'N/A'}
                    </div>
                )}
            </header>

            {/* 1. ELIGIBILITY & SCHEMES */}
            <section className="mb-20">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500 mb-8 flex items-center gap-3">
                    <span className="w-8 h-[1px] bg-emerald-500/30"></span>
                    Live Scheme Eligibility
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {SCHEMES.map((scheme) => {
                        const { eligible, reason } = getSchemeEligibility(scheme.code);
                        return (
                            <SchemeCard
                                key={scheme.code}
                                scheme={scheme}
                                eligible={eligible}
                                reason={reason}
                                isDark={isDark}
                            />
                        );
                    })}
                </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                {/* 2. CLAIM HISTORY */}
                <section className="xl:col-span-8">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-3">
                        <span className="w-8 h-[1px] bg-slate-500/30"></span>
                        Claim Audit Vault
                    </h2>

                    <div className={`rounded-[2.5rem] border overflow-hidden shadow-2xl ${isDark ? "bg-[#0f172a] border-slate-800" : "bg-white border-slate-200"}`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className={`border-b ${isDark ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                                        <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>Reference ID</th>
                                        <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>Scheme</th>
                                        <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>Hospital</th>
                                        <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right ${isDark ? "text-slate-400" : "text-slate-500"}`}>Settlement</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
                                    {MOCK_CLAIMS.map((c) => (
                                        <tr key={c.id} className={`hover:${isDark ? "bg-slate-800/30" : "bg-slate-50"} transition-all group`}>
                                            <td className="px-8 py-6">
                                                <span className="font-mono text-emerald-500 font-bold">{c.id}</span>
                                                <p className={`text-[10px] font-bold mt-1 uppercase tracking-tighter ${isDark ? "text-slate-500" : "text-slate-400"}`}>{c.date}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-xs font-bold text-white">{c.scheme}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>{c.hospital}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>{c.amount}</span>
                                                    <span className="text-[10px] font-black uppercase px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 mt-1">
                                                        {c.status}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* 3. NETWORK COVERAGE STATS */}
                <section className="xl:col-span-4">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-3">
                        <span className="w-8 h-[1px] bg-slate-500/30"></span>
                        Scheme Information
                    </h2>

                    <div className="space-y-6">
                        {SCHEMES.slice(0, 4).map((scheme) => (
                            <a
                                key={scheme.code}
                                href={scheme.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`rounded-3xl p-6 border hover:border-emerald-500/20 transition-all ${isDark ? "bg-[#0f172a] border-slate-800" : "bg-white border-slate-200"}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className={`font-bold text-lg tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                                        {scheme.title}
                                    </h3>
                                    {scheme.isGov && (
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full">Govt</span>
                                    )}
                                </div>
                                <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    {scheme.description}
                                </p>
                                <div className="mt-4 pt-4 border-t border-slate-700/50">
                                    <p className="text-[10px] text-emerald-500 font-medium">Open official portal</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

function SchemeCard({ scheme, eligible, reason, isDark }) {
    return (
        <div className={`group rounded-[2.5rem] p-8 border hover:border-emerald-500/40 transition-all duration-500 shadow-2xl flex flex-col justify-between ${isDark ? "bg-[#111827] border-slate-800" : "bg-white border-slate-200"} ${scheme.isGov ? "border-emerald-500/10" : ""}`}>
            <div>
                <div className="flex justify-between items-start mb-6">
                    <h3 className={`text-xl font-bold tracking-tight group-hover:text-emerald-500 transition-colors ${isDark ? "text-white" : "text-slate-900"}`}>
                        {scheme.title}
                    </h3>
                    <div className="flex flex-col items-end gap-2">
                        {scheme.isGov && <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full">Official TN</span>}
                        <EligibilityBadge eligible={eligible} isDark={isDark} />
                    </div>
                </div>
                <p className={`leading-relaxed text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                    {scheme.description}
                </p>
                <p className={`mt-3 text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    {reason}
                </p>
            </div>

            <div className="mt-10">
                <a
                    href={scheme.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full inline-flex items-center justify-center gap-3 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 rounded-2xl ${isDark ? "bg-slate-800 hover:bg-emerald-600 text-white" : "bg-slate-100 hover:bg-emerald-600 text-slate-900"}`}
                >
                    Verify eligibility
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                </a>
            </div>
        </div>
    );
}

function EligibilityBadge({ eligible, isDark }) {
    return eligible ? (
        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${isDark ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-emerald-600 bg-emerald-50 border-emerald-200"}`}>
            <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Likely Eligible
        </div>
    ) : (
        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${isDark ? "text-slate-500 bg-slate-800/50 border-slate-700" : "text-slate-400 bg-slate-100 border-slate-200"}`}>
            <span className="size-1.5 bg-slate-600 rounded-full"></span>
            Check Criteria
        </div>
    );
}

