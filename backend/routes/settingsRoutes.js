const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/roleMiddleware').requireAdmin;
const { requireSection } = require('../middlewares/requireRole');
const prisma = require('../config/prisma');

// DEFAULTS — central truth for every setting that can be stored in agencysetting
const DEFAULTS = {
  restrictPaymentAccess: true,            // boolean
  deductExpenses: false,                   // boolean
  studentsEditProfile: true,              // boolean
  studentsClaimCash: true,                 // boolean
  studentsEmailNotifications: true,        // boolean
  studentUploadScope: 'any',               // 'any' | 'tasked'
  visaStartsAtChoiceLock: true,            // boolean
  forgottenAfterDays: 21,                   // 7 | 14 | 21 | 30 (number)
  unreadAlertAfterDays: 7,                 // 3 | 7 | 14 | 30 (number)
  folderCompleteClosesTasks: true,          // boolean
  extraDefaultFolders: '',                 // comma-separated names, max ~40 chars each, max 10, no duplicates, not one of the defaults
};

const FOLDER_KEYS = new Set(['STANDARD', 'SERVICE', 'STUDENTS', 'ADDITIONAL']);
const NUMERIC_KEYS = new Set([
  'forgottenAfterDays',
  'unreadAlertAfterDays',
]);
const BOOLEAN_KEYS = new Set([
  'restrictPaymentAccess',
  'deductExpenses',
  'studentsEditProfile',
  'studentsClaimCash',
  'studentsEmailNotifications',
  'visaStartsAtChoiceLock',
  'folderCompleteClosesTasks',
]);

async function getSetting(key) {
  if (!(key in DEFAULTS)) {
    throw new Error(`Unknown setting key: ${key}`);
  }
  const row = await prisma.agencySetting.findUnique({ where: { settingKey: key } });
  return row ? row.settingValue : null;
}

async function setSetting(key, value) {
  if (!(key in DEFAULTS)) {
    throw new Error(`Unknown setting key: ${key}`);
  }
  const cast = getSettingValue(key, value);
  await prisma.agencySetting.upsert({
    where: { settingKey: key },
    create: { settingKey: key, settingValue: String(cast) },
    update: { settingValue: String(cast) },
  });
  return cast;
}

function getSettingValue(key, value) {
  // Tolerant type checks — accept strings for booleans and numbers to avoid rejecting stored values
  if (NUMERIC_KEYS.has(key)) {
    let n;
    if (typeof value === 'number') n = value;
    else if (typeof value === 'string') {
      const t = value.trim().toLowerCase();
      if (t === 'true') n = 1;
      else if (t === 'false') n = 0;
      else n = Number(t);
    } else if (typeof value === 'boolean') n = value ? 1 : 0;
    else throw new Error(`Setting "${key}" must be a number`);
    if (!Number.isInteger(n) || n < 0) throw new Error(`Setting "${key}" must be a non-negative integer`);
    if (![7, 14, 21, 30].includes(n)) throw new Error(`Setting "${key}" must be one of: 7, 14, 21, 30`);
    return n;
  }
  if (BOOLEAN_KEYS.has(key)) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const t = value.trim().toLowerCase();
      if (t === 'true') return true;
      if (t === 'false') return false;
    }
    throw new Error(`Setting "${key}" must be a boolean (true or false)`);
  }
  if (key === 'studentUploadScope') {
    if (value !== 'any' && value !== 'tasked') throw new Error(`Setting "${key}" must be "any" or "tasked"`);
    return value;
  }
  if (key === 'extraDefaultFolders') {
    const parts = String(value || '')
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);
    if (parts.some(p => !p.length)) throw new Error(`Setting "${key}" contains empty folder name(s)`);
    if (parts.length > 10) throw new Error(`Setting "${key}" has more than 10 folders`);
    const lower = new Set(parts.map(p => p.toLowerCase()));
    if (Array.from(lower).some(x => FOLDER_KEYS.has(x))) {
      throw new Error(`Setting "${key}" contains one of the default folder names`);
    }
    const maxLen = 40;
    if (parts.some(p => p.length > maxLen)) throw new Error(`Setting "${key}" exceeds ${maxLen} characters per folder`);
    return parts.join(', ');
  }
  throw new Error(`Setting type for "${key}" is not recognized`);
}

async function getSettings() {
  const rows = await prisma.agencySetting.findMany();
  const out = {};
  for (const key of Object.keys(DEFAULTS)) {
    out[key] = await getSetting(key);
  }
  return out;
}

async function patchSettings(body) {
  const incoming = body || {};
  const merged = {};
  for (const key of Object.keys(DEFAULTS)) {
    if (incoming[key] !== undefined) merged[key] = incoming[key];
    else {
      const stored = await getSetting(key);
      merged[key] = stored === null ? DEFAULTS[key] : stored;
    }
  }
  for (const [key, val] of Object.entries(merged)) {
    try {
      merged[key] = await setSetting(key, val);
    } catch (e) {
      // Return the error inline so the caller can show it without losing other fields
      throw new Error(`Setting "${key}": ${e.message}`);
    }
  }
  return merged;
}

router.get('/', authMiddleware, requireAdmin, requireSection('settings'), async (req, res) => {
  try {
    const settings = await prisma.agencySetting.findMany({ orderBy: { settingKey: 'asc' } });
    const data = {};
    settings.forEach(s => { if (s.settingKey && s.settingValue !== null) data[s.settingKey] = s.settingValue; });
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
router.patch('/', authMiddleware, requireAdmin, requireSection('settings'), async (req, res) => {
  try {
    const { key, value } = req.body || {};
    if (!key) return res.status(400).json({ success: false, message: 'key required' });
    await prisma.agencySetting.upsert({ where: { settingKey: String(key) }, update: { settingValue: value === null ? null : String(value) }, create: { settingKey: String(key), settingValue: value === null ? null : String(value) } });
    res.json({ success: true, data: { [key]: value } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
router.get('/export-students.csv', authMiddleware, requireAdmin, requireSection('settings'), async (req, res) => {
  try {
    const data = await getSettings();
    return res.json({ success: true, data });
  } catch (e) {
    console.error('GET /api/settings:', e.message);
    return res.status(500).json({ success: false, message: e.message });
  }
});

router.patch('/', authMiddleware, requireAdmin, requireSection('settings'), async (req, res) => {
  try {
    const data = await patchSettings(req.body);
    return res.json({ success: true, data });
  } catch (e) {
    console.error('PATCH /api/settings:', e.message);
    const msg = e && e.message ? e.message : String(e);
    return res.status(400).json({ success: false, message: msg });
  }
});

router.get('/export-students.csv', authMiddleware, requireAdmin, requireSection('settings'), async (req, res) => {
  try {
    const rows = await prisma.user.findMany({
      where: { role: 'USER' },
      select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true, isApproved: true, createdAt: true },
    });
    const stageByDossier = new Map();
    // Dossiers with status VALIDATED carry a stage the client can read. We can't query dossiers from here cheaply in this select, so do a separate lightweight pass only when needed.
    try {
      const ds = await prisma.dossier.findMany({ where: { userId: { in: rows.map(r => r.id) } }, select: { id: true, userId: true, status: true } });
      for (const d of ds) {
        stageByDossier.set(d.userId, stageByDossier.get(d.userId) || '');
        if (d.status === 'VALIDATED') stageByDossier.set(d.userId, d.status);
      }
    } catch (e) { console.error('export-students.csv dossier lookup:', e.message); }

    const header = ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'isApproved', 'createdAt', 'stage'];
    const lines = [header.join(',')];
    for (const u of rows) {
      const stageCol = csvEscape(stageByDossier.get(u.id) || '');
      const fields = [
        csvEscape(u.id),
        csvEscape(u.firstName),
        csvEscape(u.lastName),
        csvEscape(u.email),
        csvEscape(u.phoneNumber),
        csvEscape(String(u.isApproved)),
        csvEscape(u.createdAt ? u.createdAt.toISOString() : ''),
        stageCol,
      ];
      lines.push(fields.join(','));
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disribution', 'attachment; filename="students.csv"');
    res.send('﻿' + lines.join('\r\n'));
  } catch (e) {
    console.error('GET /api/settings/export-students.csv:', e.message);
    return res.status(500).json({ success: false, message: e.message });
  }
});

function csvEscape(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

module.exports = router;
