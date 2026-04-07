# Smart-ID Hardware Integration Guide

## Overview

This guide explains how to connect the Smart-ID software (backend + frontend) with the Raspberry Pi hardware (NFC, Fingerprint, GSM).

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│              Hospital / Doctor / Medical Shop                │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/Socket.IO
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                         │
│                   Port: 5000                                 │
│                                                             │
│  Hardware Bridge Client                                     │
│  HARDWARE_BRIDGE_URL=http://raspberrypi.local:5001         │
└────────────────────────────┬────────────────────────────────┘
                             │ mDNS (.local)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  RASPBERRY PI (Python)                       │
│                   Port: 5001                                 │
│                   (avahi-daemon running)                     │
│                                                             │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐            │
│  │    NFC    │  │  Fingerprint │  │   GSM    │            │
│  │  MFRC522  │  │     R307     │  │  SIM800L │            │
│  └──────────┘  └──────────────┘  └──────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: mDNS Setup on Raspberry Pi

### Quick Setup (Run on Pi)

```bash
cd ~/pi-server/scripts
chmod +x setup-mdns.sh
sudo ./setup-mdns.sh
```

### Manual Setup (if script fails)

1. Install avahi-daemon:
   ```bash
   sudo apt update
   sudo apt install -y avahi-daemon
   ```

2. Enable and start:
   ```bash
   sudo systemctl enable avahi-daemon
   sudo systemctl start avahi-daemon
   ```

3. Verify hostname:
   ```bash
   hostname
   # Should show: raspberrypi
   # mDNS name: raspberrypi.local
   ```

### Optional: Change Hostname

If you want a custom name like `smartid-pi`:

```bash
sudo hostnamectl set-hostname smartid-pi
sudo nano /etc/hosts
# Change 'raspberrypi' to 'smartid-pi' in the file
sudo reboot
```

Then use: `http://smartid-pi.local:5001`

---

## Step 2: Verify Pi Server

Ensure Pi server is running:
```bash
cd ~/pi-server
source venv/bin/activate
python server.py
```

Should see:
```
* Running on http://0.0.0.0:5001
```

---

## Step 3: Test mDNS Resolution

### From any computer on the network:

```bash
# Test hostname resolution
ping raspberrypi.local

# Test Pi server health via mDNS
curl http://raspberrypi.local:5001/health
```

If ping works, mDNS is configured correctly.

---

## Step 4: Backend Configuration

### Pi Server Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Check all hardware status |
| `/scan-nfc` | POST | Scan NFC card (30s timeout) |
| `/enroll-fingerprint` | POST | Start fingerprint enrollment |
| `/enroll-fingerprint/status` | GET | Poll enrollment progress |
| `/verify-fingerprint` | POST | Verify fingerprint |
| `/send-sms` | POST | Send SMS via GSM |

### Backend API Endpoints

| Endpoint | Calls Pi | Purpose |
|----------|---------|---------|
| `POST /api/nfc/scan` | `/scan-nfc` | NFC scan |
| `POST /api/nfc/fingerprint` | `/verify-fingerprint` | Fingerprint verify |
| `POST /api/nfc/enroll` | `/enroll-fingerprint` | Fingerprint enrollment |
| `GET /api/nfc/patient/:nfcId` | - | Lookup patient by NFC |

---

## Step 5: Testing

### Run Test Script

```bash
cd smart-id/scripts
bash test-hardware-connection.sh
```

### Manual Testing (using mDNS hostname)

**Health Check:**
```bash
curl http://raspberrypi.local:5001/health
```

**NFC Scan:**
```bash
curl -X POST http://raspberrypi.local:5001/scan-nfc \
  -H "Content-Type: application/json" \
  -d '{"timeout": 10}'
```

**SMS Test:**
```bash
curl -X POST http://raspberrypi.local:5001/send-sms \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "message": "Test"}'
```

---

## Step 6: Hardware Connections

### NFC Module (MFRC522)

| Pin | GPIO |
|-----|------|
| SDA | GPIO 8 (CE0) |
| SCK | GPIO 11 (SCLK) |
| MOSI | GPIO 10 (MOSI) |
| MISO | GPIO 9 (MISO) |
| RST | GPIO 25 |
| 3.3V | 3.3V |
| GND | GND |

### Fingerprint Sensor (R307)

| Pin | Connection |
|-----|-----------|
| TX | GPIO 14 (UART TX) |
| RX | GPIO 15 (UART RX) |
| 3.3V | 3.3V |
| GND | GND |

### GSM Module (SIM800L)

| Pin | Connection |
|-----|-----------|
| TX | USB-to-Serial TX |
| RX | USB-to-Serial RX |
| VCC | 4.2V (external supply) |
| GND | GND |

---

## Step 6: Verify Integration

### Hospital Dashboard

1. Login as Hospital user
2. Navigate to `/hospital`
3. Check "Service Health Panel" for:
   - API: online
   - Database: healthy
   - NFC Gateway: available/unavailable
   - Fingerprint: available/unavailable
   - GSM Module: available/unavailable

### Doctor Dashboard

1. Login as Doctor user
2. Navigate to `/doctor`
3. Check "Hardware Status" for:
   - NFC Reader
   - Fingerprint scanner
   - GSM Module
   - Raspberry Pi

---

## Troubleshooting

### Issue: "ECONNREFUSED" errors

**Cause:** Cannot connect to Pi server

**Solutions:**
1. Verify Pi IP address: `hostname -I` on Pi
2. Verify Pi server is running: `ps aux | grep python`
3. Check firewall: `sudo ufw allow 5001`
4. Test connectivity: `ping 192.168.225.169`

### Issue: NFC shows "unavailable"

**Causes:**
1. NFC module not properly connected
2. SPI not enabled on Pi

**Solutions:**
1. Enable SPI: `sudo raspi-config` → Interface Options → SPI → Yes
2. Check wiring connections
3. Restart Pi

### Issue: GSM shows "unavailable"

**Causes:**
1. GSM module not connected
2. SIM card not inserted
3. SIM not activated

**Solutions:**
1. Check USB-to-Serial connection
2. Verify SIM card is inserted
3. Check SIM has balance

### Issue: Fingerprint shows "unavailable"

**Causes:**
1. UART not enabled
2. Sensor not connected properly

**Solutions:**
1. Enable UART: `sudo raspi-config` → Interface Options → Serial → Yes
2. Check TX/RX connections (cross over)
3. Verify 3.3V supply

---

## Expected Output

### Health Check Response

```json
{
  "status": "online",
  "services": {
    "fingerprint": {"available": true, "sensor_info": {...}},
    "nfc": {"available": true},
    "gsm": {"available": true}
  },
  "stateManager": {...},
  "lastCheck": "2024-01-01T12:00:00Z"
}
```

### Hospital Dashboard Health Response

```json
{
  "database": "healthy",
  "api": "online",
  "lastCheck": "2024-01-01T12:00:00Z",
  "services": {
    "auth": "online",
    "nfc": "available",
    "fingerprint": "available",
    "gsm": "available",
    "raspberryPi": "available",
    "storage": "healthy"
  },
  "bridgeConfigured": true
}
```

---

## Security Notes

1. **Network Security:** Both devices should be on a trusted private network
2. **Bearer Token:** Currently optional - can add authentication if needed
3. **Firewall:** Only allow port 5001 from trusted IPs

---

## Next Steps

1. Test each hardware component individually
2. Verify SMS sending works
3. Test full patient registration flow
4. Test doctor patient lookup flow
5. Test medical shop prescription access
