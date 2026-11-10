// Agent section validation: only official section keys from backend/config/sections.js
// Reserved/owner-only keys (rejected): 'settings'
// Old DB alias keys allowed during migration: 'users' (maps to students via sidebarToSection), 'dossiers' (alias for students)
const { sectionIds, sidebarToSection } = require('../config/sections');

const RESERVED = ['settings'];
const ALLOWED = sectionIds.filter(s => s !== 'settings');

function isValidAgentSections(sections) {
  if (!Array.isArray(sections) || sections.length === 0) return false;
  return sections.every(s => ALLOWED.includes(s) || ['dossiers', 'users'].includes(s));
}

function resolveAlias(s) {
  if (s === 'users' || s === 'dossiers') return 'students';
  return s;
}

function sanitizeAgentSections(sections) {
  if (!Array.isArray(sections)) return ['dashboard', 'students', 'messages', 'alerts'];
  return sections
    .map(s => resolveAlias(s))
    .filter(s => ALLOWED.includes(s) || s === 'students')
    .filter((v, i, a) => a.indexOf(v) === i);
}

module.exports = { isValidAgentSections, sanitizeAgentSections, RESERVED, ALLOWED };
