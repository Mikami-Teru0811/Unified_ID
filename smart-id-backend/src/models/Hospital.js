import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  registrationNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  address: {
    street: String,
    city: String,
    district: String,
    state: {
      type: String,
      default: 'Tamil Nadu'
    },
    pincode: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  phone: String,
  email: String,
  website: String,
  type: {
    type: String,
    enum: ['government', 'private', 'trust', 'corporate'],
    default: 'private'
  },
  specialty: [{
    type: String,
    enum: ['general', 'cardiology', 'orthopedics', 'neurology', 'oncology', 'pediatrics', 'gynecology', 'emergency', 'trauma', 'dental', 'ophthalmology', 'psychiatry']
  }],
  bedCount: {
    type: Number,
    default: 0
  },
  emergencyServices: {
    type: Boolean,
    default: false
  },
  ambulanceService: {
    type: Boolean,
    default: false
  },
  insuranceSchemes: [{
    name: String,
    code: String,
    active: {
      type: Boolean,
      default: true
    }
  }],
  empanelled: [{
    scheme: {
      type: String,
      enum: ['CMCHIS', 'PMJAY', 'TN_UHS', 'STAR_HEALTH', 'HDFC_ERGO', 'ICICI_LOMBARD', 'OTHER']
    },
    validFrom: Date,
    validTill: Date,
    active: {
      type: Boolean,
      default: true
    }
  }],
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  services: [String],
  facilities: [String],
  claimSuccessRate: {
    type: Number,
    default: 85,
    min: 0,
    max: 100
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isGovernment: {
    type: Boolean,
    default: false
  },
  hasEmergency: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

hospitalSchema.index({ location: '2dsphere' });
hospitalSchema.index({ 'empanelled.scheme': 1 });
hospitalSchema.index({ 'insuranceSchemes.code': 1 });

hospitalSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    address: this.address,
    city: this.address?.city || 'Unknown',
    phone: this.phone,
    type: this.type,
    specialty: this.specialty,
    emergencyServices: this.emergencyServices,
    ambulanceService: this.ambulanceService,
    insuranceSchemes: this.insuranceSchemes.map(s => s.code || s.name),
    empanelled: this.empanelled.filter(e => e.active).map(e => e.scheme),
    services: this.services,
    facilities: this.facilities,
    claimSuccessRate: this.claimSuccessRate,
    isGovernment: this.isGovernment,
    hasEmergency: this.hasEmergency,
    bedCount: this.bedCount,
    operatingHours: this.operatingHours
  };
};

hospitalSchema.statics.getSchemes = function() {
  return ['CMCHIS', 'PMJAY', 'TN_UHS', 'STAR_HEALTH', 'HDFC_ERGO', 'ICICI_LOMBARD', 'OTHER'];
};

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;
