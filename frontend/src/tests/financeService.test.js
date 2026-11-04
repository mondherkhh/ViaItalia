const { getFinanceSummary, formatMoney } = require('../../src/services/financeService').default || require('../../src/services/financeService');

describe('getFinanceSummary', () => {
  it('calcule collected = somme PAID, pas count', () => {
    const payments = [
      { status: 'PAID', amount: 900 },
      { status: 'PENDING', amount: 500 },
    ];
    const result = getFinanceSummary(payments, 1400);
    expect(result.collected).toBe(900);
    expect(result.pendingAmount).toBe(500);
    expect(result.outstanding).toBe(500); // 1400 - 900 = 500
  });

  it('aucun paiement => 0', () => {
    const result = getFinanceSummary([]);
    expect(result.collected).toBe(0);
    expect(result.outstanding).toBe(0);
  });

  it('plusieurs étudiants, plusieurs PAID', () => {
    const payments = [
      { status: 'PAID', amount: 300 },
      { status: 'PAID', amount: 600 },
    ];
    expect(getFinanceSummary(payments, 1200).collected).toBe(900);
  });

  it('formatMoney affiche "900 TND" sans erreur', () => {
    expect(formatMoney(900)).toBe('900 TND');
    expect(formatMoney(0)).toBe('0 TND');
  });
});
