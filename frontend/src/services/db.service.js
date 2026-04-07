import { openDB } from 'idb';

const DB_NAME = 'SmartID_Medical_DB';
const STORE_NAME = 'offline_scans';

/**
 * DATABASE SCHEMA:
 * offline_scans: {
 *   id: Date.now(),
 *   nfcId: string,
 *   type: 'standard' | 'emergency',
 *   timestamp: string,
 *   synced: boolean
 * }
 */

export const initDB = async () => {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        },
    });
};

export const saveOfflineScan = async (scanData) => {
    const db = await initDB();
    return db.add(STORE_NAME, {
        ...scanData,
        timestamp: new Date().toISOString(),
        synced: false
    });
};

export const getPendingScans = async () => {
    const db = await initDB();
    const allScans = await db.getAll(STORE_NAME);
    return allScans.filter(s => !s.synced);
};

export const markAsSynced = async (id) => {
    const db = await initDB();
    const scan = await db.get(STORE_NAME, id);
    if (scan) {
        scan.synced = true;
        await db.put(STORE_NAME, scan);
    }
};
