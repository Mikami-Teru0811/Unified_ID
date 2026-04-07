import Otp from "../models/Otp.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import LoginAudit from "../models/LoginAudit.js";
import Patient from "../models/Patient.js";
import { emitToPatient, emitToMedicalStaff } from "../config/socket.js";
import smsService from "../utils/smsService.js";

// Timing-safe OTP comparison to prevent timing attacks
const safeCompareOTP = (inputOtp, storedOtp) => {
    if (!inputOtp || !storedOtp) return false;
    if (inputOtp.length !== storedOtp.length) return false;
    return crypto.timingSafeEqual(
        Buffer.from(inputOtp),
        Buffer.from(storedOtp)
    );
};

// SMS Message Templates
const SMS_MESSAGES = {
    PATIENT: (otp) => `Smart-ID: Your verification OTP is ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`,
    NOMINEE: (otp, patientName) => `Smart-ID: Emergency consent OTP for ${patientName}'s medical records. OTP: ${otp}. Valid for 5 minutes. This request was made by a hospital for emergency medical care.`
};

// SEND OTP
export const sendOtp = async (req, res) => {
    try {
        const { phone, purpose = 'login', isNominee = false, patientId } = req.body;

        if (!phone) {
            return res.status(400).json({
                error: "Phone number is required"
            });
        }

        let finalPhone = phone;
        let nomineeName = null;
        let nomineePhone = null;
        let patientName = null;

        // If nominee OTP requested, fetch nominee details from patient record
        if (isNominee && patientId) {
            const patient = await Patient.findById(patientId)
                .select('emergencyContact fullName');

            if (!patient) {
                return res.status(404).json({
                    error: "Patient not found"
                });
            }

            if (!patient.emergencyContact?.phone) {
                return res.status(400).json({
                    error: "Nominee contact not configured for this patient"
                });
            }

            finalPhone = patient.emergencyContact.phone;
            nomineeName = patient.emergencyContact.name || 'Nominee';
            nomineePhone = patient.emergencyContact.phone;
            patientName = patient.fullName;
        }

        // Additional Phone-Level Protection (Security)
        const recentRequests = await LoginAudit.countDocuments({
            phone: finalPhone,
            status: { $in: ['OTP_SENT', 'NOMINEE_OTP_SENT'] },
            createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) }
        });

        if (recentRequests >= 3) {
            return res.status(429).json({
                error: "Too many OTP requests for this number. Try again in 10 minutes."
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 5 * 60 * 1000);

        // Save to Database with purpose to separate login vs consent OTPs
        const consentPurpose = isNominee ? `nominee_${patientId}` : `consent_${patientId || phone}`;
        
        await Otp.findOneAndUpdate(
            { phone: finalPhone, purpose: consentPurpose },
            { otp, expiresAt: expires, attempts: 0, createdAt: new Date() },
            { upsert: true }
        );

        // Determine SMS message based on recipient type
        const smsMessage = isNominee 
            ? SMS_MESSAGES.NOMINEE(otp, patientName)
            : SMS_MESSAGES.PATIENT(otp);

        try {
            const smsResult = await smsService.send(finalPhone, smsMessage);
            console.log('SMS sent successfully:', smsResult.messageId);
        } catch (smsError) {
            console.error('SMS send failed:', smsError.message);
            console.warn('OTP generated but SMS delivery failed. OTP:', otp);
        }

        // Record Audit Event
        await LoginAudit.create({
            phone: finalPhone,
            isNominee,
            nomineeName: nomineeName || null,
            patientName: patientName || null,
            patientId: patientId || null,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
            status: isNominee ? "NOMINEE_OTP_SENT" : "OTP_SENT"
        });

        // Response - OTP is NOT sent in response for security
        res.json({
            success: true,
            message: isNominee ? "OTP sent to nominee" : "OTP sent",
            isNominee,
            nomineeName: nomineeName || null,
            recipientPhone: finalPhone.slice(0, 3) + '*****' + finalPhone.slice(-4)
        });

        // Emit real-time notification via Socket.IO
        try {
            if (patientId) {
                emitToPatient(patientId, 'otp-status', {
                    status: isNominee ? 'nominee-sent' : 'sent',
                    purpose,
                    recipientPhone: finalPhone.slice(0, 3) + '*****' + finalPhone.slice(-4),
                    timestamp: new Date()
                });
            }

            emitToMedicalStaff('otp-sent', {
                patientId,
                isNominee,
                recipientPhone: finalPhone.slice(0, 3) + '*****' + finalPhone.slice(-4),
                timestamp: new Date()
            });
        } catch (socketError) {
            console.warn('Socket.IO notification failed:', socketError.message);
        }

    } catch (err) {
        console.error(err.response?.data || err);
        res.status(500).json({
            error: "SMS sending failed"
        });
    }
};

// VERIFY OTP
export const verifyOtp = async (req, res) => {
    const { phone, otp, purpose = 'login', isNominee = false, patientId } = req.body;

    try {
        if (!phone || !otp) {
            return res.status(400).json({ error: "Phone number and OTP are required" });
        }

        // Determine the purpose for lookup
        const consentPurpose = isNominee ? `nominee_${patientId}` : `consent_${patientId || phone}`;
        
        const record = await Otp.findOne({ phone, purpose: consentPurpose });

        if (!record) {
            return res.status(400).json({ error: "OTP not found or expired" });
        }

        if (record.expiresAt < new Date()) {
            return res.status(400).json({ error: "OTP expired" });
        }

        // Use timing-safe comparison to prevent timing attacks
        if (!safeCompareOTP(otp, record.otp)) {
            // Atomic increment of attempt counter
            const updatedRecord = await Otp.findOneAndUpdate(
                { phone, purpose: consentPurpose, attempts: { $lt: 3 } },
                { $inc: { attempts: 1 } },
                { returnDocument: 'after' }
            );

            if (!updatedRecord || updatedRecord.attempts >= 3) {
                await Otp.deleteOne({ phone, purpose: consentPurpose });

                // Get patient info for audit
                let patientInfo = {};
                if (patientId) {
                    const patient = await Patient.findById(patientId).select('emergencyContact fullName');
                    if (patient) {
                        patientInfo = {
                            nomineeName: patient.emergencyContact?.name || null,
                            patientName: patient.fullName
                        };
                    }
                }

                await LoginAudit.create({
                    phone,
                    ip: req.ip,
                    userAgent: req.headers["user-agent"],
                    status: isNominee ? "NOMINEE_VERIFY_FAILED" : "LOGIN_FAILED",
                    attempts: 3,
                    ...patientInfo
                });

                return res.status(403).json({
                    error: "Too many incorrect attempts. Please request a new OTP."
                });
            }

            const attemptsLeft = 3 - (updatedRecord?.attempts || 1);
            return res.status(400).json({ 
                error: "Invalid OTP",
                attemptsLeft
            });
        }

        await Otp.deleteOne({ phone, purpose: consentPurpose });

        // Record Audit Event on Success
        await LoginAudit.create({
            phone,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
            status: isNominee ? "NOMINEE_CONSENT_GRANTED" : "LOGIN_SUCCESS"
        });

        // If this is a consent OTP (for clinical notes), return success
        if (purpose === 'consent' || isNominee) {
            return res.json({
                success: true,
                message: isNominee ? "Nominee consent verified" : "OTP verified",
                consentType: isNominee ? "NOMINEE" : "PATIENT"
            });
        }

        // If this is a login OTP, proceed with login
        const patient = await Patient.findOne({ phone }).populate('user');

        if (!patient?.user) {
            return res.status(404).json({
                error: "No patient account is linked to this phone number"
            });
        }

        // Reduced JWT expiry from 10 days to 1 hour for better security
        const token = jwt.sign(
            {
                id: patient.user._id,
                patientId: patient._id,
                phone,
                role: patient.user.role,
                name: patient.user.name,
                username: patient.user.username
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful",
            success: true,
            token,
            user: {
                id: patient.user._id,
                patientId: patient._id,
                name: patient.user.name,
                username: patient.user.username,
                role: patient.user.role,
                phone: patient.phone
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};
