function computeRemainingDue(payments) {
  const items = Array.isArray(payments) ? payments : [];
  const totalDue = items.reduce((s, p) => s + Number(p.prixTotal || p.amount || 0), 0);
  const totalPaid = items.reduce((s, p) => s + Number(p.prixPaye || 0), 0);
  return Math.max(0, totalDue - totalPaid);
}

function runTest(name, payments, expected) {
  const result = computeRemainingDue(payments);
  const pass = result === expected;
  console.log(name);
  console.log('  payments:', JSON.stringify(payments));
  console.log('  expected:', expected, '| result:', result, '| PASS:', pass ? 'OUI' : 'NON');
  return pass ? 1 : 0;
}

let ok = 0;
ok += runTest('Test 1 : totalDue 500 PAID 100, PENDING 50 => 400',
  [{ prixTotal: 450, prixPaye: 100, status: 'PAID' }, { prixTotal: 50, prixPaye: 0, status: 'PENDING' }], 400);
ok += runTest('Test 2 : totalDue 100, PAID 150 => 0',
  [{ prixTotal: 100, prixPaye: 150, status: 'PAID' }], 0);
ok += runTest('Test 3 : aucun paiement => 0',
  [], 0);
ok += runTest('Test 4 : PENDING seul (prixPaye=0) => totalDue non réduit (200)',
  [{ prixTotal: 200, prixPaye: 0, status: 'PENDING' }], 200);

console.log('\n=== Résultat :', ok, '/ 4 PASS ===');
console.log('Ligne filtrant PAID : totalPaid = items.reduce((s, p) => s + Number(p.prixPaye || 0), 0);');