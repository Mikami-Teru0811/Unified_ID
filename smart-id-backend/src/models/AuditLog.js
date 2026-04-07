import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    actorRole: {
      type: String,
      required: true
    },

    action: {
      type: String,
      required: true
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    },

    resource: {
      type: String
    },

    ipAddress: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ patient: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
