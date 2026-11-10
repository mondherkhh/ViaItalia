const prisma = require("../config/prisma");

function userIdFromToken(req) {
  return req.user?.userId || req.user?.id;
}

// Owner = ADMIN (never AGENT). Always loads from DB.
async function requireOwner(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userIdFromToken(req) } });
    if (!user) return res.status(401).json({ success: false, message: "Utilisateur introuvable" });
    if (user.role !== "ADMIN") return res.status(403).json({ success: false, message: "Accès réservé au propriétaire" });
    req.dbUser = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

// Owners (ADMIN) pass everything; staff (AGENT) passes only allowedSections.
function resolveSection(id) {
  if (id === 'users' || id === 'dossiers') return 'students';
  return id;
}

function requireSection(id) {
  return async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: userIdFromToken(req) } });
      if (!user) return res.status(401).json({ success: false, message: "Utilisateur introuvable" });
      req.dbUser = user;
      if (user.role === "ADMIN") return next();
      if (user.role === "AGENT") {
        const allowed = user.allowedSections ? String(user.allowedSections).split(",") : [];
        const canonical = resolveSection(id);
        const canonicalAllowed = allowed.map(s => resolveSection(s.trim()));
        if (!canonicalAllowed.includes(canonical)) {
          return res.status(403).json({ success: false, message: "Section not allowed" });
        }
        return next();
      }
      return res.status(403).json({ success: false, message: "Accès refusé" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  };
}

module.exports = { requireOwner, requireSection };
