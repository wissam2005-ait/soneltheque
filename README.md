# Sonaltech Électrique — site public et espace de gestion

Un seul projet, deux parties :

| Adresse | Pour qui | Contenu |
|---|---|---|
| `/` | les clients | Accueil, Services, Réalisations (photos), Devis gratuit, Contact, boutons WhatsApp / appel |
| `/admin` | l'entreprise (mot de passe) | Devis, factures, bons pour, attachements, PDF, chantiers, clients, catalogue, pointage, frais, **demandes reçues du site**, **réalisations à publier**, corbeille |

- Les demandes de devis et messages du site arrivent dans **admin → Demandes reçues** (bouton « Faire un devis »).
- Les chantiers ajoutés dans **admin → Réalisations** (avec photos) s'affichent sur la page Réalisations du site.
- La gestion fonctionne **sans internet** (données sur l'appareil) et s'enregistre sur le serveur dès que la connexion revient. Rien n'est supprimé définitivement (corbeille).

## Déploiement sur Vercel (gratuit)

1. vercel.com/new → importer le dépôt GitHub du projet → **Deploy** (réglages détectés automatiquement).
2. Projet → **Storage** → **Create Database** → **Neon** (Postgres, région Frankfurt, offre Free) → **Connect** au projet. Cela crée `DATABASE_URL`.
3. Projet → **Settings → Environment Variables** → `APP_PASSWORD` = le mot de passe de l'espace de gestion (10 caractères minimum).
4. **Deployments** → … → **Redeploy**.

Le site public est à l'adresse du projet, la gestion à `/admin`.

Netlify reste possible (`netlify.toml`, Netlify Blobs, variable `APP_PASSWORD`).

## Version clé USB (sans internet)

`npm run build:usb` → `dist-usb/Sonaltech.html`, à ouvrir par double-clic. Dans Paramètres → « Enregistrer sur le site », indiquer l'adresse du site et le mot de passe pour synchroniser.

## Développement

```bash
npm install
APP_PASSWORD=motdepasse-test node --experimental-strip-types server/dev-server.mjs   # API locale (port 8787)
npm run dev
```

Pile : React 18, TypeScript, Vite, Tailwind CSS, Dexie (IndexedDB), vite-plugin-pwa. API : `server/core.ts` (logique commune), `api/*.ts` (Vercel + Postgres via `server/pg-store.ts`), `netlify/functions/api.mts` (Netlify Blobs).
