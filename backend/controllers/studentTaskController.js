const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function jsonErr(res, msg, status = 400) {
  return res.status(status).json({ success: false, message: msg });
}

exports.getTasksByUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (!userId) return jsonErr(res, "userId required");
    const tasks = await prisma.studentTask.findMany({
      where: { userId },
      orderBy: { assignedAt: "desc" },
      include: { user: { select: { id: true, firstName: true, lastName: true } } }
    });
    // folderEmpty derived: only for DOCUMENTS tasks when folder set
    const folderEmpty = await Promise.all((tasks || []).filter(t => t.type === "DOCUMENTS" && t.folder).map(async (t) => {
      // legacy document categories mapping (case-insensitive) for folder check
      const folderMap = { "Traduction": "Traduction", "Inscription": "Inscription", "Visa": "Visa" };
      // Use dossierId if set, else userId via latest dossier? Use dossier user linkage
      // Simplified: count documents matching folder category for user's dossiers
      const dossierIds = await prisma.dossier.findMany({ where: { userId: t.userId }, select: { id: true } }).then(d => d.map(x => x.id));
      if (!dossierIds || dossierIds.length === 0) return true;
      const count = await prisma.document.count({ where: { dossierId: { in: dossierIds }, category: { equals: t.folder, mode: "insensitive" } } });
      return count === 0;
    }));
    const data = (tasks || []).map((t, i) => ({
      id: t.id,
      userId: t.userId,
      type: t.type,
      title: t.title,
      description: t.description,
      amount: t.amount ? parseFloat(t.amount) : null,
      currency: t.currency,
      folder: t.folder,
      folderEmpty: t.type === "DOCUMENTS" && t.folder ? folderEmpty[i] : undefined,
      status: t.status,
      assignedAt: t.assignedAt,
      completedAt: t.completedAt,
    }));
    res.json({ success: true, data });
  } catch (e) {
    console.error("getTasksByUser error:", e);
    res.status(500).json({ success: false, message: process.env.NODE_ENV === "production" ? "Internal error" : e.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { userId, dossierId, type, title, description, amount, currency, folder } = req.body || {};
    if (!userId) return jsonErr(res, "userId required");
    if (!title || typeof title !== "string" || title.trim().length === 0) return jsonErr(res, "title required");
    if (title.trim().length > 80) return jsonErr(res, "title max 80 chars");
    if (description && typeof description === "string" && description.length > 300) return jsonErr(res, "description max 300 chars");
    const validTypes = ["PAYMENTS","DOCUMENTS","UNIVERSITIES","GENERAL"];
    if (!validTypes.includes(type)) return jsonErr(res, "invalid type");
    if (type === "PAYMENTS" && (amount === undefined || amount === null || parseFloat(amount) <= 0)) return jsonErr(res, "PAYMENTS requires amount > 0");
    const task = await prisma.studentTask.create({
      data: {
        userId: parseInt(userId),
        dossierId: dossierId ? parseInt(dossierId) : undefined,
        type,
        title: title.trim(),
        description: description ? description.trim() : null,
        amount: amount ? parseFloat(amount) : null,
        currency: currency || "TND",
        folder: folder || null,
        status: "OPEN",
      }
    });
    res.status(201).json({ success: true, data: task });
  } catch (e) {
    console.error("createTask error:", e);
    res.status(500).json({ success: false, message: process.env.NODE_ENV === "production" ? "Internal error" : e.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, title, description, amount, folder } = req.body || {};
    if (!id) return jsonErr(res, "id required");
    const updates = {};
    if (status === "DONE" || status === "OPEN") updates.status = status;
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) return jsonErr(res, "title required");
      if (title.trim().length > 80) return jsonErr(res, "title max 80");
      updates.title = title.trim();
    }
    if (description !== undefined) {
      if (typeof description === "string" && description.length > 300) return jsonErr(res, "description max 300");
      updates.description = description ? description.trim() : null;
    }
    if (amount !== undefined) updates.amount = amount ? parseFloat(amount) : null;
    if (folder !== undefined) updates.folder = folder || null;
    if (status === "DONE") updates.completedAt = new Date();
    if (status === "OPEN") updates.completedAt = null;
    const task = await prisma.studentTask.update({ where: { id }, data: updates });
    res.json({ success: true, data: task });
  } catch (e) {
    console.error("updateTask error:", e);
    res.status(500).json({ success: false, message: process.env.NODE_ENV === "production" ? "Internal error" : e.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.studentTask.delete({ where: { id } });
    res.json({ success: true, message: "Task deleted" });
  } catch (e) {
    console.error("deleteTask error:", e);
    res.status(500).json({ success: false, message: process.env.NODE_ENV === "production" ? "Internal error" : e.message });
  }
};

exports.logPayment = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const task = await prisma.studentTask.findUnique({ where: { id } });
    if (!task) return jsonErr(res, "Task not found", 404);
    if (task.type !== "PAYMENTS") return jsonErr(res, "Only PAYMENTS tasks can log payment");
    if (!task.amount) return jsonErr(res, "Task has no amount");
    const userId = task.userId;
    const amount = parseFloat(task.amount);
    const currency = task.currency || "TND";
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          amount,
          status: "PAID",
          userId,
          prixTotal: amount,
          prixPaye: amount,
          prixReste: 0,
        }
      }),
      prisma.studentTask.update({
        where: { id },
        data: { status: "DONE", completedAt: new Date() }
      })
    ]);
    const updatedTask = await prisma.studentTask.findUnique({ where: { id } });
    res.json({ success: true, data: { task: updatedTask, paymentAmount: amount, currency } });
  } catch (e) {
    console.error("logPayment error:", e);
    res.status(500).json({ success: false, message: process.env.NODE_ENV === "production" ? "Internal error" : e.message });
  }
};
