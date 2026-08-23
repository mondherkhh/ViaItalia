const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { requireAdmin, requireSelfOrAdmin } = require("../middlewares/roleMiddleware");
const {
  createUniversityInfo,
  getAllUniversityInfo,
  getUniversityInfoById,
  getUniversityInfoByUserId,
  updateUniversityInfo,
  deleteUniversityInfo
} = require("../controllers/universityInfoController");

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create university info
router.post("/", createUniversityInfo);

// Get all university info (admin only)
router.get("/", requireAdmin, getAllUniversityInfo);

// Get university info by ID
router.get("/:id", getUniversityInfoById);

// Get university info by user ID (owner or admin)
router.get("/user/:userId", requireSelfOrAdmin, getUniversityInfoByUserId);

// Update university info
router.put("/:id", updateUniversityInfo);

// Delete university info
router.delete("/:id", deleteUniversityInfo);

module.exports = router;
