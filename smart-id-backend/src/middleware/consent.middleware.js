import mongoose from 'mongoose';
import Consent from '../models/Consent.js';
import Patient from '../models/Patient.js';
import { logAudit } from '../utils/auditLogger.js';

export const checkConsent = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      await logAudit({
        actor: req.user.id,
        actorRole: req.user.role,
        action: 'VIEW_PATIENT_PROFILE_DENIED',
        patient: patientId,
        resource: 'PATIENT_PROFILE',
        ipAddress: req.ip,
        reason: 'Invalid patient ID format'
      });

      return res.status(400).json({
        message: 'Invalid patient ID format'
      });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      await logAudit({
        actor: req.user.id,
        actorRole: req.user.role,
        action: 'VIEW_PATIENT_PROFILE_DENIED',
        patient: patientId,
        resource: 'PATIENT_PROFILE',
        ipAddress: req.ip,
        reason: 'Patient not found'
      });

      return res.status(404).json({ message: 'Patient not found' });
    }

    const consent = await Consent.findOne({
      patient: patientId,
      requester: req.user.id,
      status: 'approved',
      validTill: { $gt: new Date() }
    });

    if (!consent) {
      await logAudit({
        actor: req.user.id,
        actorRole: req.user.role,
        action: 'VIEW_PATIENT_PROFILE_DENIED',
        patient: patientId,
        resource: 'PATIENT_PROFILE',
        ipAddress: req.ip,
        reason: 'No valid consent found'
      });

      return res.status(403).json({
        message: 'Access denied: valid consent not found'
      });
    }

    await logAudit({
      actor: req.user.id,
      actorRole: req.user.role,
      action: 'VIEW_PATIENT_PROFILE_ALLOWED',
      patient: patientId,
      resource: 'PATIENT_PROFILE',
      ipAddress: req.ip
    });

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error during consent verification'
    });
  }
};
