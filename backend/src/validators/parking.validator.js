const { body } = require("express-validator");

const CODE_REGEX = /^[A-Z0-9_-]{2,20}$/i;

const parkingRules = [
  body("code")
    .trim()
    .notEmpty().withMessage("Parking code is required")
    .matches(CODE_REGEX).withMessage("Code must be 2–20 alphanumeric characters (hyphens/underscores allowed)"),
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("totalSpaces").isInt({ min: 1 }).withMessage("Total spaces must be a positive integer"),
  body("feePerHour").isFloat({ min: 1 }).withMessage("Fee per hour must be at least 1 RWF"),
];

const updateParkingRules = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("location").optional().trim().notEmpty().withMessage("Location cannot be empty"),
  body("totalSpaces").optional().isInt({ min: 1 }).withMessage("Total spaces must be a positive integer"),
  body("feePerHour").optional().isFloat({ min: 1 }).withMessage("Fee per hour must be at least 1 RWF"),
];

module.exports = { parkingRules, updateParkingRules };
