const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { requireStaff } = require("../middlewares/roleMiddleware");
const controller = require("../controllers/studentTaskController");

router.get("/user/:userId", authMiddleware, requireStaff, controller.getTasksByUser);
router.get("/", authMiddleware, requireStaff, controller.getTasksByUser);
router.post("/", authMiddleware, requireStaff, controller.createTask);
router.patch("/:id", authMiddleware, requireStaff, controller.updateTask);
router.delete("/:id", authMiddleware, requireStaff, controller.deleteTask);
router.post("/:id/log-payment", authMiddleware, requireStaff, controller.logPayment);

module.exports = router;
