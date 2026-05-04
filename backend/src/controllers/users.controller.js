const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getAllUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function createUser(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { firstName, lastName, email, password, role } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { firstName, lastName, email, password: hashed, role: role || "ATTENDANT", isVerified: true },
    });

    res.status(201).json({
      message: "User created successfully",
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function updateUser(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const id = parseInt(req.params.id);
  const { firstName, lastName, email, role, password } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "User not found" });

    const data = {};
    if (firstName) data.firstName = firstName.trim();
    if (lastName)  data.lastName  = lastName.trim();
    if (email && email !== existing.email) {
      const taken = await prisma.user.findUnique({ where: { email } });
      if (taken) return res.status(409).json({ message: "Email already in use" });
      data.email = email;
    }
    if (role)     data.role     = role;
    if (password) data.password = await bcrypt.hash(password, 10);

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
    });

    res.json({ message: "User updated", user: updated });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "User not found" });
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

async function deleteUser(req, res) {
  const id = parseInt(req.params.id);
  if (id === req.user.id) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }
  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "User not found" });
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { getAllUsers, createUser, updateUser, deleteUser };
