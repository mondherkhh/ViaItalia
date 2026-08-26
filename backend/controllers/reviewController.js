const prisma = require('../config/prisma');

const publicUser = { select: { id: true, firstName: true, lastName: true, image: true } };
const getAuthenticatedUserId = req => Number(req.user?.userId || req.user?.id);

const validateReview = body => {
  const rating = Number(body.rating);
  const content = String(body.content || '').trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: 'La note doit être comprise entre 1 et 5.' };
  if (content.length < 10 || content.length > 1000) return { error: 'L’avis doit contenir entre 10 et 1000 caractères.' };
  return { rating, content };
};

const createReview = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!Number.isInteger(userId) || userId <= 0) return res.status(401).json({ success: false, message: 'Session utilisateur invalide. Veuillez vous reconnecter.' });
    const values = validateReview(req.body || {});
    if (values.error) return res.status(400).json({ success: false, message: values.error });
    const pending = await prisma.review.findFirst({ where: { userId, status: 'PENDING' } });
    if (pending) return res.status(409).json({ success: false, message: 'Vous avez déjà un avis en attente de validation.' });
    const review = await prisma.review.create({ data: { ...values, userId }, include: { user: publicUser } });
    return res.status(201).json({ success: true, data: review, message: 'Votre avis a été envoyé et sera publié après validation.' });
  } catch (error) {
    console.error('Create review:', error);
    return res.status(500).json({ success: false, message: 'Impossible d’enregistrer votre avis.' });
  }
};

const createAdminReview = async (req, res) => {
  try {
    const userId = Number(req.body?.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ success: false, message: 'Veuillez sélectionner un client valide.' });
    }
    const values = validateReview(req.body || {});
    if (values.error) return res.status(400).json({ success: false, message: values.error });

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
    if (!user || user.role === 'ADMIN') {
      return res.status(404).json({ success: false, message: 'Client introuvable.' });
    }

    const review = await prisma.review.create({
      data: { ...values, userId, status: 'APPROVED', reviewedAt: new Date() },
      include: { user: publicUser }
    });
    return res.status(201).json({ success: true, data: review, message: 'Avis ajouté et publié sur la page Home.' });
  } catch (error) {
    console.error('Admin create review:', error);
    return res.status(500).json({ success: false, message: 'Impossible de créer et publier cet avis.' });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!Number.isInteger(userId) || userId <= 0) return res.status(401).json({ success: false, message: 'Session utilisateur invalide. Veuillez vous reconnecter.' });
    const data = await prisma.review.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data });
  } catch (error) {
    console.error('My reviews:', error);
    return res.status(500).json({ success: false, message: 'Impossible de charger vos avis.' });
  }
};

const getApprovedReviews = async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 12)));
    const data = await prisma.review.findMany({ where: { status: 'APPROVED' }, include: { user: publicUser }, orderBy: { reviewedAt: 'desc' }, take: limit });
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Approved reviews:', error);
    return res.status(500).json({ success: false, message: 'Impossible de charger les avis.' });
  }
};

const getAdminReviews = async (req, res) => {
  try {
    const status = ['PENDING', 'APPROVED', 'REJECTED'].includes(req.query.status) ? req.query.status : undefined;
    const data = await prisma.review.findMany({ where: status ? { status } : {}, include: { user: publicUser }, orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data });
  } catch (error) {
    console.error('Admin reviews:', error);
    return res.status(500).json({ success: false, message: 'Impossible de charger les avis administrateur.' });
  }
};

const deleteAdminReview = async (req, res) => {
  const id = Number(req.params.id);
  console.log('[REVIEWS DELETE] request received', { id, adminId: req.user?.userId || req.user?.id });
  try {
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'Identifiant d’avis invalide.' });
    }
    const existing = await prisma.review.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return res.status(404).json({ success: false, message: 'Avis introuvable.' });
    await prisma.review.delete({ where: { id } });
    console.log('[REVIEWS DELETE] success', { id });
    return res.json({ success: true, message: 'Avis supprimé avec succès.' });
  } catch (error) {
    console.error('[REVIEWS DELETE] failed', { id, code: error.code, message: error.message });
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Avis introuvable ou déjà supprimé.' });
    return res.status(500).json({ success: false, message: 'Impossible de supprimer cet avis.' });
  }
};

const moderateReview = async (req, res) => {
  try {
    const status = String(req.body.status || '').toUpperCase();
    if (!['APPROVED', 'REJECTED'].includes(status)) return res.status(400).json({ success: false, message: 'Statut de modération invalide.' });
    const review = await prisma.review.update({ where: { id: Number(req.params.id) }, data: { status, adminNote: req.body.adminNote ? String(req.body.adminNote).slice(0, 500) : null, reviewedAt: new Date() }, include: { user: publicUser } });
    return res.json({ success: true, data: review, message: status === 'APPROVED' ? 'Avis accepté et visible sur la page Home.' : 'Avis refusé.' });
  } catch (error) {
    console.error('Moderate review:', error);
    return res.status(500).json({ success: false, message: 'Impossible de modérer cet avis.' });
  }
};

module.exports = { createReview, createAdminReview, getMyReviews, getApprovedReviews, getAdminReviews, moderateReview, deleteAdminReview };
