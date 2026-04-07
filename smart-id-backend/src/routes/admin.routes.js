import express from 'express';
import {
  getStatistics,
  getAuditLogs,
  getUsers,
  getPatientDetailsByUser,
  searchPatients,
  getPermissions,
  savePermissions,
  createUser,
  toggleUserStatus
} from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { checkPermission } from '../middleware/permission.middleware.js';

const router = express.Router();

router.use(protect, authorizeRoles('admin'));

router.get('/statistics', getStatistics);
router.get('/audit-logs', getAuditLogs);
router.get('/users', checkPermission('user_manage'), getUsers);
router.post('/users', checkPermission('user_manage'), createUser);
router.patch('/users/:userId/toggle', checkPermission('user_manage'), toggleUserStatus);
router.get('/patients/search', checkPermission('patient_search'), searchPatients);
router.get('/patients/user/:userId', checkPermission('identity_view'), getPatientDetailsByUser);
router.get('/permissions', getPermissions);
router.post('/permissions', savePermissions);

export default router;
