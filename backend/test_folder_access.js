const fs = require('fs');
const path = require('path');

// Node 24+ fetch / FormData / Blob available globally
async function test() {
  const token = '9o3_FUJbGsc91z0I_uoUJnQnmzvMAnxStRApO9vF4ew'; // student 7
  const base = 'http://localhost:5001';

  // Build a real file
  const fileContent = Buffer.from('test-upload-content-2026');
  const blob = new Blob([fileContent], { type: 'application/pdf' });
  const form = new FormData();
  form.append('file', blob, 'test.pdf');
  form.append('category', 'Personal');

  const res = await fetch(`${base}/api/student/documents/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });
  console.log('Upload Personal locked ->', res.status, await res.text());

  // Empty/invalid category -> should fall back to Personal and still 403
  const form2 = new FormData();
  form2.append('file', blob, 'test.pdf');
  form2.append('category', 'UnknownFolder');
  const res2 = await fetch(`${base}/api/student/documents/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form2
  });
  console.log('Upload unknown category ->', res2.status, await res2.text());

  // Admin route with student token -> 403
  const res3 = await fetch(`${base}/api/admin/students/7/folder-access/Personal`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ allowed: true })
  });
  console.log('Student token on admin route ->', res3.status, await res3.text());
}

test().catch(e => console.error('Script error:', e));
