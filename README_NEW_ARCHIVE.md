# ViaItalia — archive mise à jour

Cette archive contient la version finale du projet ViaItalia avec une vidéo fullscreen synchronisée progressivement au scroll de Home à Contact.

## Modifications principales

La page `frontend/src/pages/Home.js` utilise maintenant une scène vidéo fullscreen. Le contenu Hero et les sections restent au-dessus de la vidéo, tandis que le temps de la vidéo avance progressivement au scroll vers Contact et revient en arrière lorsque l’utilisateur remonte.

Le composant principal est `frontend/src/components/FullPageScrollVideo.jsx` et le média se trouve ici :

```text
frontend/public/media/viaitalia-scroll-video.mp4
```

## Installation sous Windows

Ouvrir deux terminaux PowerShell.

Dans le premier terminal :

```powershell
cd backend
npm install
npx prisma generate
npm run dev
```

Dans le deuxième terminal :

```powershell
cd frontend
npm install
npm start
```

Puis ouvrir `http://localhost:3000`.

Le fichier `backend/.env` doit être configuré avec les informations MySQL locales, par exemple :

```env
DATABASE_URL="mysql://root:password@localhost:3306/viaitalia"
PORT=5000
JWT_SECRET="your-super-secret-jwt-key-here"
FRONTEND_URL="http://localhost:3000"
```

Avant de lancer les migrations, démarrer MySQL depuis XAMPP et vérifier que la base `viaitalia` existe.

## Test du scroll vidéo

Depuis Home, défiler lentement vers Contact. La vidéo doit avancer progressivement comme une animation. En remontant vers Home, elle doit revenir en arrière avec le scroll. Si l’ancien rendu reste affiché, utiliser `Ctrl + F5` dans Chrome.
