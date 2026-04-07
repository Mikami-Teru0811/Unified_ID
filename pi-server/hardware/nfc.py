import time
from typing import Optional, Dict, Any

try:
    from mfrc522 import SimpleMFRC522
    NFC_AVAILABLE = True
except ImportError:
    NFC_AVAILABLE = False


class NFCHardware:
    def __init__(self):
        self.reader: Optional[SimpleMFRC522] = None
        self._is_initialized = False
        self._scan_start_time: float = 0
        self._timeout_seconds = 30

    def initialize(self) -> Dict[str, Any]:
        if not NFC_AVAILABLE:
            return {
                "available": False,
                "error": "mfrc522 library not installed"
            }
        
        try:
            self.reader = SimpleMFRC522()
            self._is_initialized = True
            return {
                "available": True,
                "status": "ready"
            }
        except Exception as e:
            return {
                "available": False,
                "error": str(e)
            }

    def health_check(self) -> Dict[str, Any]:
        if not self._is_initialized:
            return {"status": "unavailable"}
        
        try:
            return {
                "status": "online",
                "available": True
            }
        except Exception as e:
            return {
                "status": "error",
                "available": False,
                "error": str(e)
            }

    def start_scan(self) -> Dict[str, Any]:
        if not self._is_initialized:
            return {"error": "NFC reader not initialized"}
        
        self._scan_start_time = time.time()
        return {
            "success": True,
            "message": "Tap NFC card...",
            "status": "waiting"
        }

    def poll_scan(self) -> Dict[str, Any]:
        if not self._is_initialized or not self.reader:
            return {"error": "NFC reader not initialized"}
        
        if time.time() - self._scan_start_time > self._timeout_seconds:
            return {
                "status": "timeout",
                "error": "NFC scan timed out"
            }
        
        try:
            id, text = self.reader.read()
            
            if id:
                return {
                    "success": True,
                    "nfcId": str(id),
                    "nfcText": text if text else None,
                    "message": f"NFC card detected: {id}"
                }
            
            return {
                "status": "waiting",
                "message": "Waiting for NFC card..."
            }
        
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }

    def read_card(self, timeout: Optional[int] = None) -> Dict[str, Any]:
        timeout = timeout or self._timeout_seconds
        start_time = time.time()
        
        if not self._is_initialized:
            return {"error": "NFC reader not initialized"}
        
        while time.time() - start_time < timeout:
            try:
                id, text = self.reader.read()
                
                if id:
                    return {
                        "success": True,
                        "nfcId": str(id),
                        "nfcText": text if text else None,
                        "scanTime": time.time() - start_time
                    }
            except Exception as e:
                return {
                    "success": False,
                    "error": str(e)
                }
        
        return {
            "success": False,
            "error": "NFC scan timed out"
        }
