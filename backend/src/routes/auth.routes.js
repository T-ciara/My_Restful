const express = require("express");
const router = express.Router();
const { signup, verifyOtp, resendOtp, login } = require("../controllers/auth.controller");
const { signupRules, loginRules } = require("../validators/auth.validator");

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user (sends OTP to email)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName: { type: string }
 *               lastName:  { type: string }
 *               email:     { type: string, format: email }
 *               password:  { type: string, minLength: 6 }
 *     responses:
 *       201: { description: OTP sent to email }
 *       409: { description: Email already registered }
 */
router.post("/signup", signupRules, signup);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify email with OTP code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string }
 *               otp:   { type: string }
 *     responses:
 *       200: { description: Email verified }
 *       400: { description: Invalid or expired OTP }
 */
router.post("/verify-otp", verifyOtp);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend OTP verification code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200: { description: New OTP sent }
 */
router.post("/resend-otp", resendOtp);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful, returns token }
 *       401: { description: Invalid credentials }
 *       403: { description: Email not verified }
 */
router.post("/login", loginRules, login);

module.exports = router;
