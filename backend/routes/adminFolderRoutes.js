const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { requireStaff } = require('../middlewares/roleMiddleware');
const folderAccessService = require('../services/folderAccess');
const notificationsService = require('../services/notifications');
const controller = require('../controllers/folderController');

// --- Admin endpoints (requireStaff) ---
router.get('/students/:id/folder-access', authMiddleware, requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const folders = await folderAccessService.getAllForStudent(userId);
    res.json({ success: true, data: folders });
  } catch (err) {
    console.error('Error fetching folder access for student:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération', error: err.message });
  }
});

router.put('/students/:id/folder-access/:folder', authMiddleware, requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { folder } = req.params;
    const allowed = !!req.body.allowed;

    if (!folderAccessService.VALID_FOLDERS.includes(folder)) {
      return res.status(400).json({ success: false, message: 'Dossier invalide' });
    }

    const userId = parseInt(id);
    const prev = await folderAccessService.getAccess(userId, folder);
    const prevAllowed = prev ? !!prev.allowed : false;

    await folderAccessService.setAccess(userId, folder, allowed, req.user?.userId || null);

    // Notification ONLY on real change: locked -> allowed
    if (!prevAllowed && allowed) {
      try {
        await notificationsService.createNotification({
          userId,
          type: 'folder_access',
          title: 'Accès aux documents',
          message: `Votre conseiller vous a autorisé à ajouter vos documents dans le dossier « ${folder} »`,
          link: '/user-dashboard'
        });
      } catch (notifErr) {
        console.error('Notification folder_access error (non-blocking):', notifErr.message);
      }
    }

    res.json({ success: true, message: `Folder access ${allowed ? 'allowed' : 'blocked'}` });
  } catch (err) {
    console.error('Error updating folder access:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour', error: err.message });
  }
});

module.exports = router;
