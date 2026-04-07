# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please report it by:
1. **DO NOT** create a public GitHub issue
2. Email the maintainer directly
3. Provide details about the vulnerability
4. Allow time for assessment and fix

## Security Features

### Authentication

| Feature | Implementation | Status |
|---------|----------------|--------|
| JWT Tokens | jsonwebtoken | ✅ Implemented |
| Password Hashing | bcrypt (cost factor 12) | ✅ Implemented |
| Session Timeout | 15 minutes inactivity | ✅ Implemented |
| Token Expiry | 1 hour (OTP auth), 1 day (password) | ✅ Implemented |

### Authorization

| Feature | Implementation | Status |
|---------|----------------|--------|
| Role-Based Access | Middleware-based | ✅ Implemented |
| Route Protection | ProtectedRoute component | ✅ Implemented |
| API Authorization | JWT middleware | ✅ Implemented |
| Consent Ownership | Patient verification | ✅ Implemented |

### Input Validation

| Feature | Status |
|---------|--------|
| Phone number validation | ✅ Implemented |
| Password complexity | ✅ Implemented (min 8 chars) |
| Role whitelist | ✅ Implemented |
| Body size limits | ✅ Implemented (10kb) |

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/*` | 10 requests | 15 minutes |
| `/api/otp/send-otp` | 5 requests | 10 minutes |
| `/api/otp/verify-otp` | 3 attempts per OTP | Per OTP |

### Security Headers

| Header | Status |
|--------|--------|
| Content-Security-Policy | ✅ Implemented |
| X-Content-Type-Options | ✅ Implemented |
| X-Frame-Options | ✅ Implemented |
| Strict-Transport-Security | ✅ Implemented |

## Known Security Measures

### Protection Against

- [x] Brute Force Attacks - Rate limiting on auth endpoints
- [x] SQL Injection - Using MongoDB/Mongoose (no SQL)
- [x] XSS Attacks - Helmet CSP, React's built-in escaping
- [x] CSRF Attacks - SameSite cookies consideration
- [x] Timing Attacks - Timing-safe OTP comparison
- [x] Race Conditions - Atomic MongoDB operations
- [x] Memory Exhaustion - Request body size limits

## Security Checklist

### Pre-Production

- [ ] Change default JWT_SECRET to strong random value
- [ ] Configure ALLOWED_ORIGINS for CORS
- [ ] Review rate limit settings
- [ ] Test consent ownership verification
- [ ] Verify error messages don't leak sensitive data
- [ ] Check audit logging is working
- [ ] Test session timeout behavior

### Production

- [ ] Enable HTTPS (automatic on Render/Vercel)
- [ ] Set secure HTTP headers
- [ ] Monitor rate limit triggers
- [ ] Review audit logs regularly
- [ ] Rotate JWT_SECRET periodically
- [ ] Monitor for unusual login patterns
- [ ] Keep dependencies updated

## Environment Security

### Required Secrets

| Variable | Description | Priority |
|----------|-------------|----------|
| `JWT_SECRET` | JWT signing key | 🔴 Critical |
| `MONGO_URI` | Database connection | 🔴 Critical |

### Recommended Security

| Variable | Description | Priority |
|----------|-------------|----------|
| `ALLOWED_ORIGINS` | CORS origins | 🟡 High |
| `HARDWARE_BRIDGE_KEY` | Bridge auth | 🟡 High |

## Incident Response

If a security incident occurs:

1. **Contain** - Disable affected endpoints if needed
2. **Assess** - Determine scope of breach
3. **Fix** - Patch vulnerability
4. **Notify** - Inform affected users
5. **Review** - Update security measures

## Security Best Practices

### For Developers

1. Never commit secrets to Git
2. Use environment variables for sensitive data
3. Validate all user input
4. Use parameterized queries (Mongoose does this)
5. Follow principle of least privilege
6. Enable 2FA on all accounts

### For Administrators

1. Rotate secrets periodically
2. Monitor audit logs
3. Review user permissions
4. Enable logging and monitoring
5. Keep system updated

## Compliance

This application implements:
- Patient consent management
- Audit trail of all actions
- Secure authentication
- Data access controls

**Note**: This is not legal advice. Consult with healthcare compliance experts for HIPAA or other regulatory requirements.

## Version

Last updated: 2026-03-25

For questions about security, please contact the maintainer.
