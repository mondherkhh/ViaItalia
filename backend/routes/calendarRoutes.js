const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { requireAdmin, requireStaff } = require("../middlewares/roleMiddleware");
const { requireSection } = require("../middlewares/requireRole");
const controller = require("../controllers/calendarController");

const router = express.Router();

router.use(authMiddleware, requireStaff);
router.use(requireSection('calendar'));

router.get("/", controller.listEvents);
router.get("/summary", controller.getSummary);
router.post("/", controller.createEvent);
router.patch("/:id", controller.updateEvent);
router.delete("/:id", controller.deleteEvent);

module.exports = router;
