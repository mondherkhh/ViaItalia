const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { requireStaff } = require("../middlewares/roleMiddleware");
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
router.post("/", requireStaff, createAnnouncement);

// Get all announcements (Admin only - includes inactive)
router.get("/admin", requireStaff, getAllAnnouncements);

// Get active announcements (any authenticated user)
router.get("/active", getActiveAnnouncements);

// Get announcement by ID (any authenticated user)
router.get("/:id", getAnnouncementById);

// Update announcement (Admin only)
router.put("/:id", requireStaff, updateAnnouncement);

// Delete announcement (Admin only)
router.delete("/:id", requireStaff, deleteAnnouncement);

// Toggle announcement active status (Admin only)
router.patch("/:id/toggle", requireStaff, toggleAnnouncementStatus);

module.exports = router;
