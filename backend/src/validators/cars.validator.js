const { body, param } = require("express-validator");

// Rwanda plate format: R + 2 letters + space + 3 digits + space + 1 letter  e.g. RAB 123 D
const PLATE_REGEX = /^R[A-Z]{2}\s?\d{3}\s?[A-Z]$/i;

// Parking code: 2–20 uppercase letters, digits, hyphens, or underscores
const CODE_REGEX = /^[A-Z0-9_-]{2,20}$/i;

const entryRules = [
  body("plateNumber")
    .trim()
    .notEmpty().withMessage("Plate number is required")
    .matches(PLATE_REGEX).withMessage("Invalid plate number. Expected format: RAB 123 D"),
  body("parkingCode")
    .trim()
    .notEmpty().withMessage("Parking code is required")
    .matches(CODE_REGEX).withMessage("Invalid parking code format"),
];

const exitRules = [
  param("plateNumber")
    .trim()
    .notEmpty().withMessage("Plate number is required")
    .matches(PLATE_REGEX).withMessage("Invalid plate number. Expected format: RAB 123 D"),
];

module.exports = { entryRules, exitRules };
