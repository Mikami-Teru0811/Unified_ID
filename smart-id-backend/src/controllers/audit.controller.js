import AuditLog from '../models/AuditLog.js';

export const getMyAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({ actor: req.user.id }) // Assuming req.user.id from generateToken
      .populate('patient', 'fullName')
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching audit logs'
    });
  }
};
