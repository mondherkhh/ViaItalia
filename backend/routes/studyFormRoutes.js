const express = require("express");
const router = express.Router();
const {
  submitStudyForm,
  getAllStudyForms,
  getStudyFormById,
  deleteStudyForm,
  updateStudyForm,
  searchStudyForms
} = require("../controllers/studyFormController");
const authMiddleware = require("../middlewares/authMiddleware");
const { requireAdmin } = require("../middlewares/roleMiddleware");

// Submit Study in Italy Form (public — landing page form)
router.post("/submit", submitStudyForm);

// Get all Study Forms (admin only)
router.get("/", authMiddleware, requireAdmin, getAllStudyForms);

// Search Study Forms by name (admin only)
router.get("/search", authMiddleware, requireAdmin, searchStudyForms);

// Get Study Form by ID (admin only)
router.get("/:id", authMiddleware, requireAdmin, getStudyFormById);

// Update Study Form (admin only)
router.put("/:id", authMiddleware, requireAdmin, updateStudyForm);

// Delete Study Form (admin only)
router.delete("/:id", authMiddleware, requireAdmin, deleteStudyForm);

module.exports = router;
