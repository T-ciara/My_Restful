const express = require("express");
const router = express.Router();
const { getAllUsers, createUser, updateUser, deleteUser } = require("../controllers/users.controller");
const { createUserRules, updateUserRules } = require("../validators/users.validator");
const { authenticate, requireAdmin } = require("../middleware/auth.middleware");

router.get("/", authenticate, requireAdmin, getAllUsers);
router.post("/", authenticate, requireAdmin, createUserRules, createUser);
router.patch("/:id", authenticate, requireAdmin, updateUserRules, updateUser);
router.delete("/:id", authenticate, requireAdmin, deleteUser);

module.exports = router;
