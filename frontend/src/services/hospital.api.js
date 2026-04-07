import api, { apiNfc } from "./api";

const hospitalApi = {
    // Get hospital dashboard statistics
    getStats: async () => {
        const res = await api.get("/hospital/stats");
        return res.data;
    },

    // Get patient flow data for charts
    getPatientFlow: async (days = 7) => {
        const res = await api.get(`/hospital/patient-flow?days=${days}`);
        return res.data;
    },

    // Get recent hospital activity
    getRecentActivity: async () => {
        const res = await api.get("/hospital/activity");
        return res.data;
    },

    // Get system health status
    getSystemHealth: async () => {
        const res = await api.get("/hospital/health");
        return res.data;
    },

    // Register new patient
    registerPatient: async (patientData) => {
        const res = await api.post("/patient/register", patientData);
        return res.data;
    },

    // Add clinical note to patient
    addClinicalNote: async (patientId, noteData) => {
        const res = await api.post(`/patient/${patientId}/notes`, noteData);
        return res.data;
    },

    // Get patient by NFC UID
    getPatientByNfc: async (uid) => {
        const res = await api.get(`/patient/${uid}`);
        return res.data;
    },

    // Scan NFC card
    scanNfc: async () => {
        const res = await apiNfc.post("/nfc/scan");
        return res.data;
    },

    // Get hospitals for insurance recommendations
    getHospitals: async (params = {}) => {
        const res = await api.get("/hospital/hospitals", { params });
        return res.data;
    },

    // Get available insurance schemes
    getSchemes: async () => {
        const res = await api.get("/hospital/schemes");
        return res.data;
    },

    // Create hospital (admin only)
    createHospital: async (hospitalData) => {
        const res = await api.post("/hospital", hospitalData);
        return res.data;
    },

    // Get hospital by ID
    getHospitalById: async (id) => {
        const res = await api.get(`/hospital/${id}`);
        return res.data;
    }
};

export default hospitalApi;