import serial
import time
import re
from typing import Optional, Dict, Any

try:
    import serial
    SERIAL_AVAILABLE = True
except ImportError:
    SERIAL_AVAILABLE = False


class GSMHardware:
    def __init__(self, port='/dev/ttyUSB0', baudrate=9600):
        self.port = port
        self.baudrate = baudrate
        self.serial: Optional[serial.Serial] = None
        self._is_initialized = False

    def initialize(self) -> Dict[str, Any]:
        if not SERIAL_AVAILABLE:
            return {
                "available": False,
                "error": "pySerial library not installed"
            }

        try:
            print(f"🔌 Opening GSM port: {self.port} at {self.baudrate} baud")

            self.serial = serial.Serial(
                port=self.port,
                baudrate=self.baudrate,
                timeout=2,
                write_timeout=2,
                bytesize=serial.EIGHTBITS,
                parity=serial.PARITY_NONE,
                stopbits=serial.STOPBITS_ONE
            )

            # Give module time to stabilize
            time.sleep(3)

            # Clean buffers
            self.serial.reset_input_buffer()
            self.serial.reset_output_buffer()
            time.sleep(1)

            print("📡 Testing AT command...")

            # Try AT command up to 5 times (more robust)
            for attempt in range(5):
                response = self._send_command("AT", delay=1.5)
                print(f"   Attempt {attempt+1}: {response.strip() or 'No response'}")

                if "OK" in response:
                    self._is_initialized = True
                    signal = self._get_signal_strength()
                    print(f"✅ GSM Initialized Successfully! Signal: {signal.get('quality')}")
                    return {
                        "available": True,
                        "status": "ready",
                        "signal": signal,
                        "port": self.port
                    }
                time.sleep(1)

            # If failed, show debug info
            return {
                "available": False,
                "error": "GSM module not responding to AT commands",
                "debug": "Check power supply, SIM card, and antenna"
            }

        except Exception as e:
            return {
                "available": False,
                "error": f"Failed to open port {self.port}: {str(e)}"
            }

    def _send_command(self, command: str, delay: float = 1.5) -> str:
        if not self.serial or not self.serial.is_open:
            return ""

        try:
            self.serial.reset_input_buffer()
            self.serial.write(f"{command}\r\n".encode('utf-8'))
            time.sleep(delay)
            return self._read_response()
        except Exception as e:
            print(f"Send error: {e}")
            return ""

    def _read_response(self, timeout: float = 4.0) -> str:
        """Improved response reader - matches your successful minicom test"""
        if not self.serial:
            return ""

        response = ""
        start_time = time.time()

        while time.time() - start_time < timeout:
            if self.serial.in_waiting > 0:
                chunk = self.serial.read(self.serial.in_waiting).decode('utf-8', errors='ignore')
                response += chunk
                time.sleep(0.1)   # Allow more data to arrive
            else:
                time.sleep(0.15)

        return response.strip()

    def _get_signal_strength(self) -> Dict[str, Any]:
        response = self._send_command("AT+CSQ", delay=1.8)
        try:
            if "+CSQ:" in response:
                parts = response.split("+CSQ:")[1].split(",")[0].strip()
                rssi = int(parts)
                quality = "excellent" if rssi > 19 else "good" if rssi > 14 else "fair" if rssi > 9 else "poor"
                return {"rssi": rssi, "quality": quality}
        except:
            pass
        return {"rssi": None, "quality": "unknown"}

    def health_check(self) -> Dict[str, Any]:
        if not self._is_initialized:
            return {"status": "unavailable"}

        signal = self._get_signal_strength()
        return {
            "status": "online",
            "available": True,
            "signal": signal
        }

    def send_sms(self, phone: str, message: str) -> Dict[str, Any]:
        if not self._is_initialized:
            return {"error": "GSM module not initialized"}

        if not phone or not message:
            return {"error": "Phone number and message are required"}

        # Sanitize phone number - remove spaces and dashes
        phone = re.sub(r'[\s\-]', '', phone.strip())
        if not phone.startswith("+"):
            phone = "+" + phone
        
        # Validate phone format: + followed by 7-14 digits
        if not re.match(r'^\+?[1-9]\d{7,14}$', phone):
            return {"error": "Invalid phone number format. Use + followed by 7-14 digits."}

        # Sanitize message: remove newlines and carriage returns
        # AT commands are sensitive to these characters
        message = message.replace('\r\n', ' ').replace('\n', ' ').replace('\r', ' ')
        message = message.strip()
        
        # Validate message length (160 chars for single SMS)
        if len(message) > 160:
            message = message[:160]
            print(f"[GSM] Message truncated to 160 characters")

        try:
            self._send_command("AT+CMGF=1", delay=2)
            time.sleep(1)
            self._send_command(f'AT+CMGS="{phone}"', delay=2)
            time.sleep(1)

            self.serial.write(f"{message}\r\n".encode('utf-8'))
            self.serial.write(bytes([26]))  # Ctrl+Z

            time.sleep(7)
            response = self._read_response(timeout=10)

            if "OK" in response or "+CMGS:" in response:
                return {
                    "success": True,
                    "to": phone,
                    "message": "SMS sent successfully"
                }
            else:
                return {
                    "success": False,
                    "error": "SMS send failed",
                    "response": response[:300]
                }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def send_at_command(self, command: str) -> Dict[str, Any]:
        response = self._send_command(command, delay=1.5)
        return {"success": True, "response": response}

    def close(self):
        if self.serial and self.serial.is_open:
            self.serial.close()
