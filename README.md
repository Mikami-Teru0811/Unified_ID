# Smart-ID Healthcare Platform

> A secure, blockchain-inspired healthcare identity management system with NFC cards, biometric authentication, and OTP-based consent management.

## 🎯 Overview

Smart-ID is a comprehensive healthcare platform that provides:
- **Secure Patient Identity** using NFC cards
- **Multi-Factor Authentication** (OTP + Fingerprint)
- **Consent-Based Access** for medical records
- **Nominee Emergency Access** when patients are unconscious
- **Role-Based Access Control** (Admin, Hospital, Doctor, Medical Shop, Patient)

## ✨ Features

### Core Features
- **NFC Card Integration** - Patient identification via NFC cards
- **Biometric Authentication** - Fingerprint verification
- **OTP Consent System** - SMS-based authorization for record access
- **Nominee OTP** - Emergency consent from registered nominee
- **Emergency Override** - Hospital admin emergency access with password
- **Audit Logging** - Complete audit trail for all actions

### Security Features
- **Rate Limiting** - Protection against brute force attacks
- **Timing-Safe Comparison** - Prevention of timing attacks
- **Helmet Security Headers** - XSS, clickjacking protection
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with cost factor 12
- **Consent Ownership** - Patients control who accesses their data

### User Roles
| Role | Permissions |
|------|-------------|
| Admin | User management, system monitoring |
| Hospital | Patient registration, clinical notes |
| Doctor | View patient records with consent |
| Medical Shop | View prescriptions |
| Patient | View own records, manage consent |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SMART-ID SYSTEM ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌──────────────────┐     ┌─────────────────────┐     │
│  │  Frontend   │     │     Backend      │     │    Pi-Server        │     │
│  │  (React)    │────▶│     (Render)     │────▶│   (Raspberry Pi)   │     │
│  │   Vite     │     │   Express.js     │     │   Python Flask     │     │
│  └─────────────┘     └────────┬─────────┘     └──────────┬──────────┘     │
│                               │                          │                 │
│                               ▼                          │                 │
│                        ┌────────────────┐                │                 │
│                        │   MongoDB     │                │                 │
│                        │    Atlas      │                │                 │
│                        └────────────────┘                │                 │
│                                                           │                 │
│         ════════════════════════════════════════════════════════════════  │
│                              HARDWARE BRIDGE                                │
│         ═══════════════════════════════════════════════════════════════   │
│                                                           │                 │
│    ┌──────────┐         ┌───────────┐         ┌─────────▼───────┐         │
│    │  RC522   │         │   R307    │         │    SIM800L     │         │
│    │  (NFC)  │         │Fingerprint│         │     (GSM)      │         │
│    └──────────┘         └───────────┘         └───────┬───────┘         │
│                                                       │                  │
│                                    ┌──────────────────┼──────────────┐   │
│                                    │   LM2596         │ 9V Battery   │   │
│                                    │   (Power Reg)    │              │   │
│                                    └──────────────────┴──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔧 Hardware Setup

### Hardware Components

| Component | Model | Purpose | Interface | Power |
|-----------|-------|---------|-----------|-------|
| NFC Reader | RC522 | Read NFC card UIDs | SPI (GPIO) | 3.3V |
| Fingerprint Scanner | R307 | Biometric enrollment & verification | UART (GPIO) | 5V |
| GSM Module | SIM800L | Send SMS OTPs | USB-TTL Serial | 4.0V |
| Power Regulator | LM2596 | Step down 9V to 4V for SIM800L | Hardware | 9V → 4V |
| Single Board Computer | Raspberry Pi 4 | Run pi-server | - | 5V |

### Wiring Connections

#### RC522 NFC Reader to Raspberry Pi

| RC522 Pin | Wire Color | Raspberry Pi Pin | GPIO | Notes |
|-----------|------------|-------------------|------|-------|
| SDA | Orange | Pin 24 | GPIO8 (CE0) | Chip Select |
| SCK | Yellow | Pin 23 | GPIO11 (SCKL) | Clock |
| MOSI | Blue | Pin 19 | GPIO10 (MOSI) | Data In |
| MISO | Green | Pin 21 | GPIO9 (MISO) | Data Out |
| RST | White | Pin 22 | GPIO25 | Reset |
| GND | Black | Pin 6 | GND | Ground |
| 3.3V | Red | Pin 1 | 3.3V | Power |

#### R307 Fingerprint Sensor to Raspberry Pi

| R307 Pin | Wire Color | Raspberry Pi Pin | GPIO | Notes |
|----------|------------|-------------------|------|-------|
| VCC (5V) | Red | Pin 2 | - | 5V Power |
| GND | Black | Pin 6 or 14 | - | Ground |
| TX | White | Pin 10 | GPIO15 (RXD) | Data to Pi |
| RX | Green | Pin 8 | GPIO14 (TXD) | Data from Pi |

> **Important:** R307 TX connects to Pi RX (GPIO15), R307 RX connects to Pi TX (GPIO14)

#### SIM800L GSM Module (via USB-TTL)

| Connection | From | To | Notes |
|------------|------|-----|-------|
| Power | LM2596 OUT+ | SIM800L VCC | Set LM2596 to 4.0V |
| Ground | LM2596 OUT- | SIM800L GND | Common ground |
| RX | SIM800L RX | USB-TTL TX | Use 1k resistor in series |
| TX | SIM800L TX | USB-TTL RX | Direct connection |
| Capacitor | SIM800L VCC | GND | 1000µF 16V (optional, for stability) |

#### USB-TTL to Raspberry Pi

| USB-TTL Pin | Raspberry Pi | Notes |
|-------------|--------------|-------|
| VCC | Do NOT connect | Powered by external power |
| GND | Pin 6 (GND) | Common ground required |
| RX | Auto-detected | Assigns to /dev/ttyUSB0 |
| TX | Auto-detected | Assigns to /dev/ttyUSB0 |

### Power Setup

```
┌─────────────┐
│ 9V Battery │────┐
└─────────────┘    │
                    ▼
           ┌─────────────────┐
           │  LM2596         │
           │  Step-Down      │
           │  Module         │
           │                 │
           │ IN: 9V          │
           │ OUT: 4.0V       │────┐
           └─────────────────┘    │
                                   ▼
                          ┌─────────────────┐
                          │    SIM800L     │
                          │     (GSM)      │
                          └─────────────────┘
```

**Power Requirements:**
- **SIM800L:** 3.4V - 4.5V (use 4.0V)
- **R307:** 5V, ~100mA
- **RC522:** 3.3V, ~30mA

### Pi-Server Setup

#### Installation

```bash
# Update and install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip python3-venv git

# Clone the repository
cd ~
git clone <your-repo>
cd smart-id/pi-server

# Create virtual environment
python3 -m venv smarthealth_env
source smarthealth_env/bin/activate

# Install Python dependencies
pip install flask flask-cors pyfingerprint pyserial requests

# Copy environment file
cp .env.example .env
```

#### Enable UART on Raspberry Pi

```bash
# Run raspi-config
sudo raspi-config

# Navigate to:
# Interface Options → Serial Port
# - "Would you like a login shell to be accessible over serial?" → NO
# - "Would you like the serial port hardware to be enabled?" → YES

# Reboot
sudo reboot
```

#### Ngrok Setup for Remote Access

```bash
# Download and install ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.zip -o ngrok.zip
unzip ngrok.zip
sudo mv ngrok /usr/local/bin/
rm ngrok.zip

# Authenticate (if needed)
ngrok authtoken <your-token>

# Start tunnel
ngrok http 5001
```

The ngrok URL (e.g., `https://abc123.ngrok-free.dev`) must be set as `HARDWARE_BRIDGE_URL` in backend environment.

#### Running Pi-Server

```bash
# Activate virtual environment
source smarthealth_env/bin/activate

# Run server
python3 server.py

# Server runs on http://0.0.0.0:5001
```

### Environment Variables

#### Backend Environment Variables

```env
# Server
PORT=5000

# Database
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<db-name>?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-32-char-minimum-secret-key-change-this

# CORS
ALLOWED_ORIGINS=https://your-frontend.vercel.app

# Hardware Bridge (Pi-Server via ngrok)
HARDWARE_BRIDGE_URL=https://your-ngrok-url.ngrok-free.dev
HARDWARE_BRIDGE_KEY=a3f8c2b1e9d4f7a6c8b2e5d9f1a3c7b4

# Emergency Access
EMERGENCY_PASSWORD=your-emergency-password
```

#### Frontend Environment Variables

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_HARDWARE_BRIDGE_KEY=a3f8c2b1e9d4f7a6c8b2e5d9f1a3c7b4
```

#### Pi-Server Environment Variables

```env
# Hardware Ports
FP_PORT=/dev/ttyAMA0
FP_BAUD=57600
GSM_PORT=/dev/ttyUSB0
GSM_BAUD=9600

# Authentication (must match backend)
HARDWARE_BRIDGE_KEY=a3f8c2b1e9d4f7a6c8b2e5d9f1a3c7b4

# CORS Origins
CORS_ORIGINS=https://your-backend.onrender.com,https://your-frontend.vercel.app
```

### Troubleshooting

| Issue | Symptom | Solution |
|-------|---------|----------|
| NFC not detected | `/health` shows NFC unavailable | Enable SPI in `raspi-config` |
| Fingerprint not initialized | "Sensor not initialized" error | Enable UART, check TX/RX wiring |
| GSM not responding | SMS fails, port error | Verify USB-TTL connection, check baud rate |
| Ngrok 502 error | "Connection refused" | Ensure pi-server running, verify URL |
| Permission denied | "Access denied" on serial | Run: `sudo usermod -a -G dialout $USER` |
| Port in use | "Port already bound" | Check if another process using port 5001 |
| No finger detected | Timeout during enrollment | Ensure finger placed correctly on sensor |
| SMS not sending | "Network error" | Check SIM card has sufficient balance |

### Hardware Health Check

Test individual hardware components:

```bash
# Check all hardware status
curl http://localhost:5001/health

# Expected response:
{
  "status": "online",
  "services": {
    "fingerprint": {"available": true, "status": "ready"},
    "nfc": {"available": true, "status": "ready"},
    "gsm": {"available": true, "status": "ready"}
  }
}
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd smart-id-backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your values

npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
# Edit .env with VITE_API_URL

npm run dev
```

## 📱 User Flows

### 1. Patient Registration
```
Hospital Admin → Scan NFC Card → Enter Patient Details → Verify Fingerprint → Patient Created
```

### 2. Clinical Note (Patient Consented)
```
Hospital Admin → Scan NFC Card → Send OTP to Patient → Patient Shares OTP → Fingerprint Verify → Add Clinical Note
```

### 3. Clinical Note (Patient Unconscious - Nominee)
```
Hospital Admin → Scan NFC Card → Switch to Nominee OTP → Send OTP to Nominee → Nominee Shares OTP → Fingerprint Verify → Add Clinical Note
```

### 4. Emergency Access
```
Hospital Admin → Scan NFC Card → Emergency Override → Enter Emergency Password → Add Clinical Note
```

## 🔐 Security

### Authentication Flow
1. **Primary**: Username/Password login
2. **Secondary**: OTP verification (for sensitive actions)
3. **Tertiary**: Fingerprint verification

### Rate Limits
| Endpoint | Limit | Window |
|----------|-------|-------|
| Login | 10 attempts | 15 min |
| OTP Send | 5 attempts | 10 min |
| OTP Verify | 3 attempts | Per OTP |

### API Security
- Helmet.js security headers
- CORS with configurable origins
- Request body size limits (10kb)
- Timing-safe OTP comparison
- JWT with 1-hour expiry for OTP auth

## 📊 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| POST | /api/auth/register | User registration |

### OTP
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/otp/send-otp | Send OTP |
| POST | /api/otp/verify-otp | Verify OTP |

### Patient
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/patient/register | Register patient |
| GET | /api/patient/profile | Get profile |
| GET | /api/patient/:uid | Get by NFC UID |

### NFC
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/nfc/scan | Scan NFC card |
| POST | /api/nfc/fingerprint | Verify fingerprint |

### Consent
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/consent/request | Request consent |
| GET | /api/consent/my | Get my consents |
| POST | /api/consent/respond | Respond to consent |

## 🧪 Testing

### Manual Testing Checklist
- [ ] Patient registration flow
- [ ] Hospital login
- [ ] OTP sending and verification
- [ ] Nominee OTP (if configured)
- [ ] Fingerprint verification
- [ ] Emergency override
- [ ] Dark mode toggle
- [ ] Session timeout

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

**Backend (Render)**
```
Root Directory: smart-id-backend
Build Command: npm install
Start Command: node server.js
```

**Frontend (Vercel/Railway)**
```
Root Directory: frontend
Build Command: npm install && npm run build
Output Directory: dist
```

## 🛠️ Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS 4
- React Router 7
- Axios
- React Hot Toast

### Backend
- Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcrypt
- Helmet
- express-rate-limit

### Hardware Integration
- Raspberry Pi (GSM Module)
- NFC Card Reader
- Fingerprint Scanner

## 📝 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📧 Support

For issues and feature requests, please open a GitHub issue.

---

**Built with ❤️ for secure healthcare identity management**
