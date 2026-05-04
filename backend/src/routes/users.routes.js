const express = require("express");
const router = express.Router();
const { getAllUsers, createUser, deleteUser } = require("../controllers/users.controller");
const { createUserRules } = require("../validators/users.validator");
const { authenticate, requireAdmin } = require("../middleware/auth.middleware");

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of all users }
 */
router.get("/", authenticate, requireAdmin, getAllUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a user with any role (Admin only)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password, role]
 *             properties:
 *               firstName: { type: string }
 *               lastName:  { type: string }
 *               email:     { type: string }
 *               password:  { type: string }
 *               role:      { type: string, enum: [ADMIN, ATTENDANT] }
 *     responses:
 *       201: { description: User created }
 *       409: { description: Email already exists }
 */
router.post("/", authenticate, requireAdmin, createUserRules, createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: User deleted }
 *       400: { description: Cannot delete own account }
 *       404: { description: User not found }
 */
router.delete("/:id", authenticate, requireAdmin, deleteUser);

module.exports = router;
