const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const folderAccessService = require('../services/folderAccess');

router.get('/documents/access', authMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.user.userId);
    const access = await folderAccessService.getAllForStudent(userId);
    // Return allowed folders only (for UI selection + badges)
    const allowedFolders = access
      .filter(a => !!a.allowed)
      .map(a => a.folder);
    res.json({ success: true, data: { userId, access: access || [], allowedFolders } });
  } catch (err) {
    console.error('Error getting document access:', err);
    res.status(500).json({ success: false, message: 'Erreur', error: err.message });
  }
});

module.exports = router;
