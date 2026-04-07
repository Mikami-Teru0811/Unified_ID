import Patient from '../models/Patient.js';

const getPatientPrescriptions = (patient) => {
  const history = patient.medicalHistory || [];

  if (history.length === 0) {
    return [
      {
        id: `${patient._id}-default`,
        name: 'General medication plan',
        notes: 'No structured prescription has been recorded yet.',
        issuedAt: patient.updatedAt
      }
    ];
  }

  return history.map((entry, index) => ({
    id: `${patient._id}-${index + 1}`,
    name: entry.condition || `Prescription ${index + 1}`,
    notes: entry.notes || 'No additional notes',
    issuedAt: entry.diagnosedDate || patient.updatedAt
  }));
};

const buildPdfBuffer = ({ patient, prescription }) => {
  const lines = [
    'Smart ID Prescription Summary',
    `Patient: ${patient.fullName}`,
    `NFC ID: ${patient.nfcUuid || 'Not linked'}`,
    `Phone: ${patient.phone || 'N/A'}`,
    `Prescription: ${prescription.name}`,
    `Issued: ${new Date(prescription.issuedAt).toLocaleString()}`,
    `Notes: ${prescription.notes}`
  ];

  const escapePdfText = (value) =>
    String(value)
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');

  const content = [
    'BT',
    '/F1 16 Tf',
    '50 780 Td',
    ...lines.flatMap((line, index) => [
      index === 0 ? `(${escapePdfText(line)}) Tj` : `0 -24 Td (${escapePdfText(line)}) Tj`
    ]),
    'ET'
  ].join('\n');

  const objects = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  objects.push('2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj');
  objects.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj');
  objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
  objects.push(`5 0 obj\n<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}\nendstream\nendobj`);

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${object}\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'utf8');
};

export const scanPatientForMedicalShop = async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ message: 'NFC UID is required' });
    }

    const patient = await Patient.findOne({ nfcUuid: uid }).populate('user', 'name username role');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found for this NFC card' });
    }

    res.json({
      patient: {
        id: patient._id,
        fullName: patient.fullName,
        name: patient.fullName,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        bloodGroup: patient.bloodGroup,
        nfcUuid: patient.nfcUuid,
        prescriptions: getPatientPrescriptions(patient)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to scan patient card' });
  }
};

export const getPrescriptionPdf = async (req, res) => {
  try {
    const prescriptionId = decodeURIComponent(req.params.prescriptionId);
    const lastHyphenIndex = prescriptionId.lastIndexOf('-');
    const patientId = prescriptionId.substring(0, lastHyphenIndex);
    const suffix = prescriptionId.substring(lastHyphenIndex + 1);

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const prescriptions = getPatientPrescriptions(patient);
    const prescription = prescriptions.find((item) => item.id === prescriptionId)
      || prescriptions[Number(suffix) - 1]
      || prescriptions[0];

    const pdfBuffer = buildPdfBuffer({ patient, prescription });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="prescription-${prescriptionId}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate prescription PDF' });
  }
};

export const markAsDispensed = async (req, res) => {
  try {
    const { prescriptionId, patientId } = req.body;

    if (!prescriptionId || !patientId) {
      return res.status(400).json({ message: 'Prescription ID and Patient ID are required' });
    }

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (!patient.dispensedPrescriptions) {
      patient.dispensedPrescriptions = [];
    }

    if (!patient.dispensedPrescriptions.includes(prescriptionId)) {
      patient.dispensedPrescriptions.push(prescriptionId);
      await patient.save();
    }

    res.json({
      success: true,
      message: 'Prescription marked as dispensed',
      prescriptionId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to mark prescription as dispensed' });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId).populate('user', 'name username role');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      patient: {
        id: patient._id,
        fullName: patient.fullName,
        name: patient.fullName,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        bloodGroup: patient.bloodGroup,
        nfcUuid: patient.nfcUuid,
        address: patient.address,
        emergencyContact: patient.emergencyContact,
        prescriptions: getPatientPrescriptions(patient),
        dispensedPrescriptions: patient.dispensedPrescriptions || []
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch patient details' });
  }
};
