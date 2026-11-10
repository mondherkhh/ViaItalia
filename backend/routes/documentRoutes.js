const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const UPLOAD_DIR = path.join(__dirname, "../uploads/documents");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, crypto.randomUUID() + ext);
  }
});

const ALLOWED = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED.includes(ext)) return cb(new Error("INVALID_TYPE"));
    cb(null, true);
  }
});

const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { requireStaff, requireSelfOrAdmin } = require("../middlewares/roleMiddleware");
const controller = require("../controllers/documentController");

router.get("/dossiers/:id/documents", authMiddleware, controller.getDocuments);
router.post("/dossiers/:id/documents", authMiddleware, requireStaff, upload.single("file"), controller.uploadDocument);
router.patch("/:id", authMiddleware, requireStaff, controller.updateDocument);
router.delete("/:id", authMiddleware, requireStaff, controller.deleteDocument);
router.get("/:id/download", authMiddleware, controller.downloadDocument);
module.exports = router;
