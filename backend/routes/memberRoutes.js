// Example routes file for members
const express = require("express");
const router = express.Router();
const memberController = require("../controllers/memberController");
const { authenticateToken } = require("../middleware/service/authMiddleware");
const {
  validateUpdateProfile,
  validateSignIn,
  validateSignUp,
} = require("../middleware/validation/userValidator");

// Public routes
router.post("/register", validateSignUp, memberController.register);
router.post("/login", validateSignIn, memberController.login);
router.post("/logout", memberController.logout);

// Protected routes
router.get("/profile", authenticateToken, memberController.getUserProfile);
router.get("/", authenticateToken, memberController.getAllMembers);
router.get("/:id", authenticateToken, memberController.getMember);
router.put(
  "/:id",
  authenticateToken,
  validateUpdateProfile,
  memberController.updateMember
);
router.delete("/:id", authenticateToken, memberController.deleteMember);

module.exports = router;
