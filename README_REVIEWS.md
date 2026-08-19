# Module d’avis clients

Cette version ajoute un système d’avis modérés. Un client connecté peut choisir une note de 1 à 5 étoiles et écrire un avis depuis son Client Dashboard. L’avis est créé avec le statut `PENDING` et n’est pas visible publiquement avant validation.

L’administrateur dispose d’une entrée **Avis clients** dans le dashboard admin. Il peut filtrer les avis en attente, acceptés ou refusés, puis accepter ou refuser chaque avis. Un avis accepté est automatiquement chargé par la section Testimonials de la page Home et affiché dans les cartes avec étoiles. En l’absence d’avis accepté, les témoignages traduits existants restent affichés.

## Installation Windows

```powershell
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Si la migration n’est pas détectée dans une installation qui utilise un ancien dossier de migrations, exécuter le fichier `backend/migrations/add_reviews.sql` dans la base MySQL `viaitalia`, puis relancer `npx prisma generate`.

Dans un second terminal :

```powershell
cd frontend
npm install
npm start
```

## Parcours de test

Connectez-vous comme client, ouvrez le dashboard, choisissez une note et envoyez un avis d’au moins 10 caractères. Le message doit confirmer que l’avis est en attente. Connectez-vous ensuite comme administrateur, ouvrez **Avis clients**, acceptez l’avis, puis rechargez la page Home. L’avis accepté doit apparaître dans Testimonials. Un avis refusé reste invisible sur Home.

Les routes ajoutées sont `GET /api/reviews/approved`, `POST /api/reviews`, `GET /api/reviews/mine`, `GET /api/reviews/admin` et `PATCH /api/reviews/:id/moderate`.
