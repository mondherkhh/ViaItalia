const sections = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'students', label: 'Students' },
  { id: 'messages', label: 'Messages' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'users', label: 'Utilisateurs' },
  { id: 'payments', label: 'Payments' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'programs', label: 'University Programs' },
  { id: 'reviews', label: 'Avis clients' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'settings', label: 'Settings' }
];

const sectionIds = sections.map(s => s.id);

// Map a sidebar menu id to the section id used by requireSection().
// Agents are granted access per-section; "settings" is owner-only and is
// deliberately absent so no agent can ever be granted it.
const sidebarToSection = {
  dashboard: 'dashboard',
  dossiers: 'students',
  messagerie: 'messages',
  anonces: 'alerts',
  users: 'students',
  payments: 'payments',
  receipts: 'invoices',
  universityPrograms: 'programs',
  'university-programs': 'programs',
  reviews: 'reviews',
  calendar: 'calendar',
  settings: 'settings'
};

function sectionForSidebar(id) {
  return sidebarToSection[id] || id;
}

module.exports = { sections, sectionIds, sidebarToSection, sectionForSidebar };
