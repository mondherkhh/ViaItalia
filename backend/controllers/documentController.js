const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");

const UPLOAD_DIR = path.join(__dirname, "../uploads/documents");
function resolveStoredFile(storedPath) {
  if (!storedPath) return null;
  const basenameVal = path.basename(storedPath);
  if (basenameVal.includes("..")) return null;
  const docsPath = path.resolve(UPLOAD_DIR, basenameVal);
  const legacyPath = path.resolve(path.join(__dirname, "../uploads"), basenameVal);
  const uploadsDir = path.resolve(__dirname, "../uploads");
  const docDir = path.resolve(__dirname, "../uploads/documents");
  const inside = (p) => (p === uploadsDir || p === docDir || p.startsWith(uploadsDir + path.sep) || p.startsWith(docDir + path.sep));
  for (const p of [docsPath, legacyPath]) {
    if (inside(p) && fs.existsSync(p)) return p;
  }
  return null;
}

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

exports.getStudentDocuments = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { dossiers: { orderBy: { createdAt: "desc" }, take: 1 } } });
    const dossierId = user?.dossiers?.[0]?.id || null;
    if (!dossierId) return res.json({ success: true, data: [] });
    const docs = await prisma.document.findMany({ where: { dossierId, submittedAt: { not: null } }, orderBy: { createdAt: "desc" } });
    const data = (docs || []).map((d) => ({
      id: d.id, title: d.name || d.fileName || "—", fileName: d.fileName,
      category: d.category, type: d.mimeType ? d.mimeType.split("/").pop().toUpperCase() : (path.extname(d.fileName || "").replace(".", "").toUpperCase() || "PDF"),
      extension: path.extname(d.fileName || "").replace(".", "").toLowerCase(),
      status: d.status, createdAt: d.createdAt, uploadedAt: d.createdAt,
      size: d.size || 0, translated: d.isTranslation || false,
      url: "/api/student/documents/" + d.id + "/download"
    }));
    res.json({ success: true, data });
  } catch (e) { console.error("student doc error:", e); res.status(500).json({ success: false, message: e.message || String(e) }); }
};

exports.uploadStudentDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "Aucun fichier" });
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { dossiers: { orderBy: { createdAt: "desc" }, take: 1 } } });
    let dossierId = user?.dossiers?.[0]?.id;
    if (!dossierId) {
      const fullName = ((user.firstName || "") + " " + (user.lastName || "")).trim() || "étudiant";
      const created = await prisma.dossier.create({
        data: {
          userId: req.user.userId,
          title: "Dossier " + fullName,
          status: "PENDING",
          traductionStatus: "EN_COURS",
          inscriptionStatus: "EN_COURS",
          visaStatus: "EN_COURS",
        }
      });
      dossierId = created.id;
    }
    const file = req.file;
    const allowedExt = [".pdf", ".jpg", ".jpeg", ".png"];
    const allowedMime = ["application/pdf", "image/jpeg", "image/png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExt.includes(ext)) return res.status(400).json({ success: false, message: "Type non autorisé" });
    if (!allowedMime.includes(file.mimetype)) return res.status(400).json({ success: false, message: "Type de fichier non autorisé" });
    if (file.size > 10 * 1024 * 1024) return res.status(400).json({ success: false, message: "Fichier trop volumineux (10 Mo max)" });
    const title = file.originalname.replace(ext, "").replace(new RegExp("\\" + ext + "$"), "");
    const defaultFolders = ["Personal", "Academic journey", "Visa documents", "Translations", "Admissions"];
    const folderAccessService = require('../services/folderAccess');
    const category = (req.body.category && folderAccessService.VALID_FOLDERS.includes(req.body.category)) ? req.body.category : "Personal";
    // Enforce access on FINAL category (after fallback to Personal for empty/invalid)
    if (req.user && req.user.role !== 'ADMIN' && req.user.role !== 'AGENT') {
      const allowed = await folderAccessService.isAllowed(req.user.userId, category);
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "Ajout non autorisé dans ce dossier : demandez l'accès à votre conseiller"
        });
      }
    }
    const doc = await prisma.document.create({
      data: {
        dossierId, filePath: file.filename, fileName: file.originalname,
        category, name: title, size: file.size, mimeType: file.mimetype,
        uploaderId: req.user.userId, uploaderRole: req.user.role || "USER",
        status: "PENDING", submittedAt: null, isTranslation: false
      }
    });
    res.json({ success: true, data: { ...doc, url: "/api/student/documents/" + doc.id + "/download" } });
  } catch (e) { console.error("upload student error:", e); res.status(500).json({ success: false, message: e.message || String(e) }); }
};

exports.downloadStudentDocument = async (req, res) => {
  try {
    const doc = await prisma.document.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { dossiers: true } });
    const dossierIds = (user?.dossiers || []).map(d => d.id);
    if (!dossierIds.includes(doc.dossierId)) return res.status(404).json({ success: false, message: "Not found" });
    const p = resolveStoredFile(doc.filePath);
    if (!p || !fs.existsSync(p)) return res.status(404).json({ success: false, message: "File missing" });
    res.setHeader("Content-Disposition", `attachment; filename="${doc.fileName}"`);
    res.sendFile(p);
  } catch (e) { console.error("download student error:", e); res.status(500).json({ success: false, message: e.message || String(e) }); }
};

exports.deleteStudentDocument = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { dossiers: true } });
    const dossierIds = (user?.dossiers || []).map(d => d.id);
    if (!dossierIds.includes(doc.dossierId)) return res.status(404).json({ success: false, message: "Not found" });
    if (doc.uploaderId !== req.user.userId) return res.status(403).json({ success: false, message: "Non autorisé" });
    if (doc.status === "VALIDATED") return res.status(403).json({ success: false, message: "Document validé, suppression interdite" });
    if (doc.submittedAt != null && doc.status === "VALIDATED") return res.status(403).json({ success: false, message: "Document envoyé et validé, suppression interdite" });
    if (doc.filePath) {
      const p = resolveStoredFile(doc.filePath);
      if (p && fs.existsSync(p)) try { await fs.promises.unlink(p); } catch (_) {}
    }
    await prisma.document.delete({ where: { id } });
    res.json({ success: true, message: "Document supprimé" });
  } catch (e) { console.error("delete student error:", e); res.status(500).json({ success: false, message: e.message || String(e) }); }
};

exports.getDocuments = async (req, res) => {
  try {
    const docs = await prisma.document.findMany({
      where: { dossierId: parseInt(req.params.id), submittedAt: { not: null } },
      orderBy: { createdAt: "desc" }
    });
    const uploaderIds = [...new Set((docs || []).map(d => d.uploaderId).filter(id => id != null && id > 0))];
    const userMap = {};
    if (uploaderIds.length > 0) {
      const users = await prisma.user.findMany({ where: { id: { in: uploaderIds } }, select: { id: true, firstName: true, lastName: true, role: true } });
      users.forEach(u => { userMap[u.id] = u; });
    }
    const data = (docs || []).map((d) => ({
      id: d.id,
      title: d.name || d.fileName || "—",
      fileName: d.fileName,
      category: d.category,
      type: d.mimeType ? d.mimeType.split("/").pop().toUpperCase() : (path.extname(d.fileName || "").replace(".", "").toUpperCase() || "PDF"),
      extension: path.extname(d.fileName || "").replace(".", "").toLowerCase(),
      status: d.status,
      createdAt: d.createdAt,
      uploadedAt: d.createdAt,
      size: d.size || 0,
      translated: d.isTranslation || false,
      owner: (userMap[d.uploaderId] ? ((userMap[d.uploaderId].firstName || "") + " " + (userMap[d.uploaderId].lastName || "")).trim() || "Admin" : "Admin"),
      ownerRole: (userMap[d.uploaderId] ? userMap[d.uploaderId].role : (d.uploaderRole ? d.uploaderRole : null)),
      url: "/api/documents/" + d.id + "/download",
    }));
    res.json({ success: true, data });
  } catch (e) {
    console.error("documentController error:", e);
    res.status(500).json({ success: false, message: process.env.NODE_ENV === 'production' ? 'Internal error' : (e.message || String(e)) });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No file" });
    const dossierId = parseInt(req.params.id);
    const file = req.file;
    const ext = path.extname(file.originalname).toLowerCase();
    const title = file.originalname.replace(ext, "").replace(new RegExp("\\" + ext + "$") , "");
    const doc = await prisma.document.create({
      data: {
        dossierId,
        filePath: file.filename,
        fileName: file.originalname,
        category: req.body.category || req.body.folder || "Other",
        name: title,
        size: file.size,
        mimeType: file.mimetype,
        uploaderId: req.user?.userId || null,
        uploaderRole: req.user?.role || "ADMIN",
        status: "PENDING",
        isTranslation: false,
      }
    });
    res.json({ success: true, data: { ...doc, url: "/api/documents/" + doc.id + "/download" } });
  } catch (e) {
    console.error("documentController error:", e);
    res.status(500).json({ success: false, message: process.env.NODE_ENV === 'production' ? 'Internal error' : (e.message || String(e)) });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = {};
    if (req.body.title !== undefined) updates.name = req.body.title;
    if (req.body.category !== undefined) updates.category = req.body.category;
    if (req.body.status !== undefined) updates.status = req.body.status;
    if (req.body.translated !== undefined) updates.isTranslation = !!req.body.translated;
    const doc = await prisma.document.update({ where: { id }, data: updates });
    res.json({ success: true, data: doc });
  } catch (e) {
    console.error("documentController error:", e);
    res.status(500).json({ success: false, message: process.env.NODE_ENV === 'production' ? 'Internal error' : (e.message || String(e)) });
  }
};

exports.submitStudentDocument = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return res.status(404).json({ success: false, message: "Non trouvé" });
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { dossiers: true } });
    const dossierIds = (user?.dossiers || []).map(d => d.id);
    if (!dossierIds.includes(doc.dossierId)) return res.status(404).json({ success: false, message: "Non autorisé" });
    if (doc.uploaderId !== req.user.userId) return res.status(403).json({ success: false, message: "Non autorisé" });
    if (doc.submittedAt != null) return res.status(400).json({ success: false, message: "Déjà envoyé" });
    const updated = await prisma.document.update({ where: { id }, data: { status: "PENDING", submittedAt: new Date() } });
    if (updated && user) {
      try { const emailService = require("../services/emailService"); await emailService.sendDossierStatusUpdateEmail(user.email, (user.firstName||"")+" "+(user.lastName||""), doc.fileName||"", "PENDING", "PENDING", "Admin"); } catch (_) {}
    }
    res.json({ success: true, data: updated });
  } catch (e) { console.error("submit error:", e); res.status(500).json({ success: false, message: e.message || String(e) }); }
};

exports.deleteDocument = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    if (doc.filePath) {
      const basenameVal = path.basename(doc.filePath || "");
      if (basenameVal.includes("..")) {
        return res.status(400).json({ success: false, message: "Invalid file path" });
      }
      const p = resolveStoredFile(doc.filePath);
      if (p) {
        try { await fs.promises.unlink(p); } catch (unlinkErr) {
          if (unlinkErr.code !== "ENOENT") return res.status(500).json({ success: false, message: unlinkErr.message || String(unlinkErr) });
        }
      }
    }
    await prisma.document.delete({ where: { id } });
    res.json({ success: true, message: "Document deleted" });
  } catch (e) {
    console.error("documentController delete error:", e);
    res.status(500).json({ success: false, message: process.env.NODE_ENV === 'production' ? 'Internal error' : (e.message || String(e)) });
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    const doc = await prisma.document.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!doc) return res.status(404).json({ success: false, error: "Not found" });
    if (doc.submittedAt == null) return res.status(404).json({ success: false, error: "Not found" });
    const p = path.resolve(__dirname, "..", doc.filePath.replace(/^\/uploads\//, "uploads/"));
    if (!p) return res.status(404).json({ success: false, error: "File missing" });
    if (req.query.inline === "1") res.setHeader("Content-Disposition", `inline; filename="${doc.fileName}"`);
    else res.setHeader("Content-Disposition", `attachment; filename="${doc.fileName}"`);
    res.sendFile(p);
  } catch (e) {
    console.error("documentController error:", e);
    res.status(500).json({ success: false, message: process.env.NODE_ENV === 'production' ? 'Internal error' : (e.message || String(e)) });
  }
};
