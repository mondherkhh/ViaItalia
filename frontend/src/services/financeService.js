/**
 * Finance summary — source unique de vérité pour Dashboard + Payments.
 * Collected = somme montant des paiements PAID.
 * Outstanding = max(agreedFees - collected, 0)
 * Expected = montant encore dû (cohérent avec Outstanding)
 * Total income = collected (déduction dépenses désactivée par défaut)
 */
export const formatMoney = (n) => {
  const value = Number(n || 0);
  if (isNaN(value)) return '0 TND';
  return value.toLocaleString('en-US', { minimumFractionDigits: 0 }) + ' TND';
};

export const getFinanceSummary = (payments = [], agreedFees = 0) => {
  const collected = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const pendingPayments = payments.filter((p) => p.status === 'PENDING');
  const pendingAmount = pendingPayments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0),
    0
  );

  const fees = Number(agreedFees || 0);
  const outstanding = Math.max(fees - collected, 0);
  const expected = outstanding; // montant encore dû = cohérent avec outstanding
  const expenses = 0; // déduction dépenses désactivée
  const totalIncome = collected - expenses;

  return {
    collected,
    outstanding,
    expected,
    agreedFees: fees,
    expenses,
    totalIncome,
    pendingCount: pendingPayments.length,
    pendingAmount,
    paidCount: payments.filter((p) => p.status === 'PAID').length,
  };
};

export default { formatMoney, getFinanceSummary };
