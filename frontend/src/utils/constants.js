// ===============================
// Smart-ID Frontend Constants
// ===============================

// Session & Timeout
export const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
export const SESSION_DEBOUNCE_DELAY = 1000; // 1 second debounce for activity events

// Polling & Sync
export const OFFLINE_POLLING_INTERVAL = 30 * 1000; // 30 seconds (optimized from 5s)
export const TOAST_DURATION = 4000; // 4 seconds

// API Configuration
export const API_TIMEOUT = 10000; // 10 seconds

// Validation
export const PHONE_REGEX = /^[6-9]\d{9}$/;
export const OTP_LENGTH = 6;
export const MIN_PASSWORD_LENGTH = 8;

// UI
export const MOBILE_BREAKPOINT = 768;
export const TABLET_BREAKPOINT = 1024;

// Animation Durations
export const ANIMATION_DURATION = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
};

// API Endpoints (for reference)
export const ENDPOINTS = {
    AUTH: '/auth',
    OTP: '/otp',
    PATIENT: '/patient',
    CONSENT: '/consent',
    NFC: '/nfc',
    AUDIT: '/audit',
    ADMIN: '/admin',
    MEDICAL_SHOP: '/medical-shop',
    HOSPITAL: '/hospital',
    DOCTOR: '/doctor'
};

// Local Storage Keys
export const STORAGE_KEYS = {
    TOKEN: 'smartid_token',
    USER: 'smartid_user',
    THEME: 'smartid_theme',
    OFFLINE_DATA: 'smartid_offline'
};

// IndexedDB Configuration
export const DB_CONFIG = {
    NAME: 'smartid_offline_db',
    VERSION: 1,
    STORES: {
        PENDING_SCANS: 'pending_scans',
        CACHED_RECORDS: 'cached_records'
    }
};
