const express = require("express");
const router = express.Router();
const { carEntry, carExit, getActiveCars, deleteCarEntry } = require("../controllers/cars.controller");
const { entryRules, exitRules } = require("../validators/cars.validator");
const { authenticate, requireAdmin } = require("../middleware/auth.middleware");

router.post("/entry", authenticate, entryRules, carEntry);
router.put("/exit/:plateNumber", authenticate, exitRules, carExit);
router.get("/active", authenticate, getActiveCars);
router.delete("/:id", authenticate, requireAdmin, deleteCarEntry);

module.exports = router;
