import mongoose from 'mongoose';

const consentSchema = new mongoose.Schema(
  {
    // Patient who owns the data
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },

    // User requesting access (doctor / hospital)
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Role of requester (doctor / hospital)
    requesterRole: {
      type: String,
      enum: ['doctor', 'hospital'],
      required: true
    },

    // Purpose of access
    purpose: {
      type: String,
      required: true
    },

    // Consent status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'revoked'],
      default: 'pending'
    },

    // Time-based access
    validFrom: {
      type: Date,
      default: Date.now
    },

    validTill: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

consentSchema.index({ patient: 1, status: 1, validTill: 1 });
consentSchema.index({ requester: 1, createdAt: -1 });

export default mongoose.model('Consent', consentSchema);
