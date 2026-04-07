import express from 'express';
import {
  getDoctorStats,
  getPatientByNfc,
  getRecentPatients,
  getDeviceStatus
} from '../controllers/doctor.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Doctor dashboard statistics
router.get('/stats', authorizeRoles('doctor'), getDoctorStats);

// Get patient by NFC UID - needs identity_view + patient_search
router.get('/patient/:uid', authorizeRoles('doctor', 'hospital'), checkPermission('patient_search'), getPatientByNfc);

// Get recent patients - needs patient_search
router.get('/recent-patients', authorizeRoles('doctor'), checkPermission('patient_search'), getRecentPatients);

// Get device status
router.get('/device-status', authorizeRoles('doctor', 'hospital'), getDeviceStatus);

export default router;