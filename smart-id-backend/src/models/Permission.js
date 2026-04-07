import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    unique: true,
    enum: ['admin', 'hospital', 'doctor', 'patient', 'medical_shop']
  },
  permissions: {
    patient_register: { type: Boolean, default: false },
    emr_write: { type: Boolean, default: false },
    identity_view: { type: Boolean, default: false },
    patient_search: { type: Boolean, default: false },
    prescription_view: { type: Boolean, default: false },
    prescription_create: { type: Boolean, default: false },
    emergency_bypass: { type: Boolean, default: false },
    consent_manage: { type: Boolean, default: false },
    user_manage: { type: Boolean, default: false }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

permissionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Permission', permissionSchema);
