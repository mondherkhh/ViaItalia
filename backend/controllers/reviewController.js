const prisma = require('../config/prisma');

const publicUser = { select: { id: true, firstName: true, lastName: true, email: true } };
const getAuthenticatedUserId = req => Number(req.user?.userId || req.user?.id);

const validateReview = body => {
  const rating = Number(body.rating);
  const content = String(body.content || '').trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: 'Choisissez une note.' };
  if (content.length > 1000) return { error: 'Le commentaire ne doit pas dépasser 1000 caractères.' };
  if (content.length < 10) return { error: 'Commentaire trop court (minimum 10 caractères).' };
  return { rating, content };
};

const createReview = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!Number.isInteger(userId) || userId <= 0) return res.status(401).json({ success: false, message: 'Session utilisateur invalide.' });
    const values = validateReview(req.body || {});
    if (values.error) return res.status(400).json({ success: false, message: values.error });
    const pending = await prisma.review.findFirst({ where: { userId, status: 'PENDING' } });
    if (pending) return res.status(409).json({ success: false, message: 'Vous avez déjà envoyé un avis. Merci pour votre retour.' });
    const review = await prisma.review.create({
      data: { ...values, userId, status: 'PENDING', updatedAt: new Date() },
    });
    const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUser.select });
    return res.status(201).json({ success: true, data: { ...review, user }, message: "Merci, votre avis a ete envoye." });
  } catch (error) {
    console.error('Create review:', error.message || error);
    return res.status(500).json({ success: false, message: 'Impossible d\'enregistrer votre avis.' });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!Number.isInteger(userId) || userId <= 0) return res.status(401).json({ success: false, message: 'Session invalide.' });
    const data = await prisma.review.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data });
  } catch (error) {
    console.error('My reviews:', error.message || error);
    return res.status(500).json({ success: false, message: 'Impossible de charger vos avis.' });
  }
};

const getAdminReviews = async (req, res) => {
  try {
    const status = ['PENDING','APPROVED','REJECTED'].includes(req.query.status) ? req.query.status : undefined;
    const reviews = await prisma.review.findMany({ where: status ? { status } : {}, orderBy: { createdAt: 'desc' } });
    const withUser = await Promise.all(reviews.map(async r => {
      const user = await prisma.user.findUnique({ where: { id: r.userId }, select: publicUser.select });
      return { ...r, user };
    }));
    const avg = withUser.length ? (withUser.reduce((s, r) => s + r.rating, 0) / withUser.length).toFixed(1) : 0;
    return res.json({ success: true, data: withUser, meta: { total: withUser.length, average: Number(avg) } });
  } catch (error) {
    console.error('Admin reviews:', error.message || error);
    return res.status(500).json({ success: false, message: 'Impossible de charger les avis administrateur.' });
  }
};

const moderateReview = async (req, res) => {
  try {
    const status = String(req.body.status || '').toUpperCase();
    if (!['APPROVED','REJECTED'].includes(status)) return res.status(400).json({ success: false, message: 'Statut invalide.' });
    const review = await prisma.review.update({
      where: { id: Number(req.params.id) },
      data: { status, adminNote: req.body.adminNote ? String(req.body.adminNote).slice(0,500) : null, updatedAt: new Date() }
    });
    const user = await prisma.user.findUnique({ where: { id: review.userId }, select: publicUser.select });
    return res.json({ success: true, data: { ...review, user }, message: status === 'APPROVED' ? 'Avis accepté.' : 'Avis refusé.' });
  } catch (error) {
    console.error('Moderate review:', error.message || error);
    return res.status(500).json({ success: false, message: 'Impossible de modérer.' });
  }
};

const getApprovedReviews = async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 12)));
    const data = await prisma.review.findMany({ where: { status: 'APPROVED' }, orderBy: { createdAt: 'desc' }, take: limit });
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Approved reviews:', error.message || error);
    return res.status(500).json({ success: false, message: 'Impossible de charger les avis.' });
  }
};

const createAdminReview = async (req, res) => {
  try {
    const userId = Number(req.body?.userId);
    if (!Number.isInteger(userId) || userId <= 0) return res.status(400).json({ success: false, message: 'Sélectionnez un client valide.' });
    const values = validateReview(req.body || {});
    if (values.error) return res.status(400).json({ success: false, message: values.error });
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!user || user.role === 'ADMIN') return res.status(404).json({ success: false, message: 'Client introuvable.' });
    const review = await prisma.review.create({ data: { ...values, userId, status: 'APPROVED', updatedAt: new Date() } });
    const userInfo = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, firstName: true, lastName: true, email: true } });
    return res.status(201).json({ success: true, data: { ...review, user: userInfo }, message: 'Avis ajouté et publié.' });
  } catch (error) {
    console.error('Admin create review:', error.message || error);
    return res.status(500).json({ success: false, message: 'Impossible de créer cet avis.' });
  }
};

const deleteAdminReview = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ success: false, message: 'Identifiant invalide.' });
    await prisma.review.delete({ where: { id } });
    return res.json({ success: true, message: 'Avis supprimé.' });
  } catch (error) {
    console.error('Delete admin review:', error.message || error);
    return res.status(500).json({ success: false, message: 'Impossible de supprimer.' });
  }
};

module.exports = {
  createReview,
  getMyReviews,
  getAdminReviews,
  moderateReview,
  getApprovedReviews,
  createAdminReview,
  deleteAdminReview,
};
