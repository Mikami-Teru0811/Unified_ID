import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({
  actor,
  actorRole,
  action,
  patient,
  resource,
  ipAddress
}) => {
  try {
    await AuditLog.create({
      actor,
      actorRole,
      action,
      patient,
      resource,
      ipAddress
    });
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
};
