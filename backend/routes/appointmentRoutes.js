const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { requireAdmin, requireSelfOrAdmin } = require("../middlewares/roleMiddleware");
const {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  getAppointmentsByUserId,
  updateAppointment,
  deleteAppointment,
  // Time slot functions
  createTimeSlot,
  getAvailableSlots,
  deleteTimeSlot,
  getSlotsByDate
} = require("../controllers/appointmentController");

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create appointment (authenticated user books for themselves)
router.post("/", createAppointment);

// Get all appointments (admin only)
router.get("/", requireAdmin, getAllAppointments);

// Get appointments by user ID (owner or admin) — declared before /:id
router.get("/user/:userId", requireSelfOrAdmin, getAppointmentsByUserId);

// Get appointment by ID
router.get("/:id", getAppointmentById);

// Update appointment
router.put("/:id", updateAppointment);

// Delete appointment
router.delete("/:id", deleteAppointment);

// Time slot management routes
// Get all available time slots
router.get("/slots/available", getAvailableSlots);

// Create new time slot (admin only)
router.post("/slots", requireAdmin, createTimeSlot);

// Delete time slot (admin only)
router.delete("/slots/:id", requireAdmin, deleteTimeSlot);

// Get time slots by date
router.get("/slots/date/:date", getSlotsByDate);

module.exports = router;
