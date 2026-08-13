# Pronostics bébé 👶

Petit site de pronostics (prénom, poids, taille) avec compte à rebours, classement
et espace parents protégé par mot de passe.

- **Front** : Vite + React + Tailwind v4, hébergé sur **GitHub Pages** (statique).
- **API** : **Cloudflare Worker** + base **D1** (SQLite). Ne se met jamais en pause.
- **Sécurité** : le mot de passe parents est vérifié dans le Worker, jamais exposé côté navigateur.

## Personnaliser

Tout est dans [`src/config.ts`](src/config.ts) : titre, accroche, prénoms des parents,
**date prévue d'accouchement** (`dueDate`, utilisée par le compte à rebours).

## Mise en ligne

### 1. Cloudflare (API + base)

La base D1 doit exister (`npx wrangler d1 create pronostics-bebe` si ce n'est pas déjà fait).

```bash
npx wrangler login
```

Récupère l'identifiant de la base et colle-le dans `database_id` de [`worker/wrangler.toml`](worker/wrangler.toml) :

```bash
npx wrangler d1 list
```

Crée les tables sur la base distante, puis le mot de passe parents :

```bash
npm run db:init
npx wrangler secret put ADMIN_PASSWORD --config worker/wrangler.toml
```

Déploie l'API — note l'URL affichée à la fin (`https://pronostics-bebe-api.<sous-domaine>.workers.dev`) :

```bash
npm run worker:deploy
```

### 2. GitHub Pages (site)

Repo : [blade503/name-guesser](https://github.com/blade503/name-guesser).

1. **Settings → Pages → Source** : choisir **GitHub Actions**.
2. **Settings → Secrets and variables → Actions → Variables** : ajouter
   `VITE_API_URL` = l'URL du Worker notée à l'étape précédente.
3. Un push sur `main` déclenche le déploiement ; le site sort sur
   <https://blade503.github.io/name-guesser/>.

L'origine `https://blade503.github.io` est déjà déclarée dans `ALLOWED_ORIGINS`
([`worker/wrangler.toml`](worker/wrangler.toml)) : sans elle le navigateur bloquerait
les appels à l'API (CORS).

## Espace parents

<https://blade503.github.io/name-guesser/#/parents> — mot de passe = le secret `ADMIN_PASSWORD`.

Le formulaire y enregistre le prénom, le poids, la taille et la date de naissance.
**Dès l'enregistrement, le résultat et le classement deviennent publics** ; le formulaire
de pronostic disparaît. Le résultat reste modifiable après coup (faute de frappe).

## Développement local

Deux terminaux :

```bash
npx wrangler d1 execute pronostics-bebe --config worker/wrangler.toml --local --file worker/schema.sql
```

```bash
npm run worker:dev
```

```bash
npm run dev
```

Copier `worker/.dev.vars.example` en `worker/.dev.vars` pour définir un `ADMIN_PASSWORD` local.
Le front tape sur `http://localhost:8787` par défaut.

## Barème du classement

100 points : 50 pour le prénom exact (accents et casse ignorés), 25 pour le poids
(−1 pt par 40 g d'écart), 25 pour la taille (−1 pt par 0,2 cm d'écart). Voir
[`src/lib/scoring.ts`](src/lib/scoring.ts).

## Commandes

| Commande | Effet |
|---|---|
| `npm run dev` | Front en local (port 5173) |
| `npm run build` | Typecheck + build de production |
| `npm run worker:dev` | API en local (port 8787) |
| `npm run worker:deploy` | Déploie l'API sur Cloudflare |
| `npm run db:init` | Crée les tables sur la base distante |
| `npm run typecheck:worker` | Typecheck du Worker |
