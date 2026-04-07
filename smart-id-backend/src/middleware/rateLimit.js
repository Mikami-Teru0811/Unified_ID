import rateLimit from "express-rate-limit";

export const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: {
        error: "Too many OTP requests. Try again after 10 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false
});

export const otpVerifyLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: {
        error: "Too many OTP verification attempts. Try again after 5 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        error: "Too many authentication attempts. Try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false
});
