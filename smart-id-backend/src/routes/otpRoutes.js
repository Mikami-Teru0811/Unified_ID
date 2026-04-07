import express from "express";
import { sendOtp, verifyOtp } from "../controllers/otp.controller.js";
import { otpLimiter, otpVerifyLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/send-otp", otpLimiter, sendOtp);
router.post("/verify-otp", otpVerifyLimiter, verifyOtp);

export default router;
