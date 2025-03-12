const express = require("express");
const perfumeAPI = require("../controllers/perfumeController");
const {
  authenticateToken,
  isAdmin,
} = require("../middleware/service/authMiddleware");
const {
  validatePerfume,
  validateCommentPerfume,
} = require("../middleware/validation/perfumeValidator");

const router = express.Router();

// Main perfume routes
router
  .route("/")
  .get(perfumeAPI.getAllPerfumes)
  .post(authenticateToken, isAdmin, validatePerfume, perfumeAPI.createPerfume);

// Search and filter routes
router.get("/search", perfumeAPI.searchPerfume);
router.get("/filter", perfumeAPI.filterPerfumeByBrand);

// Single perfume routes
router
  .route("/:id")
  .get(perfumeAPI.getPerfumeDetail)
  .put(authenticateToken, isAdmin, validatePerfume, perfumeAPI.updatePerfume)
  .delete(authenticateToken, isAdmin, perfumeAPI.deletePerfume);

// Comment routes
router
  .route("/:id/comments")
  .get(perfumeAPI.getComments)
  .post(authenticateToken, validateCommentPerfume, perfumeAPI.addComment);

module.exports = router;
