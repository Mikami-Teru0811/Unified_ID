/**
 * NFC Service - Handles NFC data processing for different contexts
 */

export function simulateNFCTap(payload) {
    if (payload.type === "patient") {
        return { action: "VIEW_PATIENT", id: payload.id };
    }

    if (payload.type === "staff") {
        return { action: "LOG_STAFF_ACTIVITY", id: payload.id };
    }

    return null;
}

/**
 * Processes raw NFC serial number into a payload
 * In a real app, this would query a registry to see what type of card it is
 */
export async function processNFCTap(serialNumber) {
    // Mock logic: Cards starting with 'PAT' are patients, 'STF' are staff
    if (serialNumber.startsWith('PAT')) {
        return { type: 'patient', id: serialNumber };
    }
    if (serialNumber.startsWith('STF')) {
        return { type: 'staff', id: serialNumber };
    }

    // Default or unknown
    return { type: 'patient', id: serialNumber };
}
