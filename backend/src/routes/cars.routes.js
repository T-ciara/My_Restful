const express = require("express");
const router = express.Router();
const { carEntry, carExit, getActiveCars } = require("../controllers/cars.controller");
const { entryRules, exitRules } = require("../validators/cars.validator");
const { authenticate } = require("../middleware/auth.middleware");

/**
 * @swagger
 * /api/cars/entry:
 *   post:
 *     summary: Register a car entry
 *     tags: [Cars]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plateNumber, parkingCode]
 *             properties:
 *               plateNumber: { type: string }
 *               parkingCode: { type: string }
 *     responses:
 *       201: { description: Car entered, returns ticket }
 *       400: { description: No spaces or car already parked }
 *       404: { description: Parking not found }
 */
router.post("/entry", authenticate, entryRules, carEntry);

/**
 * @swagger
 * /api/cars/exit/{plateNumber}:
 *   put:
 *     summary: Register a car exit and calculate bill
 *     tags: [Cars]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: plateNumber
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Car exited, returns bill }
 *       404: { description: No active entry found }
 */
router.put("/exit/:plateNumber", authenticate, exitRules, carExit);

/**
 * @swagger
 * /api/cars/active:
 *   get:
 *     summary: Get all currently parked cars (no exit yet)
 *     tags: [Cars]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of cars currently in parking with estimated bill }
 */
router.get("/active", authenticate, getActiveCars);

module.exports = router;
