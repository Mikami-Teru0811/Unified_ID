import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';
import {
  getPrescriptionPdf,
  scanPatientForMedicalShop,
  markAsDispensed,
  getPatientById
} from '../controllers/medicalShop.controller.js';

const router = express.Router();

router.use(protect, authorizeRoles('medical_shop'));

router.post('/nfc/scan', checkPermission('prescription_view'), scanPatientForMedicalShop);
router.get('/prescriptions/:prescriptionId/pdf', checkPermission('prescription_view'), getPrescriptionPdf);
router.post('/dispense', checkPermission('prescription_view'), markAsDispensed);
router.get('/patient/:patientId', checkPermission('prescription_view'), getPatientById);

export default router;
