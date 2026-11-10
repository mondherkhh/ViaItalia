const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { requireOwner } = require("../middlewares/requireRole");
const { sectionIds } = require("../config/sections");
const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

function generatePassword() {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 12; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// GET /api/agents — owner only
router.get("/", authMiddleware, requireOwner, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { OR: [{ role: "AGENT" }, { AND: [{ role: "ADMIN" }, { isAgent: true }] }] },
      include: { agentOffice: true },
      orderBy: { firstName: "asc" }
    });
    const data = users.filter(u => !(u.role === "ADMIN" && !u.isAgent)).map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phoneNumber: u.phoneNumber,
      address: u.address,
      officeId: u.officeId,
      role: u.role,
      officeName: u.agentOffice ? u.agentOffice.name : null,
      allowedSections: u.allowedSections ? String(u.allowedSections).split(",").filter(Boolean) : []
    }));
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// POST /api/agents — owner only
router.post("/", authMiddleware, requireOwner, async (req, res) => {
  try {
    const { officeId, firstName, lastName, email, phoneNumber, address, password, allowedSections } = req.body || {};
    if (!firstName || !lastName || !email) return res.status(400).json({ success: false, message: "Prénom, nom et email requis" });
    if (!officeId) return res.status(400).json({ success: false, message: "Bureau requis" });

    // Validate office exists
    const office = await prisma.agentOffice.findUnique({ where: { id: parseInt(officeId) } });
    if (!office) return res.status(404).json({ success: false, message: "Bureau non trouvé" });

    // Check unique email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ success: false, message: "Email déjà utilisé" });

    // Validate sections
    let sectionsArr = [];
    if (allowedSections && Array.isArray(allowedSections)) {
      sectionsArr = allowedSections.filter(s => sectionIds.includes(s) && s !== "settings");
    } else {
      sectionsArr = ["dashboard", "students", "messages", "alerts"];
    }
    if (sectionsArr.length === 0) sectionsArr = ["dashboard", "students", "messages", "alerts"];

    const hash = await bcrypt.hash(password || generatePassword(), 10);
    const tempPwd = password || generatePassword(); // return the actual temp if generated; if user passed, return it too (once)
    const user = await prisma.user.create({
      data: {
        firstName, lastName, email, password: hash,
        phoneNumber: phoneNumber || null,
        address: address || null,
        officeId: parseInt(officeId),
        role: "AGENT",
        isAgent: true,
        isApproved: true,
        allowedSections: sectionsArr.join(",")
      }
    });
    res.json({ success: true, data: {
      id: user.id, firstName: user.firstName, lastName: user.lastName,
      email: user.email, officeId: user.officeId, allowedSections: sectionsArr
    }, temporaryPassword: tempPwd });
  } catch (e) {
    res.status(500).json({ success: false, message: "Erreur serveur: " + (e.message || "") });
  }
});

// PATCH /api/agents/:id — owner
router.patch("/:id", authMiddleware, requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const { officeId, firstName, lastName, email, phoneNumber, address, allowedSections } = req.body || {};
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (address !== undefined) updateData.address = address;
    if (officeId !== undefined) {
      const office = await prisma.agentOffice.findUnique({ where: { id: parseInt(officeId) } });
      if (!office) return res.status(404).json({ success: false, message: "Bureau non trouvé" });
      updateData.officeId = parseInt(officeId);
    }
    if (allowedSections !== undefined) {
      const arr = Array.isArray(allowedSections) ? allowedSections.filter(s => sectionIds.includes(s) && s !== "settings") : [];
      updateData.allowedSections = arr.length ? arr.join(",") : "";
    }
    let target = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!target) return res.status(404).json({ success: false, message: "Non trouvé" });
    if (target.role === "ADMIN" && target.isAgent === true) updateData.role = "AGENT";
    if (target.role !== "AGENT" && !(target.role === "ADMIN" && target.isAgent === true)) return res.status(400).json({ success: false, message: "Seuls les agents peuvent être modifiés" });
    const updated = await prisma.user.update({ where: { id: parseInt(id) }, data: updateData });
    const sectionsArr = updated.allowedSections ? String(updated.allowedSections).split(",").filter(Boolean) : [];
    res.json({ success: true, data: {
      id: updated.id, firstName: updated.firstName, lastName: updated.lastName,
      email: updated.email, officeId: updated.officeId, allowedSections: sectionsArr
    }});
  } catch (e) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// PATCH /api/agents/:id/password — owner only (reset password)
router.patch("/:id/password", authMiddleware, requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body || {};
    const newPassword = password && String(password).trim() ? String(password).trim() : generatePassword();
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: parseInt(id) }, data: { password: hash } });
    res.json({ success: true, message: "Password reset", temporaryPassword: newPassword });
  } catch (e) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// DELETE /api/agents/:id — owner (only isAgent true users)
router.delete("/:id", authMiddleware, requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const target = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!target) return res.status(404).json({ success: false, message: "Non trouvé" });
    if (target.role === "ADMIN" && !target.isAgent) return res.status(400).json({ success: false, message: "Le propriétaire ne peut pas être supprimé" });
    if (target.role !== "AGENT" && !(target.role === "ADMIN" && target.isAgent === true)) return res.status(400).json({ success: false, message: "Seuls les agents peuvent être supprimés" });
    if (target.role === "ADMIN" && target.isAgent === true) await prisma.user.update({ where: { id: parseInt(id) }, data: { role: "AGENT" } });
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: "Agent supprimé" });
  } catch (e) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;
