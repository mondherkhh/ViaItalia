const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { requireAdmin } = require("../middlewares/roleMiddleware");
const controller = require("../controllers/adminDocumentController");

router.get("/:id/download", authMiddleware, requireAdmin, controller.downloadAdminDocument);

module.exports = router;
