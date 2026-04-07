import Patient from '../models/Patient.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import Consent from '../models/Consent.js';
import Hospital from '../models/Hospital.js';
import { callHardwareBridge, normalizeHardwareStatus } from '../utils/hardwareGateway.js';

export const authenticateEmergencyManager = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const emergencyPassword = process.env.EMERGENCY_PASSWORD;

    if (emergencyPassword && password === emergencyPassword) {
      const user = await User.findById(req.user._id || req.user.id);
      
      return res.json({
        allowed: true,
        authorized: true,
        method: 'emergency_password',
        user: user ? {
          id: user._id,
          name: user.name,
          role: user.role
        } : null
      });
    }

    const user = await User.findById(req.user._id || req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.json({
      allowed: true,
      authorized: true,
      method: 'user_password',
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Emergency manager authentication error:', error);
    res.status(500).json({ message: 'Failed to validate emergency manager credentials' });
  }
};

// Get hospital dashboard statistics
export const getHospitalStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalPatients,
      todayAdmissions,
      activeConsents,
      emergencyAccessToday
    ] = await Promise.all([
      Patient.countDocuments(),
      AuditLog.countDocuments({
        action: 'REGISTER_PATIENT',
        createdAt: { $gte: today }
      }),
      Consent.countDocuments({ status: 'approved' }),
      AuditLog.countDocuments({
        action: { $regex: /emergency/i },
        createdAt: { $gte: today }
      })
    ]);

    // Calculate ER load based on recent activity
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const recentActivity = await AuditLog.countDocuments({
      createdAt: { $gte: lastHour }
    });

    // Estimated operational metrics derived from recent activity.
    const stats = {
      totalPatients,
      dailyAdmissions: todayAdmissions,
      erLoad: Math.min(100, Math.round((recentActivity / 10) * 100)),
      availableRooms: Math.max(0, 20 - (todayAdmissions % 20)),
      staffOnDuty: await User.countDocuments({ role: { $in: ['doctor', 'hospital'] } }),
      activeConsents,
      emergencyAccessToday
    };

    res.json(stats);
  } catch (error) {
    console.error('Hospital stats error:', error);
    res.status(500).json({ message: 'Failed to fetch hospital statistics' });
  }
};

// Get patient flow data for charts (real data aggregation)
export const getPatientFlow = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await AuditLog.countDocuments({
        action: { $in: ['REGISTER_PATIENT', 'VIEW_PATIENT_PROFILE', 'NFC_SCAN'] },
        createdAt: { $gte: date, $lt: nextDate }
      });

      result.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: count
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Patient flow error:', error);
    res.status(500).json({ message: 'Failed to fetch patient flow data' });
  }
};

// Get recent hospital activity
export const getRecentActivity = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('actor', 'name username role')
      .populate('patient', 'fullName')
      .sort({ createdAt: -1 })
      .limit(20);

    const activity = logs.map(log => ({
      id: log._id,
      action: log.action,
      user: log.actor?.name || log.actor?.username || 'System',
      target: log.patient?.fullName || log.resource || 'Unknown',
      timestamp: log.createdAt,
      role: log.actorRole
    }));

    res.json(activity);
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ message: 'Failed to fetch recent activity' });
  }
};

// Get system health status
export const getSystemHealth = async (req, res) => {
  try {
    const dbHealth = await Patient.findOne().maxTimeMS(5000).then(() => 'healthy').catch(() => 'degraded');
    const bridgeHealth = await callHardwareBridge('/health').catch((error) => ({
      services: {
        nfc: 'error',
        fingerprint: 'error',
        gsm: 'error',
        pi: 'error'
      },
      api: 'online',
      database: dbHealth,
      lastCheck: new Date().toISOString(),
      error: error.message
    }));
    const normalized = normalizeHardwareStatus(bridgeHealth);

    const health = {
      database: dbHealth,
      api: normalized.api,
      lastCheck: normalized.lastCheck,
      services: {
        auth: 'online',
        nfc: normalized.nfc,
        fingerprint: normalized.fingerprint,
        gsm: normalized.gsm,
        raspberryPi: normalized.pi,
        storage: dbHealth
      },
      bridgeConfigured: normalized.bridgeConfigured
    };

    res.json(health);
    } catch (error) {
    res.status(500).json({ message: 'Failed to fetch system health' });
  }
};

export const getHospitals = async (req, res) => {
  try {
    const { scheme, city, type, emergency } = req.query;
    
    const filter = { active: true };
    
    if (scheme) {
      filter['empanelled.scheme'] = scheme;
      filter['empanelled.active'] = true;
    }
    
    if (city) {
      filter['address.city'] = { $regex: new RegExp(city, 'i') };
    }
    
    if (type) {
      filter.type = type;
    }
    
    if (emergency === 'true') {
      filter.emergencyServices = true;
    }

    const hospitals = await Hospital.find(filter)
      .select('name address city phone type specialty emergencyServices ambulanceService empanelled services facilities claimSuccessRate isGovernment hasEmergency bedCount')
      .lean();

    const formatted = hospitals.map(h => ({
      id: h._id,
      name: h.name,
      city: h.address?.city || 'Unknown',
      phone: h.phone,
      type: h.type,
      specialty: h.specialty || [],
      emergencyServices: h.emergencyServices,
      ambulanceService: h.ambulanceService,
      schemes: h.empanelled?.filter(e => e.active).map(e => e.scheme) || [],
      services: h.services || [],
      facilities: h.facilities || [],
      claimSuccessRate: h.claimSuccessRate || 85,
      isGovernment: h.isGovernment || h.type === 'government',
      hasEmergency: h.hasEmergency || h.emergencyServices,
      bedCount: h.bedCount || 0,
      distanceKm: 0
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get hospitals error:', error);
    res.status(500).json({ message: 'Failed to fetch hospitals' });
  }
};

export const createHospital = async (req, res) => {
  try {
    const hospitalData = {
      ...req.body,
      user: req.user._id || req.user.id,
      isGovernment: req.body.type === 'government',
      hasEmergency: req.body.emergencyServices
    };

    const hospital = await Hospital.create(hospitalData);

    await AuditLog.create({
      actor: req.user._id || req.user.id,
      actorRole: req.user.role,
      action: 'CREATE_HOSPITAL',
      resource: 'HOSPITAL_PROFILE',
      ipAddress: req.ip
    });

    res.status(201).json({
      message: 'Hospital registered successfully',
      hospital: hospital.toPublicJSON()
    });
  } catch (error) {
    console.error('Create hospital error:', error);
    res.status(500).json({ message: 'Failed to create hospital' });
  }
};

export const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).lean();

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    res.json(hospital.toPublicJSON ? hospital.toPublicJSON() : hospital);
  } catch (error) {
    console.error('Get hospital error:', error);
    res.status(500).json({ message: 'Failed to fetch hospital' });
  }
};

export const getAvailableSchemes = async (req, res) => {
  try {
    const schemes = Hospital.getSchemes();
    const schemeDetails = {
      CMCHIS: { name: 'CMCHIS', description: 'Chief Minister\'s Comprehensive Health Insurance', type: 'government' },
      PMJAY: { name: 'Ayushman Bharat PM-JAY', description: 'National Health Protection Scheme', type: 'government' },
      TN_UHS: { name: 'TN UHS', description: 'Tamil Nadu Urban Health Scheme', type: 'government' },
      STAR_HEALTH: { name: 'Star Health', description: 'Private Health Insurance', type: 'private' },
      HDFC_ERGO: { name: 'HDFC ERGO', description: 'HDFC ERGO Health Insurance', type: 'private' },
      ICICI_LOMBARD: { name: 'ICICI Lombard', description: 'ICICI Lombard Health Insurance', type: 'private' },
      OTHER: { name: 'Other Schemes', description: 'Other Insurance Schemes', type: 'other' }
    };

    res.json(schemes.map(code => ({
      code,
      ...schemeDetails[code]
    })));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch schemes' });
  }
};
