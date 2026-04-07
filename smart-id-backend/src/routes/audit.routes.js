import express from 'express';
import { getMyAuditLogs } from '../controllers/audit.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/my', protect, getMyAuditLogs);

export default router;
