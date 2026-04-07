import api, { apiNfc } from "../services/api";

const medicalShopApi = {
    scanHardwareNfc: async () => {
        const res = await apiNfc.post("/nfc/scan", {});
        return res.data;
    },
    scanNFC: async (uid) => {
        const res = await api.post("/medical-shop/nfc/scan", { uid });
        return res.data;
    },
    fetchPrescriptionPDF: async (prescriptionId) => {
        const res = await api.get(
            `/medical-shop/prescriptions/${encodeURIComponent(prescriptionId)}/pdf`,
            { responseType: "blob" }
        );
        return res.data;
    },
    markAsDispensed: async (prescriptionId, patientId) => {
        const res = await api.post("/medical-shop/dispense", {
            prescriptionId,
            patientId
        });
        return res.data;
    },
    getPatientDetails: async (patientId) => {
        const res = await api.get(`/medical-shop/patient/${patientId}`);
        return res.data;
    }
};

export default medicalShopApi;
