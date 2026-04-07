import api from "./api";

const adminApi = {
    getStatistics: async () => {
        const res = await api.get("/admin/statistics");
        return res.data;
    },
    getAuditLogs: async () => {
        const res = await api.get("/admin/audit-logs");
        return res.data;
    },
    getUsers: async () => {
        const res = await api.get("/admin/users");
        return res.data;
    },
    searchPatients: async (params = {}) => {
        const res = await api.get("/admin/patients/search", { params });
        return res.data;
    },
    getPatientDetailsByUser: async (userId) => {
        const res = await api.get(`/admin/patients/user/${userId}`);
        return res.data;
    },
    createUser: async (userData) => {
        const res = await api.post("/admin/users", userData);
        return res.data;
    },
    toggleUserStatus: async (userId) => {
        const res = await api.patch(`/admin/users/${userId}/toggle`);
        return res.data;
    },
    getPermissions: async () => {
        const res = await api.get("/admin/permissions");
        return res.data;
    },
    savePermissions: async (payload) => {
        const res = await api.post("/admin/permissions", payload);
        return res.data;
    }
};

export default adminApi;
