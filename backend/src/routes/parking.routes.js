const express = require("express");
const router = express.Router();
const { createParking, getAllParking, getParkingByCode, updateParking, deleteParking } = require("../controllers/parking.controller");
const { parkingRules, updateParkingRules } = require("../validators/parking.validator");
const { authenticate, requireAdmin } = require("../middleware/auth.middleware");

router.get("/", authenticate, getAllParking);
router.post("/", authenticate, requireAdmin, parkingRules, createParking);
router.get("/:code", authenticate, getParkingByCode);
router.put("/:code", authenticate, requireAdmin, updateParkingRules, updateParking);
router.delete("/:code", authenticate, requireAdmin, deleteParking);

module.exports = router;
