const prisma = require('../config/prisma');
const nodemailer = require('nodemailer');

const includeUser = { user: { select: { id: true, firstName: true, lastName: true, email: true } } };
const transporter = process.env.EMAIL_USER && process.env.EMAIL_PASS ? nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com', port: Number(process.env.EMAIL_PORT || 587), secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
}) : null;
const formatDate = date => new Date(date).toLocaleDateString('fr-FR');

async function sendReceiptEmails(receipt) {
  if (!transporter) return;
  const { user } = receipt;
  const html = `<div style="font-family:Arial"><h2>ViaItalia — Nouveau reçu</h2><p>Bonjour ${user.firstName} ${user.lastName},</p><p>Un nouveau reçu de <strong>${Number(receipt.amount).toFixed(2)} DT</strong> a été ajouté à votre compte.</p><p>Référence : ${receipt.receiptNumber}<br>Date : ${formatDate(receipt.paymentDate)}</p></div>`;
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  await Promise.all([
    transporter.sendMail({ from: process.env.EMAIL_USER, to: user.email, subject: `Nouveau reçu ${receipt.receiptNumber} — ViaItalia`, html }),
    adminEmail && transporter.sendMail({ from: process.env.EMAIL_USER, to: adminEmail, subject: `Reçu ${receipt.receiptNumber} enregistré`, html: `<p>Le reçu ${receipt.receiptNumber} de ${user.firstName} ${user.lastName} a été enregistré avec succès.</p>` })
  ]);
}

const createReceipt = async (req, res) => {
  try {
    const userId = Number(req.body.userId), amount = Number(req.body.amount);
    const paymentMethod = req.body.paymentMethod;
    const paymentDate = req.body.paymentDate ? new Date(req.body.paymentDate) : new Date();
    if (!Number.isInteger(userId) || !Number.isFinite(amount) || amount <= 0 || !['ESPECE', 'VIREMENT'].includes(paymentMethod) || Number.isNaN(paymentDate.getTime())) return res.status(400).json({ success:false, message:'Client, montant, méthode et date de paiement sont obligatoires.' });
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id:true, firstName:true, lastName:true, email:true } });
    if (!user) return res.status(404).json({ success:false, message:'Client introuvable.' });
    const receiptNumber = `RC-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;
    const receipt = await prisma.receipt.create({ data: { receiptNumber, amount, paymentMethod, paymentDate, userId }, include: includeUser });
    await prisma.notification.create({ data: { userId, content: `Un nouveau reçu ${receipt.receiptNumber} de ${amount.toFixed(2)} DT a été ajouté à votre compte.` } });
    sendReceiptEmails(receipt).catch(error => console.error('Receipt email error:', error.message));
    res.status(201).json({ success:true, data:receipt });
  } catch (error) { console.error(error); res.status(500).json({ success:false, message:'Erreur lors de la création du reçu.' }); }
};

const getReceipts = async (req, res) => {
  try {
    const { paymentMethod, from, to, search } = req.query;
    const where = {};
    if (paymentMethod && ['ESPECE','VIREMENT'].includes(paymentMethod)) where.paymentMethod = paymentMethod;
    if (from || to) where.paymentDate = { ...(from && { gte:new Date(`${from}T00:00:00`) }), ...(to && { lte:new Date(`${to}T23:59:59`) }) };
    if (search) where.user = { OR: [{ firstName:{ contains:search } }, { lastName:{ contains:search } }, { email:{ contains:search } }, { id:Number(search) || -1 }] };
    const receipts = await prisma.receipt.findMany({ where, include:includeUser, orderBy:{ paymentDate:'desc' } });
    const totalPaid = receipts.reduce((sum, item) => sum + Number(item.amount), 0);
    res.json({ success:true, data:receipts, stats:{ totalPaid, numberOfReceipts:receipts.length } });
  } catch (error) { console.error(error); res.status(500).json({ success:false, message:'Erreur lors du chargement des reçus.' }); }
};

const getReceiptStats = async (req,res) => {
  try { const aggregate = await prisma.receipt.aggregate({ _sum:{ amount:true }, _count:{ _all:true } }); res.json({ success:true, data:{ totalPaid:aggregate._sum.amount || 0, numberOfReceipts:aggregate._count._all } }); }
  catch(error) { res.status(500).json({ success:false, message:'Erreur statistiques reçus.' }); }
};
const getMyReceipts = async (req,res) => {
  try { const receipts = await prisma.receipt.findMany({ where:{ userId:req.user.userId }, orderBy:{ paymentDate:'desc' }, include:includeUser }); const totalPaid=receipts.reduce((s,r)=>s+Number(r.amount),0); res.json({success:true,data:receipts,stats:{totalPaid,numberOfReceipts:receipts.length}}); }
  catch(error) { res.status(500).json({success:false,message:'Erreur lors du chargement de vos reçus.'}); }
};
const getReceiptById = async (req,res) => {
  try { const receipt=await prisma.receipt.findUnique({where:{id:Number(req.params.id)},include:includeUser}); if(!receipt) return res.status(404).json({success:false,message:'Reçu introuvable.'}); if(req.user.role!=='ADMIN' && receipt.userId!==req.user.userId) return res.status(403).json({success:false,message:'Accès refusé.'}); res.json({success:true,data:receipt}); }
  catch(error) { res.status(500).json({success:false,message:'Erreur lors du chargement du reçu.'}); }
};
module.exports = { createReceipt, getReceipts, getReceiptStats, getMyReceipts, getReceiptById };
