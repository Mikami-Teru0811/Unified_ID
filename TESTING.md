# Smart-ID Testing Guide

## Overview

This document provides comprehensive testing guidelines for the Smart-ID Healthcare Platform, including manual testing checklists, API testing with Postman, E2E testing, and performance testing.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Manual Testing Checklist](#manual-testing-checklist)
4. [API Testing](#api-testing)
5. [End-to-End Testing](#end-to-end-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [CI/CD Integration](#cicd-integration)

---

## Prerequisites

### Required Tools

- Node.js 18+ (LTS recommended)
- MongoDB Atlas account (or local MongoDB)
- Redis (optional, for caching)
- Postman or Insomnia for API testing
- Playwright for E2E testing

### Accounts Required

- MongoDB Atlas cluster
- Twilio/MSG91 account (for SMS testing)
- Render/Vercel account (for deployment testing)

---

## Environment Setup

### 1. Backend Setup

```bash
cd smart-id-backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# Required: MONGO_URI, JWT_SECRET

# Start development server
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

### 3. Test Database Setup

For testing, use a separate MongoDB database:

```bash
# Add to .env
MONGO_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster.mongodb.net/smartid_test
```

---

## Manual Testing Checklist

### Authentication Flow

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Patient Login | Enter phone → Receive OTP → Enter OTP | Successful login, JWT token received |
| OTP Expiry | Wait 5 minutes after OTP | OTP rejected with "expired" message |
| Invalid OTP | Enter wrong OTP 3 times | Account locked temporarily |
| Logout | Click logout | Token cleared, redirected to login |

### Patient Portal

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| View Profile | Login as patient → Dashboard | Profile data displayed correctly |
| View Medical History | Navigate to medical history | All visits shown with details |
| Export PDF | Click export PDF | PDF downloads with profile data |
| View Audit Log | Navigate to audit log | All actions logged correctly |

### Hospital Portal

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Register Patient | NFC scan → Enter details → Save | Patient created with user account |
| View Dashboard | Navigate to dashboard | Statistics displayed correctly |
| Add Clinical Note | Select patient → Add note | Note saved and visible in patient records |
| Emergency Access | Click emergency → Enter password | Override granted for critical cases |

### Doctor Portal

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| NFC Scan | Tap NFC card | Patient details retrieved |
| Consent Request | Request patient consent | OTP sent to patient |
| View Patient | After consent | Full patient profile accessible |
| Emergency Bypass | Enter emergency password | Access granted without consent |

### Medical Shop Portal

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| NFC Scan | Tap NFC card | Patient and prescriptions loaded |
| View Prescription | Select prescription | PDF displayed |
| Download PDF | Click download | PDF file downloaded |

### Admin Portal

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| View Dashboard | Navigate to admin dashboard | Statistics and logs displayed |
| Manage Users | View user list | All users shown with roles |
| Manage Permissions | Toggle permission | Change saved to database |
| Search Patients | Search by name/phone | Matching patients returned |

---

## API Testing

### Postman Collection

Import the following collection structure into Postman:

```json
{
  "info": {
    "name": "Smart-ID API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{token}}",
        "type": "string"
      }
    ]
  }
}
```

### Key API Endpoints

#### Authentication

```
POST /api/otp/send-otp
Body: { "phone": "9876543210" }
Response: { "success": true, "message": "OTP sent" }
```

```
POST /api/otp/verify-otp
Body: { "phone": "9876543210", "otp": "123456" }
Response: { "success": true, "token": "jwt_token", "user": {...} }
```

#### Patient Endpoints

```
GET /api/patient/profile
Headers: Authorization: Bearer {{token}}
Response: { "fullName": "...", "age": ..., ... }
```

```
GET /api/patient/emr
Headers: Authorization: Bearer {{token}}
Response: { "patient": {...}, "visits": [...] }
```

```
GET /api/patient/records
Headers: Authorization: Bearer {{token}}
Response: { "patient": {...}, "records": [...] }
```

```
GET /api/patient/export/profile/pdf
Headers: Authorization: Bearer {{token}}
Response: PDF binary
```

#### Hospital Endpoints

```
POST /api/patient/register
Headers: Authorization: Bearer {{token}}
Body: { "fullName": "...", "dob": "...", ... }
Response: { "patientId": "...", "username": "...", "temporaryPasswordHint": "..." }
```

```
POST /api/patient/:patientId/notes
Headers: Authorization: Bearer {{token}}
Body: { "content": "...", "mode": "NORMAL" }
Response: { "message": "Clinical note saved", "note": {...} }
```

```
GET /api/hospital/stats
Headers: Authorization: Bearer {{token}}
Response: { "totalPatients": 100, "dailyAdmissions": 10, ... }
```

```
GET /api/hospital/hospitals
Headers: Authorization: Bearer {{token}}
Query: ?scheme=CMCHIS&city=Chennai
Response: [{ "name": "...", "schemes": [...], ... }]
```

#### Admin Endpoints

```
GET /api/admin/statistics
Headers: Authorization: Bearer {{token}}
Response: { "totalUsers": 500, "activeCards": 450, ... }
```

```
GET /api/admin/users
Headers: Authorization: Bearer {{token}}
Response: [{ "id": "...", "name": "...", "role": "...", ... }]
```

```
GET /api/admin/permissions
Headers: Authorization: Bearer {{token}}
Response: { "hospital": {...}, "doctor": {...}, ... }
```

```
POST /api/admin/permissions
Headers: Authorization: Bearer {{token}}
Body: { "role": "hospital", "permissions": {...} }
Response: { "success": true }
```

### Testing with cURL

```bash
# Send OTP
curl -X POST http://localhost:5000/api/otp/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'

# Verify OTP (replace with actual OTP)
curl -X POST http://localhost:5000/api/otp/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "123456"}'

# Get Patient Profile (replace with actual token)
curl http://localhost:5000/api/patient/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## End-to-End Testing

### Playwright Setup

```bash
cd frontend
npm install @playwright/test
npx playwright install chromium
```

### E2E Test Example

```javascript
// tests/e2e/patient.spec.js
import { test, expect } from '@playwright/test';

test.describe('Patient Portal', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.fill('[name="phone"]', '9876543210');
    await page.click('button[type="submit"]');
    // Enter OTP (mock for testing)
  });

  test('should display patient profile', async ({ page }) => {
    await page.goto('/patient/dashboard');
    await expect(page.locator('h1')).toContainText('Medical History');
  });

  test('should export PDF', async ({ page }) => {
    await page.goto('/patient/dashboard');
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Export History PDF');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });
});
```

### Run E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific test
npm run test:e2e -- --grep "patient"
```

---

## Performance Testing

### Load Testing with k6

```javascript
// k6/script.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  const res = http.get('http://localhost:5000/api/patient/profile');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

Run with:
```bash
k6 run k6/script.js
```

---

## Security Testing

### OWASP ZAP Integration

```bash
# Start ZAP in daemon mode
zap.sh -daemon -port 8080

# Run baseline scan
zap-baseline.py -t http://localhost:5173 -r baseline.html
```

### Security Checklist

- [ ] JWT tokens expire after 1 hour
- [ ] OTP expires after 5 minutes
- [ ] Passwords are hashed with bcrypt
- [ ] Rate limiting on OTP endpoints
- [ ] CORS configured for specific origins
- [ ] Helmet.js security headers enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (MongoDB sanitization)
- [ ] XSS prevention (React auto-escaping)

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd smart-id-backend && npm ci
      - run: cd smart-id-backend && npm test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd frontend && npm ci
      - run: cd frontend && npm run lint
      - run: cd frontend && npm run build
```

---

## Troubleshooting

### Common Issues

#### MongoDB Connection Failed
```
Error: Failed to connect to MongoDB
```
**Solution**: Check MONGO_URI in .env file. Ensure IP whitelist includes your current IP.

#### OTP Not Received
```
Error: SMS send failed
```
**Solution**: Check SMS_GATEWAY_URL configuration or use console mode for development.

#### JWT Token Expired
```
Error: Invalid or Expired Token
```
**Solution**: Re-authenticate and get a new token.

#### Port Already in Use
```
Error: EADDRINUSE
```
**Solution**: Kill the process using the port or change PORT in .env.

---

## Test Data

### Sample Patient Data

```json
{
  "fullName": "Test Patient",
  "phone": "9876543210",
  "dob": "1990-01-15",
  "gender": "Male",
  "bloodGroup": "O+",
  "emergencyContact": {
    "name": "Emergency Contact",
    "phone": "9876543211"
  },
  "allergies": ["Peanuts"],
  "surgeries": ["Appendectomy"]
}
```

### Sample Hospital Data

```json
{
  "name": "Test Hospital",
  "phone": "04412345678",
  "type": "government",
  "emergencyServices": true,
  "empanelled": [
    { "scheme": "CMCHIS", "active": true },
    { "scheme": "PMJAY", "active": true }
  ]
}
```

---

## Support

For testing-related questions:
- Create an issue on GitHub
- Contact the development team
- Check the wiki for additional documentation
