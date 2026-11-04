# Analyse complète — Dashboard Admin Viatalia

> Générée 2026-10-19. Contexte : session précédente (fix Prisma DB `viaitalia`, alignement `schema.prisma`, sauvegarde `schema.prisma.pre-columnfix-2026-10-19`), puis demande "faire une analyse de dashbord admin complet". Analyse basée sur les fichiers sources `frontend/src/pages/AdminDashboard.jsx` (~2988 lignes), `admin/*.jsx`, `Admin.styles.js`, et le backend `routes/` / `controllers/` / `prisma/schema.prisma` aligné.

---

## 1. Architecture générale du dashboard

**Entrée unique** : `AdminDashboard.jsx` (fichier monolithique ~3000 lignes). Ce n'est pas un dashboard modulé — tout le routage interne, l'état local, le rendu des 11 sections, les formulaires, les modaux, les animations GSAP et les appels API sont dans un seul composant.

**Layout codé en Styled Components (dans le même fichier)** :
- `DashboardContainer` — fond thème (`body.theme-light` / `body.theme-dark`)
- `Sidebar` — largeur fixe ~202px, caché `<768px` (bouton hamburger)
- `Header` — titre dynamique (`activeMenu`), bouton thème (soleil/lune), dropdown utilisateur (avatar = première lettre de nom/email, nom, lien déconnexion)
- `MainContent` — flex column, `ContentArea` = zone scrollable
- `BottomNav` — visible seulement mobile (`<768px`)

**Navigation interne (pas de React Router sous-routes)** : le dashboard utilise un `switch` sur `activeMenu` dans `renderContent()`. La constante `menuItems` définit 11 items : `messagerie`, `annonces`, `users`, `appointments`, `contracts`, `dossiers`, `studyForms`, `payments`, `receipts`, `university-programs`, `reviews`. Modifier un `id` sans mettre à jour le `switch` casse la section.

**État local massif** : `useState` pour chaque liste (`users`, `messages`, `announcements`, `appointments`, `contracts`, `dossiers`, `payments`, `receipts`, `studyForms`, `reviews`), chaque formulaire (`newAnnouncement`, `showCreateUserForm`, etc.), chaque modale (`showCreateXForm`), chaque filtre (`search`, `filterStatus`), chaque pagination (`page`, `total`).

---

## 2. Authentification & autorisation

**Stockage token** : `localStorage` clé `"token"` (JWT). `AuthContext` (`src/context/AuthContext.js`) fournit `{ token, role, user, loading }`.

**Route /admin-dashboard dans `App.js`** :
- Accessible si `token && role === "ADMIN"`
- Sinon redirection vers `/login`

**Protection côté serveur** : `authMiddleware.js` attend `Authorization: Bearer <token>` ; `roleMiddleware.js` fournit `requireAdmin`. Les routes backend (`routes/*.js`) utilisent `authMiddleware, requireAdmin` en chaîne.

**Protection côté client (double, non suffisante seule)** : dans `AdminDashboard.jsx`, certaines actions (ex. création d'utilisateur, suppression) ont des `if (user.role !== 'ADMIN') return alert(...)`. C'est redondant avec le backend mais pas une protection réelle.

**Observations de sécurité critiques** :
- Token JWT dans `localStorage` — vulnérable XSS (aucun cookie `httpOnly` visible)
- `window.confirm` et `alert` dispersés (blocants, mauvaise UX)
- Déconnexion : suppression du token/role depuis `localStorage`
- None des données sensibles ne sont masquées dans le frontend (le backend renvoie tout au rôle ADMIN)

---

## 3. Flux de données (load / mutation)

**Chargement initial** (`useEffect([])` dans `AdminDashboard.jsx`) lance en parallèle :
```
fetchUsers(), fetchAllUsers(), fetchMessages(), fetchContracts(),
fetchAnnouncements(), fetchAppointments(), fetchTimeSlots(),
fetchStudyForms(), fetchPayments(), fetchPaymentStats(),
fetchDossiers(), fetchDossierStats()
```
Chaque `fetchX` appelle `src/api/xService.js`, traite `{ success: boolean, data: ... }` (parfois double enveloppe `{ data: { success, data } }`), met à jour l'état, logue l'erreur, remet à vide.

**Mutations (création / mise à jour / suppression)** :
- Validation basique (`if (!value) return alert(...)`)
- Appel service async (`try/catch`)
- Réinitialisation formulaire (`setForm({...})`)
- Re-fetch de la liste entière (`load()`) — pas de mise à jour optimiste
- Toast notification manuelle (création dynamique `div` fixe haut-droite, animation GSAP d'entrée/sortie, `setTimeout` suppression)
- `window.confirm` pour suppressions

**Gestion d'erreurs** : principalement `console.error`. Quelques `alert()`. Aucune centralisation (pas de `ToastProvider` / `useToast`).

---

## 4. Sections principales analysées

### 4.1 Messagerie (`messagerie`)
- État : `users` (liste étudiants), `selectedUser`, `messages`, `newMessage`, `isSendingMessage`, `showTemplates`
- Mange ses propres requêtes via `messageService`
- Possède un sous-état indépendant du reste du dashboard
- Utilise `users` filtrés par `role === 'USER'` triés par nom

### 4.2 Annonces (`annonces`)
- Création/modification/suppression d'annonces (`announcementService`)
- Modale `showCreateAnnouncementForm`
- Filtres par type (`INFO`, `SUCCESS`, `WARNING`, `URGENT`)
- `isActive` (booléen)

### 4.3 Utilisateurs (`users`)
- Liste complète, création (`showCreateUserForm`), suppression avec `window.confirm`
- Filter par recherche texte, tri
- Pas de pagination avancée (affichage tout ou limite fixe)

### 4.4 Rendez-vous (`appointments`)
- Création avec option `slotId` (référence au `TimeSlot`)
- `type`, `date`, `status`, `etat` (`PRESENTIEL` / `EN_LIGNE`)
- `getAvailableSlots()` — utilisez `TimeSlot` (base DB corrigée : `startTime`, `endTime`, `maxBookings`, `currentBookings`, `isAvailable` — ancien schéma manquait ces champs)
- Controller `appointmentController.js` traite `slotId`, met à jour `currentBookings` / `isAvailable`

### 4.5 Contrats (`contracts`)
- `filePath`, `status` (`PENDING` / `UPLOADED` / `CONFIRMED` / `REJECTED`)
- Upload de fichier (probablement `multer` côté backend)

### 4.6 Dossiers (`dossiers`)
- `title`, `status` (`PENDING` / `VALIDATED` / `REJECTED`), `stage` (`EN_COURS` / `VALIDE`)
- Mais le DB `dossier` n'a pas de `stage` ni `updatedAt` — corrigé dans le schéma recent (remis `updatedAt` mais sans `stage` ; `agreedFee` ajouté)
- Sous-sections : `AdminDossierCase.jsx` / `DossierList.jsx` / `DossierDetail.jsx`
- Relation `document` (table DB existante, modèle Prisma ajouter dans l'édition précédente)

### 4.7 Études / StudyForm (`studyForms`)
- `firstName`, `lastName`, `email`, `country`, `program`, `status`
- Note : table DB `studyform` n'existe pas dans `viaitalia` (vérifié par `SELECT table_name FROM information_schema.tables`) — le modèle `StudyForm` reste dans le schéma mais n'a pas de table DB. Peut causer des erreurs si la route est appelée sans que la table existe.

### 4.8 Paiements (`payments`)
- `amount`, `status`, `userId`
- DB a `prixTotal`, `prixPaye`, `prixReste`, `method`, `loggedBy`, `paidAt` — corrigé dans le schéma
- `paymentAdminService` / `AdminPaymentsPage.jsx` — gestion des paiements par étudiant
- Aggregate stats (`getPaymentStats`) — `count`, `_sum` sur `amount` (ancien controller utilisait `_sum: { amount: true }` sans filtre `prixTotal`/`prixPaye` — corrigé dans la révision précédente pour utiliser `prixTotal` / `prixPaye` / `prixReste` selon la logique métier)

### 4.9 Reçus (`receipts`)
- `numero`, `date`, `amount`, `paymentMethod`
- Corrigé : DB utilise `receiptNumber`, `paymentDate` — schéma aligné
- `AdminReceipts.jsx`

### 4.10 Programmes universitaires (`university-programs`)
- `UniversityProgram.jsx` (~467 lignes)
- `universityProgram` table DB existe (`university`, `programName`, `city`, `level`, `language`, `field`, `openingDate`, `closingDate`, `applicationFee`, `tuition`, `sourceName`, `sourceUrl`, `lastVerifiedAt`, `createdAt`, `updatedAt`)
- Modèle `UniversityProgram` présent dans le schéma (pas modifié récemment — était déjà là)
- Synchronisation via `admissionsSyncRoutes` / `universityProgram` service

### 4.11 Avis (`reviews`)
- `rating` (1-5), `comment`/`content`, `status`, `reviewedAt`
- `AdminReviews.jsx` — modération (`APPROVED` / `REJECTED`), `adminNote`
- DB a `content` (pas `comment`) et `adminNote` — corrigé dans le schéma

### 4.12 Calendrier (`calendar` / `CalendarPage.jsx`)
- `CalendarEvent` model (DB `calendarevent`) — `title`, `notes`, `kind`, `allDay`, `startsAt`/`endsAt`, `location`, `studentId`, `ownerId`, `remindMinutes`, `repeatRule`, `done`, `createdAt`/`updatedAt`
- Utilisé par `calendarRoutes.js`

---

## 5. Design / UI / Thème

**Système de tokens** : `src/styles/theme.css` définit `--adm-*` variables (couleurs, espacements, ombres). Les composants utilisent `styled-components` avec sélecteurs `body.theme-light & { ... }` et `body.theme-dark & { ... }`. Certains composants ont des valeurs dures (`#061321`, `#071523`, `rgba(255,255,255,0.05)`) au lieu des tokens — risque de rupture si le thème change.

**Animations** : GSAP 3.14.2 enregistré globalement (`gsap.registerPlugin()`). Utilisé pour : apparition des cartes (`opacity` + `translateY`), résultats de recherche (stagger), toast notifications, effets de bouton (scale). Suppression de l'import GSAP casse les animations.

**Responsive** :
- Sidebar cachée `<768px` ; bouton hamburger ouvre/ferme
- `BottomNav` visible `<768px`
- Grilles `StatsGrid` : 5 colonnes → 3 (`1024px`) → 1 (`640px`)
- Breakpoints en px (768, 1024) — modification sans test mobile/tablette risque de casser

**i18n (incomplet)** : `LanguageContext` (`src/contexts/LanguageContext.js`) bascule `data-language` sur `<html>`. Fichiers `translations/en.js` / `fr.js` existent. `AdminDashboard.jsx` utilise presque exclusivement des chaînes en dur en français (`"Receipts"` dans le titre est exception — le reste est français dur). `Header.jsx` / `Sidebar.jsx` utilisent `useLanguage()` et construisent `t()` interne, mais le dashboard principal ne l'exploite pas.

---

## 6. Services API analysés

Le dashboard dépend de nombreux services dans `frontend/src/api/` (un fichier par entité) : `messageService`, `announcementService`, `userService`, `contractService`, `appointmentService`, `studyFormService`, `paymentAdminService`, `receiptService`, `reviewService`, `dossierService`, `universityProgramsService`, `calendarService`, etc.

**Contrats d'API** : le backend retourne généralement `{ success: boolean, data: ... }`. Certains services frontend attendent `{ data: { success, data } }` (double enveloppe), d'autres `{ data: ... }`. Cette incohérence est une source fréquente de bugs (ex. `summary?.collected ?? 0` dans `PaymentsPage.jsx` — le `?? 0` a été ajouté car `summary` pouvait être `undefined` si la réponse API était mal structurée).

**Interception Axios** : `src/api/axios.js` (ou similaire) injecte le token JWT depuis `localStorage` dans le header `Authorization`. Si le token est expiré ou manquant, la requête échoue avec 401.

---

## 7. Composants réutilisés vs inline

- **Composants design-system** (`src/components/design-system/`) : `Button`, `IconCircle`, `StatCard` — peu utilisés dans le dashboard admin (le dashboard a ses propres styles inline)
- **Composants card** : `ContentCard`, `UserList`, `UserItem` — utilisés dans certaines sections
- **Modaux / formulaires** : presque tout est inline dans `AdminDashboard.jsx` (état booléen `showCreateXForm`, rendu conditionnel directement dans le JSX du fichier principal)
- **Tables** : `TableRow`, `Th`, `Td` (styled-components) — définis dans le fichier
- **Pagination** : simple (`Prev` / `Next`, numéros de page) — pas de pagination côté backend avancée pour certaines listes (ex. `users`, `messages`)

---

## 8. Problèmes / défauts observés

### 8.1 Fichier monolithique (risque majeur)
`AdminDashboard.jsx` (~3000 lignes) contient : layout, navigation, 11 sections avec leurs états, formulaires, validations, animations, toasts. Toute modification risque d'introduire des régressions difficiles à tracer. Recommandation : extraire chaque section dans `admin/` (déjà partiellement fait — `DashboardHome.jsx`, `MessagesPage.jsx`, etc., mais le fichier principal reste géant).

### 8.2 Incohérences DB / Schema (corrigées dans la session précédente, mais parfois encore visibles dans le code)
- `Appointment.time` et `updatedAt` — supprimés du schéma (DB n'a pas ces colonnes) ; `type` et `slotId` ajoutés
- `Dossier.stage` / `updatedAt` — absents du DB ; `agreedFee` ajouté
- `Review.comment` → `content` ; `reviewedAt` ajouté (DB a la colonne)
- `Payment.amount` seul → `prixTotal`, `prixPaye`, `prixReste`, `method`, `loggedBy`, `paidAt`
- `Receipt.numero` / `date` → `receiptNumber` / `paymentDate`
- `Message.readAt` (nullable) ; `fileName/filePath/fileSize/fileType`
- `TimeSlot.userId` supprimé (DB n'a pas) ; `startTime/endTime/maxBookings/currentBookings/isAvailable/updatedAt` ajoutés
- `Document` model ajouté (DB `document` existe avec `id/dossierId/filePath/fileName/category/name/size/mimeType/uploaderId/uploaderRole/status/isTranslation/createdAt/updatedAt`)
- `UserAnnouncement.isRead` ajouté ; `announcementId` (int, NOT NULL) — DB `userannouncement` a `id/userId/announcementId/isRead/createdAt` (pas `title`/`content`). **Le schéma actuel doit être corrigé : remplacer `title`/`content` par `announcementId Int` + `isRead Boolean`**
- `Notification.content` (varchar, NOT NULL) + `isRead` (tinyint, NOT NULL DEFAULT 0) — DB a ces colonnes ; le schéma actuel a `type`/`read`. **Corriger : remplacer `type`/`read` par `content`/`isRead`**
- `UniversityInfo` : DB a `updatedAt` (NOT NULL), `status` (enum NOT NULL DEFAULT 'APPLIED'), `offerDocumentId` (int NULL DEFAULT NULL), `isFinalChoice` (tinyint NOT NULL DEFAULT 0). Schéma OK sur la plupart mais `offerDocumentId` est `String` au lieu de `Int` — corriger
- `studyform` table absente du DB → risque si `/study-forms` est appelé

### 8.3 Modèle `contactMessage`
Le backend utilise `prisma.contactMessage` dans certains contrôleurs/routes (vu dans la liste des `prisma.*` appels), mais la table DB `contactmessage` (ou `contact_message`) n'existe pas dans `viaitalia` (liste des tables : `admissionwindow...userannouncement` — pas de `contactmessage`). Cela causera `P2021` / table not found si le code est exécuté.

### 8.4 Compilations / erreurs frontend
- `PaymentsPage.jsx` : `toLocaleString` sur `summary?.collected` pouvait échouer si `summary` était `undefined` — corrigé avec `(summary?.collected ?? 0)`
- `AdminDashboard.jsx` : import `gsap` et `gsap.registerPlugin()` — suppression de l'import casse tout le dashboard
- Styles en dur dans `AdminDashboard.jsx` : valeurs hexadécimales au lieu des `--adm-*` tokens

---

## 9. Sécurité & accessibilité

- **JWT localStorage** : risque XSS (pas de `httpOnly`/`secure` cookie)
- **Rôle vérifié côté client mais pas suffisamment** : `if (user.role !== 'ADMIN') return alert(...)` est facilement contournable (modification du JS côté navigateur)
- **Confirmations bloquantes** : `window.confirm` — pas accessible aux lecteurs d'écran (manque `role="dialog"`, focus trap)
- **Pas d'attributs ARIA** sur la sidebar, les boutons de menu (`⋯`), les modales — accessibilité faible
- **Thème** : bascule via `document.body.className` — fonctionne mais pas persisté (pas localStorage pour le thème)

---

## 10. Performance

- **Chargement initial** : 12 requêtes API en parallèle au montage (`useEffect([])`) — lourd si les données sont volumineuses (ex. `users` avec milliers d'étudiants)
- **Pas de pagination côté backend** pour certaines listes (ex. `getAllUsers`, `getAllMessages`) — tout est chargé en mémoire
- **Pas de debounce** sur certains filtres (le `search` peut déclencher une requête par touche si pas de `setTimeout` — mais le code semble avoir un `useEffect` avec `setTimeout` sur `q` dans `PaymentsPage.jsx`)
- **Re-fetch complet après mutation** : au lieu de mettre à jour localement l'élément, la liste entière est rechargée — inefficace pour les grandes listes

---

## 11. Internationalisation

- `translations/en.js` et `fr.js` existent avec des objets imbriqués (`translations.en.navbar.home`)
- `Header.jsx` / `Sidebar.jsx` utilisent `useLanguage()` et construisent `t()` interne
- `AdminDashboard.jsx` : presque tout est en français dur (`"Tableau de Bord Administrateur"`, `"Receipts"` est une exception pour le titre de section `receipts`)
- **Aucune fonction `t()` globale** dans le dashboard — remplaçable par `react-i18next` ou un `useTranslation()` personnalisé
- `data-language` sur `<html>` est mis à jour par `LanguageContext` — bon pour le CSS `lang` mais peu exploité

---

## 12. Recommandations (priorisées)

### Immédiat (sans risque)
1. **Corriger `contactMessage`** : soit ajouter le modèle `ContactMessage` au schéma + créer la table DB, soit supprimer les références dans le backend s'ils ne sont plus nécessaires
2. **Vérifier `studyform`** : créer la table DB ou supprimer la route si non utilisée
3. **Corriger `offerDocumentId`** : DB `int` vs schéma `String` — aligner selon la logique métier (probablement `Int` si c'est une FK vers `document`)
4. **Valider `UserAnnouncement.announcementId`** : la DB semble avoir `announcementId` (pas listé dans l'extraction ? Vérifier avec `DESCRIBE userannouncement`)

### Court terme (refactor)
5. **Extraire `AdminDashboard.jsx`** : diviser en `admin/layout/` (Sidebar, Header, MainContent) + `admin/sections/` (MessagingSection, AnnouncementsSection, etc.) — réduira le risque de régression
6. **Ajouter `ToastProvider` / `useToast`** : remplacer les `div` manuels et les `console.error`
7. **Adopter `react-hook-form` + `yup`** (ou `zod`) pour la validation des formulaires au lieu des `if (!value)`
8. **Centraliser le `useApi`** : un hook qui gère `loading`, `error`, `data`, `refetch` pour réduire la duplication

### Moyen terme
9. **Migration TypeScript** : `tsconfig.json` existe mais aucun `.ts` — migrer `AdminDashboard.jsx` et les services
10. **État global léger** : `Zustand` ou `Jotai` pour partager `selectedUser` (messagerie) ou `user` (utilisateur connecté) entre sections sans prop drilling
11. **Pagination serveur** : ajouter `page`, `limit`, `search` aux APIs backend (`userRoutes`, `messageRoutes`, etc.)
12. **Cookie `httpOnly` + `secure`** pour le JWT — remplace `localStorage` (exige changement backend + frontend)
13. **Accessibilité** : ajouter `aria-label`, `role`, gestion du focus dans les modales, remplacer `window.confirm`

### Long terme
14. **Internationalisation complète** : remplacer toutes les chaînes dures par des clés dans `translations/`
15. **Tests** : Jest + React Testing Library pour `AdminDashboard.jsx` et services API

---

## 13. Conclusion

Le dashboard admin est **fonctionnel mais fragile** : un fichier unique de 3000 lignes, une gestion d'état locale massive, des requêtes parallèles non paginées, un système de notification manuel (GSAP + `div` fixe), et une dépendance critique au `localStorage` JWT. Les corrections Prisma récentes (alignement `schema.prisma` sur `viaitalia`) résolvent les erreurs de base de données (`P2022` manquantes colonnes, `Document` manquant, `TimeSlot` incomplète). Ce qui reste :

- **Le code frontend n'est pas cassé par les changements DB** (les contrôleurs sont corrigés), mais il faut générer le client Prisma (`prisma generate`) pour que le frontend puisse utiliser `slotId`, `agreedFee`, `prixTotal`, etc.
- **Le vrai risque** est la maintenance du fichier monolithique et la absence de tests / validation systématique.
- **La priorité de l'utilisateur** semble être la correction des erreurs ("corriger erreur", "corriger tous le erreur") — ce qui est fait côté backend/DB. Prochain : générer le client, tester les endpoints admin avec JWT, puis décider si on refactorise le dashboard.

Signés : analyse réalisée sur base du code source (pas d'exécution de serveurs, pas de modifications au frontend dans cette analyse — uniquement lecture et comparaison DB/Schéma).
