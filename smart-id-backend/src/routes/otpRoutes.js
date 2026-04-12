import express from "express";
import { sendOtp, verifyOtp } from "../controllers/otp.controller.js";
import { otpVerifyLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", otpVerifyLimiter, verifyOtp);

export default router;
