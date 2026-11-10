const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { requireOwner } = require("../middlewares/requireRole");
const prisma = require("../config/prisma");

// GET /api/offices — any ADMIN (owner or agent can view active offices for dropdown)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const list = await prisma.agentOffice.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
    res.json({ success: true, data: list.map(o => ({ id: o.id, name: o.name, city: o.city, isActive: o.isActive })) });
  } catch (e) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// POST /api/offices — owner only
router.post("/", authMiddleware, requireOwner, async (req, res) => {
  try {
    const { name, city } = req.body || {};
    if (!name) return res.status(400).json({ success: false, message: "Nom requis" });
    const created = await prisma.agentOffice.create({ data: { name, city: city || null, isActive: true } });
    res.json({ success: true, data: { id: created.id, name: created.name, city: created.city, isActive: created.isActive } });
  } catch (e) {
    if (e.code === "P2002") return res.status(409).json({ success: false, message: "Nom déjà existant" });
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// PATCH /api/offices/:id — owner only
router.patch("/:id", authMiddleware, requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city, isActive } = req.body || {};
    const updated = await prisma.agentOffice.update({ where: { id: parseInt(id) }, data: { name: name !== undefined ? name : undefined, city: city !== undefined ? city : undefined, isActive: isActive !== undefined ? isActive : undefined } });
    res.json({ success: true, data: { id: updated.id, name: updated.name, city: updated.city, isActive: updated.isActive } });
  } catch (e) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// DELETE /api/offices/:id — owner only; 409 if in use
router.delete("/:id", authMiddleware, requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    // Check usage
    const userCount = await prisma.user.count({ where: { officeId: parseInt(id) } });
    const dossierCount = await prisma.dossier.count({ where: { officeId: parseInt(id) } });
    if (userCount > 0 || dossierCount > 0) return res.status(409).json({ success: false, message: "Office is in use" });
    await prisma.agentOffice.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: "Supprimé" });
  } catch (e) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;
