const { body } = require("express-validator");

const parkingRules = [
  body("code").trim().notEmpty().withMessage("Parking code is required"),
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("totalSpaces").isInt({ min: 1 }).withMessage("Total spaces must be a positive integer"),
  body("feePerHour").isFloat({ min: 0 }).withMessage("Fee per hour must be a non-negative number"),
];

module.exports = { parkingRules };
