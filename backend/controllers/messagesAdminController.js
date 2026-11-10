const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getConversations = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "USER" },
      select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true, isApproved: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    const lastMessages = await prisma.message.findMany({
      where: { sender: "ADMIN" },
      orderBy: { createdAt: "desc" },
    });
    const lastMsgByUser = {};
    for (const m of lastMessages) {
      if (!lastMsgByUser[m.userId]) lastMsgByUser[m.userId] = m;
    }
    const usersWithMsg = users.map((u) => {
      const lm = lastMsgByUser[u.id];
      return {
        userId: u.id,
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        caseRef: `VIA-${new Date(u.createdAt).getFullYear()}-${String(u.id).padStart(4, "0")}`,
        lastMessage: lm ? { content: lm.content, sender: lm.sender, createdAt: lm.createdAt } : null,
        unreadCount: 0,
        stage: u.isApproved ? "Onboarded" : "Invited",
        createdAt: u.createdAt,
      };
    });
    // Students with messages first (by last message time), then rest
    usersWithMsg.sort((a, b) => {
      const ta = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(0);
      const tb = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(0);
      return tb - ta;
    });
    return res.json({ success: true, data: usersWithMsg });
  } catch (e) {
    console.error("getConversations error:", e);
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (!userId) return res.status(400).json({ success: false, message: "Invalid userId" });
    const student = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true, createdAt: true, isApproved: true },
    });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    let uni = null, dossier = null;
    try { uni = await prisma.universityInfo.findFirst({ where: { userId }, select: { university: true, specialty: true, level: true, createdAt: true } }); } catch {}
    try { dossier = await prisma.dossier.findFirst({ where: { userId }, select: { status: true, stage: true } }); } catch {}
    const messages = await prisma.message.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
    return res.json({
      success: true,
      data: {
        student: {
          id: student.id,
          firstName: student.firstName || "",
          lastName: student.lastName || "",
          email: student.email || "",
          phoneNumber: student.phoneNumber || null,
          caseRef: `VIA-${new Date(student.createdAt).getFullYear()}-${String(student.id).padStart(4, "0")}`,
          stage: student.isApproved ? "Onboarded" : (dossier ? (dossier.status === "VALIDATED" ? "Choice locked" : dossier.status === "PENDING" ? "Invited" : "Onboarded") : "Invited"),
          field: uni ? uni.specialty || null : null,
          intake: uni ? (uni.createdAt ? new Date(uni.createdAt).getFullYear() : null) : null,
        },
        messages: messages.map((m) => ({ id: m.id, content: m.content, sender: m.sender, createdAt: m.createdAt })),
      },
    });
  } catch (e) {
    console.error("getConversation error:", e);
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (!userId) return res.status(400).json({ success: false, message: "Invalid userId" });
    const { content } = req.body || {};
    if (!content || !content.trim()) return res.status(400).json({ success: false, message: "Content is required" });
    if (content.trim().length > 2000) return res.status(400).json({ success: false, message: "Content too long" });
    const message = await prisma.message.create({ data: { content: content.trim(), sender: "ADMIN", userId } });
    return res.status(201).json({ success: true, data: message });
  } catch (e) {
    console.error("sendMessage error:", e);
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    return res.json({ success: true, data: { total: 0 } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    return res.json({ success: true, data: { total: 0 } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

const getConversations = exports.getConversations; const getConversation = exports.getConversation; const sendMessage = exports.sendMessage; const markRead = exports.markRead; const getUnreadCount = exports.getUnreadCount; module.exports = { getConversations, getConversation, sendMessage, markRead, getUnreadCount };
