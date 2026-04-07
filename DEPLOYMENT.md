# Smart-ID Deployment Guide

## Backend on Render

### Configuration
- **Root Directory**: `smart-id-backend`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Node Version**: 18+

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (default: 10000 on Render) |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `ALLOWED_ORIGINS` | No | Comma-separated allowed CORS origins |
| `SMS_GATEWAY_URL` | No | GSM module API endpoint |
| `HARDWARE_BRIDGE_URL` | No | Raspberry Pi bridge URL |
| `HARDWARE_BRIDGE_KEY` | No | Bridge authentication key |

### Example .env
```env
PORT=10000
MONGO_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster.mongodb.net/smartid
JWT_SECRET=your-super-secure-random-secret-key-min-32-chars
ALLOWED_ORIGINS=https://your-frontend.vercel.app
SMS_GATEWAY_URL=http://192.168.1.100:8080/send
HARDWARE_BRIDGE_URL=http://192.168.1.100:8080
HARDWARE_BRIDGE_KEY=your-bridge-key
```

## Frontend Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables:
   - `VITE_API_URL` = Your Render backend URL
3. Set build settings:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Railway

1. Create new project from GitHub
2. Configure environment variables:
   - `VITE_API_URL` = Your Render backend URL
3. Set build settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview -- --host 0.0.0.0 --port $PORT`

### Netlify

1. Add new site from GitHub
2. Configure build settings:
   - **Base Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
3. Add environment variable:
   - `VITE_API_URL` = Your Render backend URL

## Hardware Integration

### Hardware Requirements

To enable NFC and fingerprint features, the following hardware is required:

#### Required Components
| Component | Model | Purpose |
|-----------|-------|---------|
| Single Board Computer | Raspberry Pi 4 (4GB+) | Main hardware bridge |
| NFC Reader | RC522 or PN532 | Read NFC card UIDs |
| Fingerprint Scanner | R307 or R408 | Biometric enrollment & verification |
| GSM Module (Optional) | SIM800L | Send SMS OTPs |

#### Pin Configuration (Raspberry Pi GPIO)

**NFC Reader (RC522)**
- SDA → GPIO 8 (CE0)
- SCK → GPIO 11 (SCKL)
- MOSI → GPIO 10 (MOSI)
- MISO → GPIO 9 (MISO)
- IRQ → Not connected
- GND → GND
- RST → GPIO 25
- 3.3V → 3.3V

**Fingerprint Scanner (R307/R408)**
- Red (VCC) → 3.3V or 5V
- Black (GND) → GND
- White (TX) → GPIO 14 (UART TX)
- Green (RX) → GPIO 15 (UART RX)

### Software Setup (Pi Server)

1. Clone the pi-server directory:
```bash
cd ~
git clone <smart-id-repo>
cd smart-id/pi-server
npm install
```

2. Configure the bridge:
```bash
cp .env.example .env
# Edit .env with your settings
nano .env
```

3. Run the bridge service:
```bash
npm start
```

### Bridge Configuration

The backend can communicate with the Raspberry Pi bridge:

```
┌──────────────┐      HTTPS       ┌──────────────┐
│   Backend    │◀───────────────▶│  Raspberry   │
│   (Render)   │                 │     Pi       │
└──────────────┘                 └──────────────┘
                                         │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                 ┌──▼──┐            ┌─────▼─────┐        ┌──────▼────┐
                 │ GSM │            │ NFC Card  │        │Fingerprint│
                 │Module│           │  Reader   │        │ Scanner   │
                 └──────┘           └───────────┘        └───────────┘
```

### Bridge Endpoints (Expected)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/send-sms` | POST | Send SMS |
| `/scan-nfc` | POST | Scan NFC card |
| `/verify-fingerprint` | POST | Verify fingerprint |
| `/enroll-fingerprint` | POST | Enroll fingerprint |

### Environment Variables for Hardware

```env
# Hardware Bridge (on Raspberry Pi)
PORT=8080
BRIDGE_KEY=your-secure-bridge-key
ALLOWED_ORIGINS=https://your-backend.onrender.com

# NFC Reader
NFC_ENABLED=true

# Fingerprint Scanner
FINGERPRINT_ENABLED=true
FINGERPRINT_TX=15
FINGERPRINT_RX=14

# GSM Module (Optional)
GSM_ENABLED=false
GSM_TX=17
GSM_RX=18
```

## Database

### MongoDB Atlas Setup

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write permissions
3. Whitelist IP addresses (0.0.0.0/0 for development, specific IPs for production)
4. Get the connection string and set as `MONGO_URI`

### Collections

| Collection | Purpose |
|------------|---------|
| `users` | User accounts (patients, admins, etc.) |
| `patients` | Patient profiles and medical data |
| `otps` | OTP records (temporary) |
| `consents` | Consent requests and approvals |
| `auditlogs` | Audit trail of all actions |
| `loginaudits` | Login attempt tracking |

### Indexes

The application creates indexes automatically for:
- `phone` - For patient lookup
- `nfcUuid` - For NFC card scanning
- `fingerprintId` - For biometric verification
- `govtId` - For government ID lookup
- `fullName` - For name searches

## Working Pipeline

### 1. Hospital Admin Login
```
Frontend → POST /api/auth/login → Backend validates → JWT token returned
```

### 2. Patient Registration
```
Hospital Admin → Fill form → Scan NFC → Verify Fingerprint → 
Backend creates User + Patient → Success screen
```

### 3. Clinical Note (With Patient Consent)
```
Hospital Admin → Scan NFC → Send OTP to Patient → 
Patient shares OTP → Admin enters OTP → 
Admin scans Fingerprint → Clinical Note added
```

### 4. Clinical Note (With Nominee Consent - Emergency)
```
Hospital Admin → Scan NFC → Switch to "Nominee OTP" → 
Send OTP to Nominee → Nominee shares OTP → 
Admin enters OTP → Admin scans Fingerprint → Clinical Note added
```

### 5. Emergency Override
```
Hospital Admin → Scan NFC → Click "Emergency Override" → 
Enter emergency password → Clinical Note added (no OTP/fingerprint)
```

## Security Configuration

### CORS Setup

For production, set `ALLOWED_ORIGINS` to your frontend domains:

```env
ALLOWED_ORIGINS=https://smart-id.vercel.app,https://www.smart-id.vercel.app
```

### Rate Limiting

Rate limiting is enabled by default:
- Login: 10 attempts per 15 minutes
- OTP Send: 5 attempts per 10 minutes
- OTP Verify: 3 attempts per OTP

### JWT Expiry

| Auth Type | JWT Expiry |
|-----------|------------|
| Password Login | 1 day |
| OTP Login | 1 hour |

## Health Checks

### Backend Health
```
GET https://your-backend.onrender.com/
Response: "Unified Smart ID Backend is running"
```

### Hospital Health
```
GET https://your-backend.onrender.com/api/hospital/health
Response: { status: "ok", services: {...} }
```

### System Health
```
GET https://your-backend.onrender.com/api/hospital/system-health
Response: { api: "ok", database: "ok", services: {...} }
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `ALLOWED_ORIGINS` includes your frontend domain
2. **Rate Limited**: Wait for the cooldown period
3. **MongoDB Connection**: Check `MONGO_URI` format and IP whitelist
4. **Hardware Bridge Unreachable**: Check network connectivity to Pi

### Logs

Check Render logs for:
- Server startup errors
- Database connection issues
- Rate limit triggers
- Authentication failures

## Post-Deployment Checklist

- [ ] Backend is responding at `/`
- [ ] Hospital health check passes
- [ ] Login works for hospital admin
- [ ] NFC scan endpoint works (if hardware connected)
- [ ] OTP sending works (if GSM configured)
- [ ] Frontend can communicate with backend
- [ ] Rate limiting is active
- [ ] Dark mode toggle works

## Support

For deployment issues, check:
1. Render deployment logs
2. MongoDB Atlas dashboard
3. Browser console for frontend errors
4. GitHub Actions logs for CI issues
