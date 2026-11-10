const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");

const UPLOAD_DIR = path.join(__dirname, "../uploads/documents");

function resolveFile(storedPath) {
  if (!storedPath) return null;
  const basename = path.basename(storedPath);
  if (basename.includes("..")) return null;
  const p = path.resolve(UPLOAD_DIR, basename);
  if (p.startsWith(UPLOAD_DIR + path.sep) && fs.existsSync(p)) return p;
  return null;
}

exports.downloadAdminDocument = async (req, res) => {
  try {
    const doc = await prisma.document.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!doc) return res.status(404).json({ success: false, message: "Document non trouvé" });
    const p = resolveFile(doc.filePath);
    if (!p || !fs.existsSync(p)) return res.status(404).json({ success: false, message: "Fichier introuvable sur le disque" });
    res.setHeader("Content-Disposition", `attachment; filename="${doc.fileName || "document"}"`);
    res.setHeader("Content-Type", doc.mimeType || "application/pdf");
    res.sendFile(p);
  } catch (e) {
    console.error("admin download error:", e);
    res.status(500).json({ success: false, message: e.message || "Erreur interne" });
  }
};

