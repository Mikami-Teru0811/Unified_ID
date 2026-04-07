import Consent from '../models/Consent.js';
import Patient from '../models/Patient.js';

// 🟢 REQUEST CONSENT (Doctor / Hospital)
export const requestConsent = async (req, res) => {
  try {
    const { patientId, purpose, validTill } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const existingConsent = await Consent.findOne({
      patient: patientId,
      requester: req.user.id,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingConsent) {
      return res.status(400).json({
        message: 'Consent request already exists'
      });
    }

    const consent = await Consent.create({
      patient: patientId,
      requester: req.user.id,
      requesterRole: req.user.role,
      purpose,
      validTill
    });

    res.status(201).json({
      message: 'Consent request sent successfully',
      consent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error while requesting consent'
    });
  }
};

// 🔵 VIEW MY CONSENT REQUESTS (Patient)
export const getMyConsentRequests = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const consents = await Consent.find({ patient: patient._id })
      .populate('requester', 'name username role')
      .sort({ createdAt: -1 });

    res.json(consents);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error while fetching consents'
    });
  }
};

// 🟡 APPROVE OR REJECT CONSENT (Patient)
export const respondToConsent = async (req, res) => {
  try {
    const { consentId, action } = req.body;

    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    // Find patient by user ID (JWT only contains user ID, not patientId)
    const patient = await Patient.findOne({ user: req.user.id });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Verify the patient owns this consent before allowing response
    const consent = await Consent.findOne({ 
      _id: consentId,
      patient: patient._id 
    }).populate('patient');

    if (!consent) {
      return res.status(404).json({ message: 'Consent not found or unauthorized' });
    }

    consent.status = action;
    await consent.save();

    res.json({
      message: `Consent ${action} successfully`,
      consent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error while responding to consent'
    });
  }
};

// 🔴 REVOKE CONSENT (Patient)
export const revokeConsent = async (req, res) => {
  try {
    const { consentId } = req.body;

    // Find patient by user ID (JWT only contains user ID, not patientId)
    const patient = await Patient.findOne({ user: req.user.id });
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    // Verify the patient owns this consent before allowing revoke
    const consent = await Consent.findOne({ 
      _id: consentId,
      patient: patient._id 
    });

    if (!consent) {
      return res.status(404).json({ message: 'Consent not found or unauthorized' });
    }

    consent.status = 'revoked';
    await consent.save();

    res.json({
      message: 'Consent revoked successfully',
      consent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server error while revoking consent'
    });
  }
};
