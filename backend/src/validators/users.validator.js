const { body } = require("express-validator");

const createUserRules = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").isIn(["ADMIN", "ATTENDANT"]).withMessage("Role must be ADMIN or ATTENDANT"),
];

module.exports = { createUserRules };
