import { useEffect, useState } from "react";
import adminApi from "../../services/admin.api";
import { useTheme } from "../../context/ThemeContext";

export default function UserManagement() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchForm, setSearchForm] = useState({ q: "", phone: "", govtId: "", nfcId: "" });
    const [patientResults, setPatientResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState(null);

    useEffect(() => {
        adminApi.getUsers()
            .then(res => {
                setUsers(res);
                setError(null);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load users:", err);
                setUsers([]);
                setError("Unable to load user accounts from the backend.");
                setLoading(false);
            });
    }, []);

    const openPatientDetails = async (userId) => {
        setDetailsLoading(true);
        setDetailsError(null);
        setSelectedPatient(null);

        try {
            const patient = await adminApi.getPatientDetailsByUser(userId);
            setSelectedPatient(patient);
        } catch (err) {
            console.error("Failed to load patient details:", err);
            setDetailsError(err.response?.data?.message || "Unable to load patient details from the backend.");
        } finally {
            setDetailsLoading(false);
        }
    };

    const closePatientDetails = () => {
        setSelectedPatient(null);
        setDetailsError(null);
        setDetailsLoading(false);
    };

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchForm((prev) => ({ ...prev, [name]: value }));
    };

    const runPatientSearch = async (e) => {
        e.preventDefault();
        setSearchLoading(true);
        setSearchError(null);

        const params = Object.fromEntries(
            Object.entries(searchForm).filter(([, value]) => value.trim())
        );

        try {
            const results = await adminApi.searchPatients(params);
            setPatientResults(results);
        } catch (err) {
            console.error("Failed to search patients:", err);
            setPatientResults([]);
            setSearchError(err.response?.data?.message || "Unable to search patients right now.");
        } finally {
            setSearchLoading(false);
        }
    };

    const resetPatientSearch = () => {
        setSearchForm({ q: "", phone: "", govtId: "", nfcId: "" });
        setPatientResults([]);
        setSearchError(null);
        setSearchLoading(false);
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin size-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        </div>
    );

    return (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className={`text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>User Infrastructure</h2>
                        <p className={`mt-2 font-medium ${isDark ? "text-slate-500" : "text-slate-500"}`}>Monitoring and managing {users.length} active system accounts</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest ${isDark ? "border-slate-700 text-slate-400" : "border-slate-200 text-slate-600"}`}>
                        Directory sync
                    </div>
                </div>

            <div className={`rounded-3xl border p-6 shadow-2xl space-y-5 ${isDark ? "bg-[#0f172a] border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <div className="flex items-end justify-between gap-4 flex-wrap">
                    <div>
                        <h3 className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>Patient Search</h3>
                        <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Search by name, phone, govt ID, or NFC card and open the full patient record.</p>
                    </div>
                </div>

                <form onSubmit={runPatientSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        name="q"
                        value={searchForm.q}
                        onChange={handleSearchChange}
                        placeholder="Patient name"
                        className={`px-4 py-3 rounded-xl border text-slate-100 ${isDark ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-slate-50 text-slate-700"}`}
                    />
                    <input
                        name="phone"
                        value={searchForm.phone}
                        onChange={handleSearchChange}
                        placeholder="Phone"
                        className={`px-4 py-3 rounded-xl border text-slate-100 ${isDark ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-slate-50 text-slate-700"}`}
                    />
                    <input
                        name="govtId"
                        value={searchForm.govtId}
                        onChange={handleSearchChange}
                        placeholder="Govt ID"
                        className={`px-4 py-3 rounded-xl border text-slate-100 ${isDark ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-slate-50 text-slate-700"}`}
                    />
                    <input
                        name="nfcId"
                        value={searchForm.nfcId}
                        onChange={handleSearchChange}
                        placeholder="NFC ID"
                        className={`px-4 py-3 rounded-xl border text-slate-100 ${isDark ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-slate-50 text-slate-700"}`}
                    />
                    <div className="md:col-span-4 flex gap-3">
                        <button
                            type="submit"
                            disabled={searchLoading}
                            className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-black uppercase text-xs tracking-widest hover:bg-emerald-500 disabled:opacity-60"
                        >
                            {searchLoading ? 'Searching...' : 'Search Patients'}
                        </button>
                        <button
                            type="button"
                            onClick={resetPatientSearch}
                            className={`px-5 py-3 rounded-xl border font-black uppercase text-xs tracking-widest ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-100"}`}
                        >
                            Reset
                        </button>
                    </div>
                </form>

                {searchError && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{searchError}</div>
                )}

                {(patientResults.length > 0 || (!searchLoading && !searchError && patientResults.length === 0 && Object.values(searchForm).some(Boolean))) && (
                    <div className={`rounded-2xl border overflow-hidden ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                        <table className="w-full text-sm text-left">
                            <thead className={`border-b ${isDark ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                                <tr>
                                    <th className={`p-4 font-bold uppercase tracking-widest text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Patient</th>
                                    <th className={`p-4 font-bold uppercase tracking-widest text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Phone</th>
                                    <th className={`p-4 font-bold uppercase tracking-widest text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Govt ID</th>
                                    <th className={`p-4 font-bold uppercase tracking-widest text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>NFC</th>
                                    <th className={`p-4 font-bold uppercase tracking-widest text-[10px] text-right ${isDark ? "text-slate-400" : "text-slate-500"}`}>Open</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
                                {patientResults.map((patient) => (
                                    <tr key={patient.id} className={`transition-colors ${isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-100"}`}>
                                        <td className="p-4">
                                            <div className={`font-bold ${isDark ? "text-slate-100" : "text-slate-700"}`}>{patient.fullName}</div>
                                            <div className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{patient.username || 'No username'}</div>
                                        </td>
                                        <td className={`p-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{patient.phone || '-'}</td>
                                        <td className={`p-4 font-mono text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>{patient.govtId || '-'}</td>
                                        <td className={`p-4 font-mono text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>{patient.nfcId || '-'}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => openPatientDetails(patient.userId)}
                                                className="px-4 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500/20 transition-colors"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {!searchLoading && patientResults.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className={`p-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>No patients matched your search.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className={`rounded-3xl border overflow-hidden shadow-2xl ${isDark ? "bg-[#0f172a] border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <table className="w-full text-sm text-left">
                    <thead className={`border-b ${isDark ? "bg-slate-900/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                        <tr>
                            <th className={`p-6 font-bold uppercase tracking-widest text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Account Name</th>
                            <th className={`p-6 font-bold uppercase tracking-widest text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Access Role</th>
                            <th className={`p-6 font-bold uppercase tracking-widest text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Last Session</th>
                            <th className={`p-6 font-bold uppercase tracking-widest text-[10px] text-right ${isDark ? "text-slate-400" : "text-slate-500"}`}>Operations</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
                        {users.map((u) => (
                            <tr key={u.id || u.username} className={`group transition-colors ${isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50"}`}>
                                <td className={`p-6 font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>{u.name}</td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-tight border ${String(u.role).toLowerCase() === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                         }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className={`p-6 font-mono text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'No successful login yet'}</td>
                                <td className="p-6 text-right">
                                    {String(u.role).toLowerCase() === 'patient' ? (
                                        <button
                                            type="button"
                                            onClick={() => openPatientDetails(u.id)}
                                            className="px-4 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500/20 transition-colors"
                                        >
                                            View Details
                                        </button>
                                    ) : (
                                        <span className={`font-black uppercase text-[10px] tracking-widest p-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                                            Read Only
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && error && (
                    <div className={`p-6 border-t text-sm ${isDark ? "border-slate-800 text-red-400" : "border-slate-200 text-red-500"}`}>{error}</div>
                )}
                {!loading && !error && users.length === 0 && (
                    <div className={`p-6 border-t text-sm ${isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"}`}>No users returned by the backend.</div>
                )}
            </div>

            {(detailsLoading || detailsError || selectedPatient) && (
                <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${isDark ? "bg-slate-950/70" : "bg-slate-900/50"}`}>
                    <div className={`w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden ${isDark ? "border-slate-800 bg-[#0b1220]" : "border-slate-200 bg-white"}`}>
                        <div className={`flex items-center justify-between px-8 py-6 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                            <div>
                                <h3 className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>Patient Details</h3>
                                <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>Stored profile data from MongoDB</p>
                            </div>
                            <button
                                type="button"
                                onClick={closePatientDetails}
                                className={`px-4 py-2 rounded-xl transition-colors ${isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                            >
                                Close
                            </button>
                        </div>

                        <div className="p-8">
                            {detailsLoading && (
                                <div className="flex items-center justify-center p-16">
                                    <div className="animate-spin size-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
                                </div>
                            )}

                            {!detailsLoading && detailsError && (
                                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
                                    {detailsError}
                                </div>
                            )}

                            {!detailsLoading && selectedPatient && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <InfoCard label="Full Name" value={selectedPatient.fullName} isDark={isDark} />
                                        <InfoCard label="Username" value={selectedPatient.username} isDark={isDark} />
                                        <InfoCard label="Patient ID" value={selectedPatient.id} mono isDark={isDark} />
                                        <InfoCard label="Govt ID" value={selectedPatient.govtId} mono isDark={isDark} />
                                        <InfoCard label="NFC ID" value={selectedPatient.nfcId} mono isDark={isDark} />
                                        <InfoCard label="Fingerprint ID" value={selectedPatient.fingerprintId} isDark={isDark} />
                                        <InfoCard label="Date of Birth" value={selectedPatient.dob ? new Date(selectedPatient.dob).toLocaleDateString() : null} isDark={isDark} />
                                        <InfoCard label="Age" value={selectedPatient.age} isDark={isDark} />
                                        <InfoCard label="Gender" value={selectedPatient.gender} isDark={isDark} />
                                        <InfoCard label="Blood Group" value={selectedPatient.bloodGroup} isDark={isDark} />
                                        <InfoCard label="Height" value={selectedPatient.heightCm ? `${selectedPatient.heightCm} cm` : null} isDark={isDark} />
                                        <InfoCard label="Weight" value={selectedPatient.weightKg ? `${selectedPatient.weightKg} kg` : null} isDark={isDark} />
                                        <InfoCard label="Phone" value={selectedPatient.phone} isDark={isDark} />
                                        <InfoCard label="Email" value={selectedPatient.email} isDark={isDark} />
                                        <InfoCard label="Address" value={selectedPatient.address} isDark={isDark} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ListCard
                                            label="Emergency Contact"
                                            items={[
                                                selectedPatient.emergencyContact?.name || 'No name recorded',
                                                selectedPatient.emergencyContact?.phone || 'No phone recorded'
                                            ]}
                                            isDark={isDark}
                                        />
                                        <ListCard
                                            label="Allergies"
                                            items={selectedPatient.allergies?.length ? selectedPatient.allergies : ['None recorded']}
                                            isDark={isDark}
                                        />
                                        <ListCard
                                            label="Surgeries"
                                            items={selectedPatient.surgeries?.length ? selectedPatient.surgeries : ['None recorded']}
                                            isDark={isDark}
                                        />
                                        <ListCard
                                            label="Clinical Notes"
                                            items={selectedPatient.medicalHistory?.length
                                                ? selectedPatient.medicalHistory.map((entry) => `${entry.condition || 'Clinical note'} - ${entry.notes || 'No notes'}`)
                                                : ['No records yet']}
                                            isDark={isDark}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoCard({ label, value, mono = false, isDark }) {
    return (
        <div className={`rounded-2xl border p-4 ${isDark ? "border-slate-800 bg-slate-900/60" : "border-slate-200 bg-slate-50"}`}>
            <div className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{label}</div>
            <div className={`text-sm font-bold break-words ${mono ? 'font-mono' : ''} ${isDark ? "text-slate-100" : "text-slate-700"}`}>{value || 'Not available'}</div>
        </div>
    );
}

function ListCard({ label, items, isDark }) {
    return (
        <div className={`rounded-2xl border p-4 ${isDark ? "border-slate-800 bg-slate-900/60" : "border-slate-200 bg-slate-50"}`}>
            <div className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{label}</div>
            <div className={`space-y-2 text-sm ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                {items.map((item, index) => (
                    <div key={`${label}-${index}`} className={`rounded-xl px-3 py-2 border ${isDark ? "bg-slate-950/70 border-slate-800" : "bg-white border-slate-200"}`}>
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
}
