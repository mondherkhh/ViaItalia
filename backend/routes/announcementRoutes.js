const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { requireAdmin } = require("../middlewares/roleMiddleware");
const {
  createAnnouncement,
  getAllAnnouncements,
  getActiveAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus
} = require("../controllers/announcementController");

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create announcement (Admin only)
router.post("/", requireAdmin, createAnnouncement);

// Get all announcements (Admin only - includes inactive)
router.get("/admin", requireAdmin, getAllAnnouncements);

// Get active announcements (any authenticated user)
router.get("/active", getActiveAnnouncements);

// Get announcement by ID (any authenticated user)
router.get("/:id", getAnnouncementById);

// Update announcement (Admin only)
router.put("/:id", requireAdmin, updateAnnouncement);

// Delete announcement (Admin only)
router.delete("/:id", requireAdmin, deleteAnnouncement);

// Toggle announcement active status (Admin only)
router.patch("/:id/toggle", requireAdmin, toggleAnnouncementStatus);

module.exports = router;
