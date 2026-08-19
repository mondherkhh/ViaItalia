// Role-based authorization middlewares.
// These run AFTER authMiddleware, which sets req.user = { userId, role }.

// Allow only administrators.
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Accès refusé - Réservé aux administrateurs",
    });
  }
  next();
};

// Allow the resource owner (req.params.userId === token userId) OR an admin.
// Prevents horizontal privilege escalation (reading another user's data by
// changing the :userId in the URL).
const requireSelfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Non authentifié" });
  }

  const targetUserId = parseInt(req.params.userId, 10);
  if (req.user.role === "ADMIN" || req.user.userId === targetUserId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Accès refusé - Vous ne pouvez accéder qu'à vos propres données",
  });
};

module.exports = { requireAdmin, requireSelfOrAdmin };
