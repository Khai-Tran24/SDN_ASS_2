// Example routes file for brands
const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const {
  authenticateToken,
  isAdmin,
} = require("../middleware/service/authMiddleware");
const { validateBrand } = require("../middleware/validation/brandValidator");

// Public routes
router.get("/", brandController.getAllBrands);
router.get("/:id", brandController.getBrand);

// Protected routes (require authentication)
router.post(
  "/",
  authenticateToken,
  isAdmin,
  validateBrand,
  brandController.createBrand
);
router.put(
  "/:id",
  authenticateToken,
  isAdmin,
  validateBrand,
  brandController.updateBrand
);
router.delete("/:id", authenticateToken, isAdmin, brandController.deleteBrand);

module.exports = router;
