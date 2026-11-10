const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
exports.getFolders = async (req, res) => {
  try {
    const folders = await prisma.documentFolder.findMany({ where: { dossierId: parseInt(req.params.id) }, orderBy: { createdAt: "asc" } });
    res.json({ success: true, data: folders });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};
exports.createFolder = async (req, res) => {
  try {
    const folder = await prisma.documentFolder.create({ data: { dossierId: parseInt(req.body.dossierId), name: req.body.name, status: "INCOMPLETE" } });
    res.json({ success: true, data: folder });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};
exports.renameFolder = async (req, res) => {
  try {
    const folder = await prisma.documentFolder.update({ where: { id: parseInt(req.params.id) }, data: { name: req.body.name } });
    res.json({ success: true, data: folder });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};
exports.deleteFolder = async (req, res) => {
  try {
    await prisma.documentFolder.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};
