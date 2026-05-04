const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const { sendOtpEmail } = require("../utils/mailer");

const prisma = new PrismaClient();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function signup(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { firstName, lastName, email, password } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.isVerified) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (existing && !existing.isVerified) {
      await prisma.user.update({
        where: { email },
        data: { firstName, lastName, password: hashed, otp, otpExpiresAt },
      });
    } else {
      await prisma.user.create({
        data: { firstName, lastName, email, password: hashed, otp, otpExpiresAt },
      });
    }

    await sendOtpEmail(email, firstName, otp);

    res.status(201).json({
      message: "Account created. Check your email for the verification code.",
      email,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function verifyOtp(req, res) {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Email already verified" });
    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({ message: "No verification code found. Request a new one." });
    }
    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: "Verification code has expired. Request a new one." });
    }
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Incorrect verification code" });
    }

    const verified = await prisma.user.update({
      where: { email },
      data: { isVerified: true, otp: null, otpExpiresAt: null },
    });

    const token = jwt.sign(
      { id: verified.id, email: verified.email, role: verified.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Email verified successfully.",
      token,
      user: { id: verified.id, firstName: verified.firstName, lastName: verified.lastName, email: verified.email, role: verified.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function resendOtp(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Email is already verified" });

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({ where: { email }, data: { otp, otpExpiresAt } });
    await sendOtpEmail(email, user.firstName, otp);

    res.json({ message: "A new verification code has been sent to your email." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { signup, verifyOtp, resendOtp, login };
