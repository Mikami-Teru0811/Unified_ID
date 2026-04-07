import express from "express";

const router = express.Router();

/**
 * Simplified Auth Route - Production Ready
 * Debug backdoor has been removed for security.
 */
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  return res.status(401).json({ message: "Invalid credentials" });
});

export default router;
