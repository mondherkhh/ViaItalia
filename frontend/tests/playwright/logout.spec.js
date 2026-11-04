const { test, expect } = require('@playwright/test');

test.describe('Logout', () => {
  test('deconnexion supprime token et redirige vers /login', async ({ page }) => {
    // Log all requests and responses
    const requests = [];
    const responses = [];
    page.on('request', r => requests.push({ url: r.url(), method: r.method(), postData: r.postData() || null }));
    page.on('response', r => responses.push({ url: r.url(), status: r.status(), fromCache: r.fromCache() }));

    const consoleLogs = [];
    page.on('console', msg => consoleLogs.push({ type: msg.type(), text: msg.text(), location: msg.location() }));

    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'test@student.viatalia.local');
    await page.fill('input[name="password"]', 'Test1234');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/user-dashboard');

    // Click avatar
    await page.waitForSelector('[data-testid="user-avatar"], .user-avatar, div[style*="cursor: pointer"]', { timeout: 5000 });
    await page.click('[data-testid="user-avatar"], .user-avatar, div[style*="cursor: pointer"]');

    await page.waitForSelector('text=Déconnexion', { timeout: 5000 });
    await page.click('text=Déconnexion');

    await page.waitForTimeout(3000);

    const finalUrl = page.url();
    const cookies = await page.context().cookies();
    const lsToken = await page.evaluate(() => localStorage.getItem('token'));
    const lsRole = await page.evaluate(() => localStorage.getItem('role'));
    const lsUser = await page.evaluate(() => localStorage.getItem('user'));
    const ss = await page.evaluate(() => sessionStorage.length);

    console.log('=== PLAYWRIGHT TEST OUTPUT ===');
    console.log('Requests:', JSON.stringify(requests, null, 2));
    console.log('Responses:', JSON.stringify(responses, null, 2));
    console.log('Console logs:', JSON.stringify(consoleLogs, null, 2));
    console.log('Final URL:', finalUrl);
    console.log('Cookies:', JSON.stringify(cookies, null, 2));
    console.log('localStorage token:', lsToken);
    console.log('localStorage role:', lsRole);
    console.log('localStorage user:', lsUser);
    console.log('sessionStorage length:', ss);
  });
});
