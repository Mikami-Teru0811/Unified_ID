import { useState, useEffect, useCallback } from "react";

/**
 * useNfc Hook - Handles real Web NFC (Android) and Keyboard-Emulated NFC (Desktop)
 * Includes a simulation mode for development.
 */
export const useNfc = (onScanSuccess) => {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);

    // 1. KEYBOARD EMULATION HANDLER (For Desktop USB Readers)
    // Many readers type the serial number + Enter
    useEffect(() => {
        let inputBuffer = "";
        let lastKeyTime = Date.now();

        const handleKeyDown = (e) => {
            const currentTime = Date.now();

            // If typing is very fast (< 50ms per key), it's likely a scanner
            if (currentTime - lastKeyTime > 50) {
                inputBuffer = ""; // Reset if too slow
            }

            if (e.key === "Enter") {
                if (inputBuffer.length > 5) {
                    console.log("NFC USB Reader Detected:", inputBuffer);
                    onScanSuccess?.(inputBuffer);
                    inputBuffer = "";
                }
            } else if (e.key.length === 1) {
                inputBuffer += e.key;
            }

            lastKeyTime = currentTime;
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onScanSuccess]);

    // 2. WEB NFC HANDLER (For Chrome Android)
    const startWebNfc = useCallback(async () => {
        if (!("NDEFReader" in window)) {
            setError("Web NFC is not supported on this browser.");
            return;
        }

        try {
            setIsScanning(true);
            const ndef = new window.NDEFReader();
            await ndef.scan();

            ndef.onreading = (event) => {
                const { serialNumber } = event;
                onScanSuccess?.(serialNumber);
                setIsScanning(false);
            };
        } catch (err) {
            setError("NFC Scan failed: " + err.message);
            setIsScanning(false);
        }
    }, [onScanSuccess]);

    // 3. MANUAL SIMULATION (Restored as primary method while WebSockets are disabled)
    const simulateScan = (mockId = "NFC-SIM-9901") => {
        setIsScanning(true);
        setTimeout(() => {
            onScanSuccess?.(mockId);
            setIsScanning(false);
        }, 1500);
    };

    return { isScanning, error, startWebNfc, simulateScan };
};
