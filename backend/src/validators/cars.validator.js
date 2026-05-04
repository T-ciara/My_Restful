const { body, param } = require("express-validator");

const entryRules = [
  body("plateNumber").trim().notEmpty().withMessage("Plate number is required"),
  body("parkingCode").trim().notEmpty().withMessage("Parking code is required"),
];

const exitRules = [
  param("plateNumber").trim().notEmpty().withMessage("Plate number is required"),
];

module.exports = { entryRules, exitRules };
