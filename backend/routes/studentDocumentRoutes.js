const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { requireAdmin } = require("../middlewares/roleMiddleware");
const documentController = require("../controllers/documentController");
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

function studentOnly(req, res, next) {
  if (req.user && req.user.role === "USER") return next();
  return res.status(403).json({ message: "Accès étudiant requis" });
}

router.get("/documents", authMiddleware, studentOnly, documentController.getStudentDocuments);
router.post("/documents/upload", authMiddleware, studentOnly, upload.single("file"), documentController.uploadStudentDocument);
router.get("/documents/:id/download", authMiddleware, studentOnly, documentController.downloadStudentDocument);
router.delete("/documents/:id", authMiddleware, studentOnly, documentController.deleteStudentDocument);
router.post("/documents/:id/submit", authMiddleware, studentOnly, documentController.submitStudentDocument);

module.exports = router;
