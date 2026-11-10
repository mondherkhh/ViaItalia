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
const { requireStaff } = require("../middlewares/roleMiddleware");

// Submit Study in Italy Form (public — landing page form)
router.post("/submit", submitStudyForm);

// Get all Study Forms (admin only)
router.get("/", authMiddleware, requireStaff, getAllStudyForms);

// Search Study Forms by name (admin only)
router.get("/search", authMiddleware, requireStaff, searchStudyForms);

// Get Study Form by ID (admin only)
router.get("/:id", authMiddleware, requireStaff, getStudyFormById);

// Update Study Form (admin only)
router.put("/:id", authMiddleware, requireStaff, updateStudyForm);

// Delete Study Form (admin only)
router.delete("/:id", authMiddleware, requireStaff, deleteStudyForm);

module.exports = router;
