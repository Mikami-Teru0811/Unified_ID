import Permission from '../models/Permission.js';

const defaultPermissions = [
  {
    role: 'admin',
    permissions: {
      patient_register: true,
      emr_write: true,
      identity_view: true,
      patient_search: true,
      prescription_view: true,
      prescription_create: true,
      emergency_bypass: true,
      consent_manage: true,
      user_manage: true
    }
  },
  {
    role: 'hospital',
    permissions: {
      patient_register: true,
      emr_write: true,
      identity_view: true,
      patient_search: true,
      prescription_view: true,
      prescription_create: true,
      emergency_bypass: true,
      consent_manage: true,
      user_manage: true
    }
  },
  {
    role: 'doctor',
    permissions: {
      patient_register: false,
      emr_write: false,
      identity_view: true,
      patient_search: true,
      prescription_view: true,
      prescription_create: false,
      emergency_bypass: false,
      consent_manage: true,
      user_manage: false
    }
  },
  {
    role: 'patient',
    permissions: {
      patient_register: false,
      emr_write: false,
      identity_view: false,
      patient_search: false,
      prescription_view: false,
      prescription_create: false,
      emergency_bypass: false,
      consent_manage: false,
      user_manage: false
    }
  },
  {
    role: 'medical_shop',
    permissions: {
      patient_register: false,
      emr_write: false,
      identity_view: false,
      patient_search: false,
      prescription_view: true,
      prescription_create: false,
      emergency_bypass: false,
      consent_manage: false,
      user_manage: false
    }
  }
];

export const seedPermissions = async () => {
  try {
    // Use bulkWrite with upsert to prevent duplicates
    const bulkOps = defaultPermissions.map(perm => ({
      updateOne: {
        filter: { role: perm.role },
        update: { $set: perm },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await Permission.bulkWrite(bulkOps);
    }
    
    console.log('✅ Permissions seeded successfully (upsert ensures no duplicates)');
  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
  }
};

export default seedPermissions;
