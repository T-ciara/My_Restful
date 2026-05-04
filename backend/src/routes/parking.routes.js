const express = require("express");
const router = express.Router();
const { createParking, getAllParking, getParkingByCode } = require("../controllers/parking.controller");
const { parkingRules } = require("../validators/parking.validator");
const { authenticate, requireAdmin } = require("../middleware/auth.middleware");

/**
 * @swagger
 * /api/parking:
 *   post:
 *     summary: Create a new parking (Admin only)
 *     tags: [Parking]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, name, location, totalSpaces, feePerHour]
 *             properties:
 *               code:        { type: string }
 *               name:        { type: string }
 *               location:    { type: string }
 *               totalSpaces: { type: integer }
 *               feePerHour:  { type: number }
 *     responses:
 *       201: { description: Parking created }
 *       403: { description: Admin access required }
 *       409: { description: Code already exists }
 */
router.post("/", authenticate, requireAdmin, parkingRules, createParking);

/**
 * @swagger
 * /api/parking:
 *   get:
 *     summary: Get all parking locations
 *     tags: [Parking]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of parking locations }
 */
router.get("/", authenticate, getAllParking);

/**
 * @swagger
 * /api/parking/{code}:
 *   get:
 *     summary: Get a specific parking by code
 *     tags: [Parking]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Parking details }
 *       404: { description: Not found }
 */
router.get("/:code", authenticate, getParkingByCode);

module.exports = router;
