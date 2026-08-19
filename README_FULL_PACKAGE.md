# Viatalia — dossier complet

Cette archive regroupe les dernières fonctionnalités de la plateforme Viatalia.

| Module | Inclus |
|---|---|
| Receipts / Invoices | Création de reçus côté Admin, statistiques, filtres, historique client et notification de reçus |
| Client Dashboard | Design dark navy, navigation client, statistiques financières, historique des reçus et sidebar sans adresse e-mail |
| Admin Dashboard | Design dark navy, sidebar admin, cartes de statistiques, tableau des reçus, filtres, Payment Summary et Recent Activity |
| University Programs | Recherche et synchronisation paginée depuis les sources Universitaly, catalogue local, filtres et déduplication |
| Reviews | Soumission d’avis client avec étoiles, statut pending, acceptation/refus par Admin et affichage des avis approuvés sur Home |
| Landing page | Vidéo fullscreen synchronisée avec le scroll aller-retour entre Home et Contact |

## Installation Windows avec XAMPP

Démarrer MySQL dans XAMPP et créer une base nommée `viaitalia`. Dans `backend`, copier `.env.example` vers `.env`, puis renseigner la connexion MySQL et le secret JWT. Ne jamais mettre `.env` dans une archive partagée.

```powershell
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Dans un deuxième terminal :

```powershell
cd frontend
npm install
npm start
```

Ouvrir ensuite `http://localhost:3000`.

## Vérifications rapides

Après connexion Admin, vérifier **Invoices / Receipts**, **University Programs** et **Avis clients**. Après connexion Client, vérifier le dashboard, **My Receipts** et le formulaire d’avis. Pour publier un avis, le client l’envoie depuis son dashboard puis l’Admin doit l’accepter dans **Avis clients**. Les avis refusés restent invisibles sur Home.

Le fichier vidéo est inclus à l’emplacement suivant :

```text
frontend/public/media/viaitalia-scroll-video.mp4
```

L’archive exclut `node_modules`, `build` et les fichiers `.env` afin de rester installable, légère et sûre.

## Admissions multi-window 2026/27

La fonctionnalité admissions utilise uniquement les liens officiels directs de `backend/data/admission-source-map.json`. `admissionsUrls` sert aux dates et fenêtres de candidature, tandis que `feesUrls` sert aux frais de candidature. La table `AdmissionWindow` doit exister avant que l’API puisse retourner toutes les Calls/Sessions.

Depuis le dossier `backend`, exécuter une seule fois :

```powershell
npm install
npm run db:generate
npm run db:migrate
npm run seed:manual-admissions
```

Démarrer ensuite le backend avec `npm run dev`, démarrer le frontend normalement, choisir `Tous` dans le filtre Domaine et cliquer sur `Rechercher dates et frais`. La synchronisation efface les anciennes fenêtres puis recrée toutes les fenêtres vérifiées avec leur URL officielle et leur preuve textuelle exacte.

Si `Fenêtres trouvées` affiche encore une seule fenêtre legacy, la migration n’a pas été appliquée à la base indiquée par `DATABASE_URL`, ou le backend n’a pas été redémarré. Il ne faut pas utiliser la commande `mysql` si elle n’est pas disponible sur Windows : `npm run db:migrate` exécute automatiquement les migrations Prisma, y compris la création de `AdmissionWindow`.
