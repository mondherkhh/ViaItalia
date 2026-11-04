ADMIN_INVENTAIRE.md — Inventaire exact (lecture seule, pas de modif admin)

SECTION 1 — FICHIERS (lignes réelles wc -l) :
AdminDashboard.jsx 3016 | AdminSidebar.jsx 110 | DashboardHome.jsx 230 | theme.css 108 | autres NON LUS.

SECTION 2 — SIDEBAR (AdminSidebar.jsx lignes réelles) :
- largeur 250px (l6) | responsive 768px (l10) | bouton #6B7B71 500 (l20)
- WORKSPACE: Dashboard/Students/Messages/Alerts/Utilisateurs (l51-55)
- FINANCE: Payments/Invoices (l58-59)
- CONTENT: University Programs/Avis clients (l62-63)
- INTERNAL: Calendar/Settings (l66-67)
- badge messagerie 3 rouge (l53), annonces 1 rouge (l54)
- visible condition isAgent/allowed (l43-49)
- Déconnexion FR (l106)

SECTION 3 — TOPBAR (AdminDashboard.jsx lignes lues) :
- message FR l574-575 (Bonjour...Via Italia)
- recherche état l501, appel authService.searchUsers l1346, debounce l1360
- ThemeToggle composant l254 ; Invoke student NON TROUVÉ (ABSENT lignes 500-1370)

SECTION 4 — DASHBOARD (DashboardHome.jsx l1-135 lus) :
- Hero dégradé #052E1A->#0B7A43 (l23-31), arrondi 24px
- Stats calcul : users/dossiers/payments.filter(PAID)/appointments (l85-89)
- Pipeline 7 noms exacts : Invited/Onboarded/Documents/Applications/Acceptance/Choice/Visa (l99-106)
- Pipeline calcul : filter(PENDING)/stage EN_COURS/VALIDATED (l99-105)
- StatCard style l35-38 (panel/border/20px)
- Forgotten (style vu var(--adm-chip-red-bg)) NON LU ligne exacte
- Work queue / pipeline visuel NON LU (l136+)

SECTION 5 — PAGES : NON LUES en détail (liste de fichiers existants uniquement).

SECTION 6 — API : searchUsers l1346 ; stats props locales (l85-89) ; middleware NON LU.

SECTION 7 — TOKENS : var(--adm-panel/border/text/muted/accent) confirmés indirectement ; valeurs exactes thème NON LUES (theme.css partiel).

SECTION 8 — COMPORTEMENTS : responsive 768px (l10) ; mode sombre ThemeToggle présent (l254) ; rafraîchissement NON LU admin ; skeleton/erreur NON LUS.

SECTION 9 — LIBELLÉS : FR (Bonjour, Demande de documents, Déconnexion, Utilisateurs, Avis clients) ; EN (Dashboard, Students, Messages, Alerts, Payments, Invoices, University Programs, Calendar, Settings).

NON LU : AdminSidebar styles actifs/survol détaillés au-delà l20; AdminDashboard au-delà l1370; DashboardHome au-delà l135; theme.css 11-108; tous contrôleurs; middleware exact; endpoints backend; work queue exact.
ABSENT : Invite student bouton (lignes 500-1370); règles forgotten jours exacts; valeurs --adm-* complètes; middleware requireStaff/requireSection lignes ouvertes.
FICHIERS LUS : AdminSidebar.jsx, AdminDashboard.jsx (partiel), DashboardHome.jsx (partiel), theme.css (partiel), docs/ (créé unique).
AUCUN TOKEN. AUCUN COMMIT ADMIN. LECTURE SEULE.

--- MISE À JOUR DEMANDE (points 1-9 complétés) ---

1. LARGEUR : AdminSidebar.jsx:l6=250px (composant rendu AdminSidebar importé AdminDashboard.jsx:l26) ; AdminDashboard.jsx:l84=202px (Sidebar styled du layout) ; largeur effective = 202px (layout admin) ; client déjà 202px → NON CORRIGÉ.
2. THEME.CSS : lu entier 108 lignes (cat -n) ; toutes variables --adm-* avec clair (l1-31) et sombre (l33-46, 89-108) transcrites dans fichier.
3. ADMIN SIDEBAR : états normaux/survol/actif lus lignes 19-26 complètes (Item styled).
4. INVITE STUDENT : AdminDashboard.jsx:l2972 onInvite, l481 showInvite, l2976 modal ; AdminSidebar.jsx : ABSENT (grep -i invite = 0) ; InviteStudentModal.jsx:l208 aria-label, l211 Title (EN).
5. DASHBOARDHOME.JSX : Forgotten (l92-95 >30 jours), Work queue (l91-206, filtres All/Claims/Documents/Fees/Decisions/Stalled, colonnes Student/Blocked/Waiting), Pipeline (l98-106 noms + calcul filtre), Collected/Expected (l132-133 + TND), Stats 4 cartes (l128-145).
6. ADMIN LIGNE 1370+ : endpoints /study-forms, /payments, /payments/stats, /payments/${id}/add-payment ; états try/catch/console.error ; pas d'interval auto lu au-delà.
7. PAGES : composant + endpoints identifiés (DossierList, MessagesPage, PaymentsPage, CalendarPage); colonnes/filtres NON LUS en détail (fichiers non ouverts complètement).
8. MIDDLEWARES : backend/middlewares/ ABSENT du cwd ; non ouverts.
9. NON LU / ABSENT : liste réaliste du fichier ; ABSENT uniquement après grep (Invite dans topbar = trouvé l2972 ; middleware = ABSENT car dossier non présent).
