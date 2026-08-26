const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function publicUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isApproved: user.role === 'ADMIN' || user.isApproved === true,
    passport: user.passport,
    address: user.address,
    phoneNumber: user.phoneNumber,
    image: user.image,
    createdAt: user.createdAt
  };
}

function normaliseEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function createUserDossier(user) {
  try {
    const dossier = await prisma.dossier.create({
      data: {
        title: `Dossier de ${user.firstName} ${user.lastName}`,
        status: 'PENDING',
        userId: user.id
      }
    });
    console.log('Dossier créé automatiquement:', dossier.id, 'pour user:', user.id);
  } catch (error) {
    console.error('Erreur création dossier automatique:', error.message);
  }
}

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const firstName = String(req.body?.firstName || '').trim();
    const lastName = String(req.body?.lastName || '').trim();
    const email = normaliseEmail(req.body?.email);
    const password = String(req.body?.password || '');
    const passport = String(req.body?.passport || '').trim();
    const address = String(req.body?.address || '').trim();
    const phoneNumber = String(req.body?.phoneNumber || '').trim();
    const image = req.body?.image || null;

    if (!firstName || !lastName || !email || !password || !passport || !address || !phoneNumber) {
      return res.status(400).json({ success: false, message: 'Tous les champs obligatoires doivent être remplis.' });
    }
    if (!validEmail(email)) return res.status(400).json({ success: false, message: 'Adresse email invalide.' });
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(409).json({ success: false, message: 'Un utilisateur avec cette adresse email existe déjà.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword, passport, address, phoneNumber, image, role: 'USER', isApproved: false }
    });

    await createUserDossier(user);
    return res.status(201).json({
      success: true,
      message: 'Compte créé. Remplissez le formulaire puis attendez la validation de l’administrateur.',
      user: publicUser(user),
      userId: user.id
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la création du compte.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const email = normaliseEmail(req.body?.email);
    const password = String(req.body?.password || '');
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email et mot de passe sont obligatoires.' });
    if (!validEmail(email)) return res.status(400).json({ success: false, message: 'Adresse email invalide.' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });

    if (user.role === 'USER' && user.isApproved !== true) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_PENDING_APPROVAL',
        message: 'Votre compte est en attente de validation par l’administrateur. Remplissez le formulaire de demande puis attendez l’activation de votre accès.'
      });
    }

    if (!process.env.JWT_SECRET) return res.status(500).json({ success: false, message: 'Configuration serveur incomplète.' });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.status(200).json({ success: true, token, user: publicUser(user), userId: user.id, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Erreur interne lors de la connexion.' });
  }
};

// GET /api/auth/users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, email: true, role: true, isApproved: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la récupération des utilisateurs.' });
  }
};

// PATCH /api/auth/users/:id/access — ADMIN uniquement
const updateUserAccess = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const isApproved = req.body?.isApproved === true;
    if (!Number.isInteger(id)) return res.status(400).json({ success: false, message: 'ID utilisateur invalide.' });

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    if (targetUser.role === 'ADMIN') return res.status(400).json({ success: false, message: 'Le compte administrateur ne nécessite pas cette validation.' });

    const updatedUser = await prisma.user.update({ where: { id }, data: { isApproved } });
    return res.status(200).json({
      success: true,
      message: isApproved ? 'Accès dashboard accordé.' : 'Accès dashboard retiré.',
      user: publicUser(updatedUser)
    });
  } catch (error) {
    console.error('Update user access error:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de l’accès.' });
  }
};

// DELETE /api/auth/users/:id
const deleteUser = async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ success: false, message: 'ID utilisateur invalide.' });
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    await prisma.user.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Utilisateur et données associées supprimés avec succès.' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la suppression de l’utilisateur.' });
  }
};

// POST /api/auth/users — ADMIN uniquement
const createUser = async (req, res) => {
  try {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ success: false, message: 'Accès refusé. Seul un administrateur peut créer des utilisateurs.' });
    const firstName = String(req.body?.firstName || '').trim();
    const lastName = String(req.body?.lastName || '').trim();
    const email = normaliseEmail(req.body?.email);
    const password = String(req.body?.password || '');
    const passport = String(req.body?.passport || '').trim();
    const address = String(req.body?.address || '').trim();
    const phoneNumber = String(req.body?.phoneNumber || '').trim();
    const image = req.body?.image || null;
    const role = req.body?.role === 'ADMIN' ? 'ADMIN' : 'USER';

    if (!firstName || !lastName || !email || !password || !passport || !address || !phoneNumber) return res.status(400).json({ success: false, message: 'Tous les champs obligatoires doivent être remplis.' });
    if (!validEmail(email)) return res.status(400).json({ success: false, message: 'Adresse email invalide.' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    if (await prisma.user.findUnique({ where: { email } })) return res.status(409).json({ success: false, message: 'Un utilisateur avec cette adresse email existe déjà.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { firstName, lastName, email, password: hashedPassword, passport, address, phoneNumber, image, role, isApproved: role === 'ADMIN' } });
    await createUserDossier(user);
    return res.status(201).json({ success: true, message: 'Utilisateur créé avec succès.', user: publicUser(user), userId: user.id });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la création de l’utilisateur.' });
  }
};

// GET /api/auth/users/search?query=...
const searchUsers = async (req, res) => {
  try {
    const query = String(req.query?.query || '').trim();
    if (!query) return res.status(400).json({ success: false, message: 'Veuillez fournir un terme de recherche.' });
    const users = await prisma.user.findMany({
      where: { OR: [{ firstName: { contains: query } }, { lastName: { contains: query } }, { email: { contains: query } }] },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, isApproved: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ success: true, data: users, count: users.length });
  } catch (error) {
    console.error('Search users error:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la recherche des utilisateurs.' });
  }
};

// PUT /api/auth/profile
const updateUser = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Non authentifié.' });
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    const email = req.body?.email !== undefined ? normaliseEmail(req.body.email) : undefined;
    if (email && email !== currentUser.email) {
      if (!validEmail(email)) return res.status(400).json({ success: false, message: 'Adresse email invalide.' });
      if (await prisma.user.findUnique({ where: { email } })) return res.status(409).json({ success: false, message: 'Email déjà utilisé.' });
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(req.body?.firstName !== undefined && { firstName: String(req.body.firstName).trim() }),
        ...(req.body?.lastName !== undefined && { lastName: String(req.body.lastName).trim() }),
        ...(email !== undefined && { email }),
        ...(req.body?.passport !== undefined && { passport: String(req.body.passport).trim() }),
        ...(req.body?.address !== undefined && { address: String(req.body.address).trim() }),
        ...(req.body?.phoneNumber !== undefined && { phoneNumber: String(req.body.phoneNumber).trim() }),
        ...(req.body?.image !== undefined && { image: req.body.image || null })
      }
    });
    return res.status(200).json({ success: true, message: 'Profil mis à jour avec succès.', user: publicUser(updatedUser) });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du profil.' });
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const currentPassword = String(req.body?.currentPassword || '');
    const newPassword = String(req.body?.newPassword || '');
    if (!userId) return res.status(401).json({ success: false, message: 'Non authentifié.' });
    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Les deux mots de passe sont obligatoires.' });
    if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    if (!await bcrypt.compare(currentPassword, user.password)) return res.status(400).json({ success: false, message: 'Le mot de passe actuel est incorrect.' });
    const password = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password } });
    return res.status(200).json({ success: true, message: 'Mot de passe modifié avec succès.' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la modification du mot de passe.' });
  }
};

module.exports = { register, login, getAllUsers, updateUserAccess, deleteUser, createUser, searchUsers, updateUser, changePassword };
