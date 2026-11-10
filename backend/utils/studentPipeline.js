function computePipelineStage(dossier) {
  if (!dossier) return 'Invited';
  if (dossier.status === 'VALIDATED') return 'Choice locked';
  if (dossier.status === 'PENDING') return 'Invited';
  return dossier.stage || 'Onboarded';
}
function computeDocuments(dossier, docCount) {
  const validated = docCount || 0;
  const missing = dossier ? Math.max(0, 5 - validated) : 5;
  return { validated, missing };
}
function computeRemainingDue(payments) {
  const items = Array.isArray(payments) ? payments : [];
  const totalDue = items.reduce((s, p) => s + Number(p.prixTotal || p.amount || 0), 0);
  const totalPaid = items.reduce((s, p) => s + Number(p.prixPaye || 0), 0);
  return Math.max(0, totalDue - totalPaid);
}
function computeUnreadMessages(messages) {
  return (messages || []).filter(m => m && m.sender === 'ADMIN' && !m.readAt).length;
}
module.exports = { computePipelineStage, computeDocuments, computeRemainingDue, computeUnreadMessages };
