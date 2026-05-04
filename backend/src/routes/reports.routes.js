const express = require("express");
const router = express.Router();
const { outgoingCars, enteredCars } = require("../controllers/reports.controller");
const { authenticate, requireAdmin } = require("../middleware/auth.middleware");

/**
 * @swagger
 * /api/reports/outgoing:
 *   get:
 *     summary: Report of cars that exited in a date range (Admin only)
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: List of exited cars with billing info }
 */
router.get("/outgoing", authenticate, requireAdmin, outgoingCars);

/**
 * @swagger
 * /api/reports/entries:
 *   get:
 *     summary: Report of all cars entered on a specific date (Admin only)
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: List of entries between two dates }
 */
router.get("/entries", authenticate, requireAdmin, enteredCars);

module.exports = router;
