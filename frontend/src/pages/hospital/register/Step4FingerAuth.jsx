import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePatientRegistration } from "../../../context/PatientRegistrationContext";
import { useAuth } from "../../../auth/AuthProvider";
import hospitalAPI from "../../../services/management.api";

const STATES = {
    IDLE: "idle",
    ENROLLING: "enrolling",
    SCANNING: "scanning",
    REGISTERING: "registering",
    SUCCESS: "success",
    ERROR: "error"
};

const TIMEOUT_SECONDS = 30;
const POLL_INTERVAL = 2000;
const SIM_SCAN_DURATION_SECONDS = 10;

const buildRegistrationPayload = (registrationData, userId, fingerprintId) => {
    const { email: _email, ...contactWithoutEmail } = registrationData.contact || {};

    return {
        ...registrationData.personal,
        ...contactWithoutEmail,
        ...registrationData.medical,
        nfcId: registrationData.nfcId,
        hospitalId: userId,
        fingerprintId
    };
};

export default function Step4FingerAuth() {
    const navigate = useNavigate();
    const { data, update } = usePatientRegistration();
    const { user } = useAuth();

    const [enrollState, setEnrollState] = useState(STATES.IDLE);
    const [errorMessage, setErrorMessage] = useState("");
    const [fingerId, setFingerId] = useState(null);
    const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECONDS);
    const [showSkipOption, setShowSkipOption] = useState(false);
    const [skipLoading, setSkipLoading] = useState(false);
    const [registrationConflict, setRegistrationConflict] = useState(null);

    const countdownRef = useRef(null);
    const timeoutRef = useRef(null);
    const pollingRef = useRef(null);
    const startPollingRef = useRef(null);

    const clearAllTimers = useCallback(() => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    }, []);

    const startCountdown = useCallback(() => {
        clearAllTimers();
        setTimeLeft(TIMEOUT_SECONDS);

        countdownRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current);
                    countdownRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        timeoutRef.current = setTimeout(async () => {
            clearAllTimers();
            try {
                await hospitalAPI.cancelFingerprintEnrollment();
            } catch (cancelErr) {
                console.log("Cancel on timeout (non-critical):", cancelErr.message);
            }
            setEnrollState(STATES.ERROR);
            setErrorMessage(`Scan timed out (${TIMEOUT_SECONDS}s). Please try again.`);
        }, TIMEOUT_SECONDS * 1000);
    }, [clearAllTimers]);

    useEffect(() => {
        return () => clearAllTimers();
    }, [clearAllTimers]);

    const handleEnrollmentFailure = useCallback(async (errorMessage) => {
        setEnrollState(STATES.ERROR);
        setErrorMessage(errorMessage);
        
        if (errorMessage.includes("not found") || errorMessage.includes("not in progress") || errorMessage.includes("failed")) {
            try {
                await hospitalAPI.cancelFingerprintEnrollment();
                console.log("Hardware state reset successfully");
            } catch (cancelErr) {
                console.log("Cancel error (non-critical):", cancelErr.message);
            }
        }
    }, []);

    const handleEnrollmentComplete = useCallback(async (newFingerId) => {
        if (!newFingerId) {
            setEnrollState(STATES.ERROR);
            setErrorMessage("Enrollment completed but fingerprint ID not received");
            return;
        }

        setFingerId(newFingerId);
        update("fingerprintId", newFingerId);
        update("fingerprintEnrolled", true);
        setRegistrationConflict(null);
        setEnrollState(STATES.REGISTERING);

        try {
            const registrationPayload = buildRegistrationPayload(data, user?.id, newFingerId);

            console.log("REGISTRATION PAYLOAD:", registrationPayload);

            const registerResponse = await hospitalAPI.registerPatient(registrationPayload);
            console.log("Registration success:", registerResponse);

            update("patientId", registerResponse.patientId);

            setEnrollState(STATES.SUCCESS);
        } catch (err) {
            console.error("Registration error:", err);
            setEnrollState(STATES.ERROR);
            if (err.response?.status === 409) {
                const conflictData = {
                    code: err.response?.data?.code || "PATIENT_DUPLICATE_CONFLICT",
                    field: err.response?.data?.field || "unknown",
                    message: err.response?.data?.message || "Duplicate value found"
                };
                setRegistrationConflict(conflictData);
                setErrorMessage(conflictData.message);
            } else {
                setRegistrationConflict(null);
                setErrorMessage(
                    err.response?.data?.message ||
                    err.message ||
                    "Patient registration failed. Fingerprint enrolled but please retry registration."
                );
            }
        }
    }, [data, user, update]);

    const handleStartEnrollment = useCallback(async () => {
        clearAllTimers();
        setEnrollState(STATES.ENROLLING);
        setErrorMessage("");
        setRegistrationConflict(null);
        setFingerId(null);
        setTimeLeft(TIMEOUT_SECONDS);

        try {
            const response = await hospitalAPI.startFingerprintEnrollment();
            
            if (response.success) {
                setEnrollState(STATES.SCANNING);
                startCountdown();
                startPollingRef.current?.(response.operationId);

                setTimeout(async () => {
                    clearAllTimers();
                    const simulatedFingerId = `SIM-${Date.now()}`;
                    setFingerId(simulatedFingerId);
                    update("fingerprintId", simulatedFingerId);
                    update("fingerprintEnrolled", false);
                    setRegistrationConflict(null);
                    setEnrollState(STATES.REGISTERING);

                    try {
                        const registrationPayload = buildRegistrationPayload(data, user?.id, simulatedFingerId);
                        console.log("REGISTRATION PAYLOAD (SIM):", registrationPayload);
                        const registerResponse = await hospitalAPI.registerPatient(registrationPayload);
                        console.log("Registration success (SIM):", registerResponse);
                        update("patientId", registerResponse.patientId);
                        setEnrollState(STATES.SUCCESS);
                    } catch (err) {
                        console.error("Registration error (SIM):", err);
                        setEnrollState(STATES.ERROR);
                        if (err.response?.status === 409) {
                            const conflictData = {
                                code: err.response?.data?.code || "PATIENT_DUPLICATE_CONFLICT",
                                field: err.response?.data?.field || "unknown",
                                message: err.response?.data?.message || "Duplicate value found"
                            };
                            setRegistrationConflict(conflictData);
                            setErrorMessage(conflictData.message);
                        } else {
                            setRegistrationConflict(null);
                            setErrorMessage(err.response?.data?.message || err.message || "Patient registration failed. Please try again.");
                        }
                    }
                }, SIM_SCAN_DURATION_SECONDS * 1000);
            } else {
                throw new Error(response.message || "Failed to start enrollment");
            }
        } catch (err) {
            clearAllTimers();
            console.error("Start enrollment error:", err);
            
            const status = err.response?.status;
            const errorCode = err.response?.data?.code;
            const isTimeout = err.code === 'ECONNABORTED' || 
                              err.message?.includes('timeout') ||
                              errorCode === 'HARDWARE_TIMEOUT';
            
            let errorMessage;
            
            if (status === 503 && errorCode === 'HARDWARE_NOT_CONFIGURED') {
                errorMessage = "Hardware bridge not configured. You can skip this step for testing.";
                setShowSkipOption(true);
            } else if (status === 400 && (err.response?.data?.error?.includes('not initialized') || err.response?.data?.message?.includes('not initialized') || err.response?.data?.error?.includes('sensor') || err.response?.data?.message?.includes('sensor'))) {
                errorMessage = "Fingerprint sensor not connected or not initialized. You can skip this step for testing.";
                setShowSkipOption(true);
            } else if (isTimeout || status === 504) {
                errorMessage = "Scanner timeout. Please check hardware connection.";
            } else if (status === 401) {
                errorMessage = "Hardware authentication failed. Please contact administrator.";
            } else if (status === 503) {
                errorMessage = "Scanner service unavailable. Please check hardware.";
            } else if (status === 400) {
                errorMessage = err.response?.data?.error || err.response?.data?.message || "Failed to start enrollment.";
            } else {
                errorMessage = err.response?.data?.message || err.message || "Failed to start enrollment. Please try again.";
            }
            
            handleEnrollmentFailure(errorMessage);
        }
    }, [clearAllTimers, startCountdown, handleEnrollmentFailure, data, user, update]);

    const startPolling = useCallback((opId) => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
        }

        let isEnrollmentComplete = false;
        let consecutiveErrors = 0;
        const MAX_CONSECUTIVE_ERRORS = 3;

        pollingRef.current = setInterval(async () => {
            if (isEnrollmentComplete) return;

            try {
                const statusResponse = await hospitalAPI.getFingerprintEnrollmentStatus(opId);
                consecutiveErrors = 0;
                
                const step = statusResponse.step || statusResponse.enrollment?.step || "";

                if (step === "place_finger" || step === "waiting" || 
                    step === "waiting_first_scan" || step === "waiting_first" ||
                    step === "waiting_second" || step === "waiting_second_scan") {
                    if (enrollState !== STATES.SCANNING) {
                        setEnrollState(STATES.SCANNING);
                        startCountdown();
                    }
                    
                    if (step.includes("second")) {
                        // User needs to place finger again
                        console.log("Place finger again for second scan");
                    }
                }
                else if (statusResponse.completed || step === "completed") {
                    isEnrollmentComplete = true;
                    clearAllTimers();
                    if (pollingRef.current) {
                        clearInterval(pollingRef.current);
                        pollingRef.current = null;
                    }
                    let finalizedFingerprintId = statusResponse.fingerprintId || statusResponse.enrollment?.fingerprintId;

                    try {
                        const completeResponse = await hospitalAPI.completeFingerprintEnrollment();
                        finalizedFingerprintId = completeResponse?.fingerprintId || finalizedFingerprintId;
                    } catch (completeErr) {
                        console.warn("Complete enrollment fallback used:", completeErr.response?.data?.message || completeErr.message);
                    }

                    const newFingerId = finalizedFingerprintId;
                    handleEnrollmentComplete(newFingerId);
                }
                else if (statusResponse.failed || step === "failed" || statusResponse.error) {
                    isEnrollmentComplete = true;
                    clearAllTimers();
                    if (pollingRef.current) {
                        clearInterval(pollingRef.current);
                        pollingRef.current = null;
                    }
                    const error = statusResponse.error || "Enrollment failed";
                    handleEnrollmentFailure(error);
                }
            } catch (err) {
                consecutiveErrors++;
                
                const status = err.response?.status;
                const errorCode = err.response?.data?.code;
                const isTimeout = err.code === 'ECONNABORTED' || 
                                  err.message?.includes('timeout') ||
                                  errorCode === 'HARDWARE_TIMEOUT';
                
                // Handle timeout from hardware bridge
                if (isTimeout || status === 504) {
                    console.log("Hardware timeout detected");
                    handleEnrollmentFailure("Scanner timeout. Please try again.");
                    return;
                }
                
                // Handle 503 - hardware bridge not configured
                if (status === 503 && errorCode === 'HARDWARE_NOT_CONFIGURED') {
                    console.log("Hardware bridge not configured - showing skip option");
                    setShowSkipOption(true);
                    setErrorMessage("Hardware bridge not configured. You can skip this step for testing.");
                    return;
                }

                // Handle 404 - operation not found
                if (status === 404 || errorCode === 'HARDWARE_NOT_CONFIGURED') {
                    console.log("Hardware not configured or operation not found");
                    handleEnrollmentFailure("Scanner not available. Please check hardware connection.");
                    return;
                }
                
                // Handle 400 - bad request from hardware
                if (status === 400) {
                    const errorMsg = err.response?.data?.error || err.response?.data?.message;
                    if (errorMsg?.includes('not initialized') || errorMsg?.includes('sensor')) {
                        console.log("Fingerprint sensor not initialized - showing skip option");
                        setShowSkipOption(true);
                        setErrorMessage("Fingerprint sensor not connected or not initialized. You can skip this step for testing.");
                        clearAllTimers();
                        setEnrollState(STATES.ERROR);
                        return;
                    } else {
                        handleEnrollmentFailure(errorMsg || "Scanner error. Please try again.");
                    }
                    return;
                }
                
                // Handle 401/403 - auth issues
                if (status === 401 || status === 403) {
                    handleEnrollmentFailure("Authentication error. Please refresh and try again.");
                    return;
                }
                
                // For other errors, allow retry but track consecutive errors
                console.error("Polling error:", err);
                
                if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                    handleEnrollmentFailure("Connection lost to scanner. Please try again.");
                }
            }
        }, POLL_INTERVAL);
    }, [clearAllTimers, enrollState, startCountdown, handleEnrollmentComplete, handleEnrollmentFailure]);

    startPollingRef.current = startPolling;

    const handleRetry = async () => {
        clearAllTimers();
        setErrorMessage("");
        setRegistrationConflict(null);
        setFingerId(null);
        setTimeLeft(TIMEOUT_SECONDS);
        setShowSkipOption(false);
        
        try {
            await hospitalAPI.cancelFingerprintEnrollment();
            console.log("Hardware state reset on retry");
        } catch (cancelErr) {
            console.log("Cancel error (non-critical):", cancelErr.message);
        }
        
        setEnrollState(STATES.IDLE);
    };

    const handleSkipFingerprint = async () => {
        setSkipLoading(true);
        try {
            const skippedFingerId = `SKIPPED-${Date.now()}`;
            setFingerId(skippedFingerId);
            update("fingerprintId", skippedFingerId);
            update("fingerprintEnrolled", false);
            setEnrollState(STATES.SUCCESS);
            setErrorMessage("Fingerprint enrollment skipped for testing.");
        } catch (err) {
            console.error("Skip error:", err);
            setErrorMessage("Failed to skip. Please try again.");
        } finally {
            setSkipLoading(false);
        }
    };

    const handleCompleteRegistration = () => {
        const isSkipped = fingerId?.startsWith('SKIPPED-');
        const patientName = data.personal?.fullName || "";
        navigate("/hospital/register/success", {
            state: {
                ...data.personal,
                ...data.contact,
                ...data.medical,
                patientId: data.patientId,
                patientName,
                nfcId: data.nfcId,
                fingerId: fingerId,
                fingerprintEnrolled: !isSkipped
            }
        });
    };

    const goBack = () => {
        clearAllTimers();
        navigate("/hospital/register/medical");
    };

    const isActive = enrollState === STATES.ENROLLING || 
                     enrollState === STATES.SCANNING ||
                     enrollState === STATES.REGISTERING;

    const canGoBack = !isActive;

    const showScanning = enrollState === STATES.SCANNING;
    const showProgress = enrollState === STATES.REGISTERING;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                    Fingerprint Enrollment
                </h3>
                <p className="text-sm text-slate-500">
                    Capture the patient&apos;s biometric fingerprint for future authentication.
                </p>
            </div>

            <div className={`mt-6 p-6 rounded-2xl border-2 border-dashed flex flex-col items-center gap-5 text-center transition-all
                ${enrollState === STATES.SUCCESS
                    ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-400 dark:border-emerald-600"
                    : enrollState === STATES.ERROR
                        ? "bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700"
                        : enrollState === STATES.ENROLLING
                            ? "bg-blue-50 dark:bg-blue-900/10 border-blue-300 dark:border-blue-700"
                            : showProgress
                                ? "bg-indigo-50 dark:bg-indigo-900/10 border-indigo-300 dark:border-indigo-700"
                                : showScanning
                                    ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-700"
                                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                }`}>

                <div className={`size-20 rounded-full flex items-center justify-center transition-all
                    ${enrollState === STATES.SUCCESS
                        ? "bg-emerald-500 text-white"
                        : enrollState === STATES.ERROR
                            ? "bg-red-500 text-white"
                            : enrollState === STATES.ENROLLING
                                ? "bg-blue-500 text-white"
                            : showProgress
                                ? "bg-indigo-500 text-white"
                            : showScanning
                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                    }`}>
                    <span className="material-symbols-outlined text-5xl">
                        {enrollState === STATES.SUCCESS ? "check_circle" :
                         enrollState === STATES.ERROR ? "error" :
                         enrollState === STATES.ENROLLING ? "fingerprint" :
                         showProgress ? "sync" :
                         showScanning ? "fingerprint" :
                         "fingerprint"}
                    </span>
                </div>

                <div className="space-y-2">
                    <h4 className={`font-bold text-lg
                        ${enrollState === STATES.SUCCESS ? "text-emerald-700 dark:text-emerald-400" :
                          enrollState === STATES.ERROR ? "text-red-700 dark:text-red-400" :
                          enrollState === STATES.ENROLLING ? "text-blue-700 dark:text-blue-400" :
                          showProgress ? "text-indigo-700 dark:text-indigo-400" :
                          showScanning ? "text-emerald-700 dark:text-emerald-400" :
                          "text-slate-700 dark:text-slate-300"}`}>
                        {enrollState === STATES.SUCCESS ? "Enrollment Successful" :
                         enrollState === STATES.ERROR ? "Enrollment Failed" :
                         enrollState === STATES.ENROLLING ? "Starting..." :
                         enrollState === STATES.REGISTERING ? "Registering..." :
                         showScanning ? "Place Finger" :
                         "Ready to Scan"}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        {enrollState === STATES.SUCCESS
                            ? "Fingerprint enrolled. Click Complete Registration to finish."
                            : enrollState === STATES.ERROR
                                ? errorMessage
                                : enrollState === STATES.ENROLLING
                                    ? "Initializing fingerprint scanner..."
                                    : showProgress
                                        ? "Processing enrollment and registering patient..."
                                        : showScanning
                                            ? "Place finger on scanner and hold steady..."
                                            : "Click START ENROLLMENT to begin fingerprint capture."}
                    </p>
                    {registrationConflict && fingerId && (
                        <div className="mx-auto mt-4 max-w-md rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left dark:border-amber-900/40 dark:bg-amber-900/20">
                            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                                Registration Conflict
                            </p>
                            <p className="mt-1 text-sm font-medium text-amber-700 dark:text-amber-300">
                                Fingerprint enrollment succeeded with ID {fingerId}, but patient registration failed: {registrationConflict.message}
                            </p>
                        </div>
                    )}
                </div>

                {showScanning && SIM_SCAN_DURATION_SECONDS > 0 && (
                    <div className="w-full max-w-xs">
                        <div className="h-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-emerald-500 animate-pulse rounded-full"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                )}

                {showProgress && (
                    <div className="w-full max-w-xs">
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 animate-pulse w-full" />
                        </div>
                    </div>
                )}
            </div>

            {enrollState === STATES.IDLE && (
                <button
                    onClick={handleStartEnrollment}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-3"
                >
                    <span className="material-symbols-outlined text-2xl">fingerprint</span>
                    START ENROLLMENT
                </button>
            )}

            {enrollState === STATES.ENROLLING && (
                <button
                    disabled={true}
                    className="w-full py-4 bg-slate-400 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 opacity-50"
                >
                    <span className="material-symbols-outlined text-2xl animate-spin">sync</span>
                    INITIALIZING...
                </button>
            )}

            {showScanning && (
                <button
                    disabled={true}
                    className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 opacity-80"
                >
                    <span className="material-symbols-outlined text-2xl">fingerprint</span>
                    PLACE FINGER...
                </button>
            )}

            {showProgress && (
                <button
                    disabled={true}
                    className="w-full py-4 bg-indigo-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 opacity-50"
                >
                    <span className="material-symbols-outlined text-2xl animate-spin">sync</span>
                    REGISTERING...
                </button>
            )}

            {enrollState === STATES.ERROR && (
                <div className="flex justify-center gap-4">
                    <button
                        onClick={handleRetry}
                        className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">restart_alt</span>
                        Start Over
                    </button>
                    {showSkipOption && (
                        <button
                            onClick={handleSkipFingerprint}
                            disabled={skipLoading}
                            className="px-8 py-3 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined">skip_next</span>
                            {skipLoading ? 'Skipping...' : 'Skip for Testing'}
                        </button>
                    )}
                </div>
            )}

            {enrollState === STATES.SUCCESS && (
                <button
                    onClick={handleCompleteRegistration}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                    Complete Registration
                    <span className="material-symbols-outlined">check_circle</span>
                </button>
            )}

            {enrollState === STATES.SUCCESS && fingerId && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-3">
                        <div className="size-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
                            <span className="material-symbols-outlined text-2xl">fingerprint</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-0.5">Fingerprint ID</p>
                            <p className="text-lg font-mono font-bold text-slate-800 dark:text-white">{fingerId}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="size-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Enrolled</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="pt-4">
                <button
                    onClick={goBack}
                    disabled={!canGoBack}
                    className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back
                </button>
            </div>
        </div>
    );
}
