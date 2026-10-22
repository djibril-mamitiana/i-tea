# I Tea — site de commande en ligne

Site de commande pour le restaurant **I Tea** (bubble tea, thés fruités, snacks, desserts) :
Next.js 16 · React 19 · TypeScript · Tailwind CSS 4. Mobile first, panier persistant,
personnalisation des produits, checkout invité, enregistrement des commandes en base de données
et espace admin pour le restaurant.

> ⚠️ **Version de démonstration.** La carte, les prix, les horaires et les illustrations sont fictifs.
> Rien n'est inventé en production : remplacez les données (voir ci-dessous) puis passez
> `demoMode` à `false`.

## Lancer le projet

Prérequis : Node.js 20.9 ou plus récent.

```bash
npm install
npm run dev        # http://localhost:3000
```

Pour tester l'espace admin en local, créez un fichier `.env.local` (ignoré par git) :

```bash
ADMIN_PASSWORD=une-phrase-de-passe-longue
```

| Commande            | Rôle                                             |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | serveur de développement                         |
| `npm run build`     | build de production                              |
| `npm start`         | sert le build de production                      |
| `npm test`          | tests unitaires (prix, panier, commandes, admin) |
| `npm run typecheck` | vérification TypeScript                          |
| `npm run lint`      | ESLint                                           |

## Ce qu'il faut remplacer avant le lancement

Tout se règle dans **deux fichiers** :

### 1. `src/config/site.ts` — infos pratiques
- `demoMode` : `false` au lancement (retire le bandeau « démo » et autorise l'indexation Google).
- `currency` : devise et format (par défaut **euro `€`, 2 décimales** ; pour l'Ariary :
  `{ code: "MGA", symbol: "Ar", position: "suffix", decimals: 0 }`). Tous les prix du menu et les frais de livraison
  sont à exprimer dans cette devise.
- `contact`, `socials` : laissez `null` tant qu'une info n'est pas fournie, elle n'est pas affichée.
- `hours`, `timezone` (par défaut `Europe/Paris`) : horaires (affichés + badge « Ouvert / Fermé »).
- `ordering` : retrait / livraison, frais de livraison, seuil de livraison offerte, commande minimum.
- `payments` : moyens de paiement (voir « Paiement » plus bas).

### 2. `src/data/menu.ts` — la carte
- `categories` : les catégories (nom, accroche, visuel). Ajoutez, supprimez, réordonnez.
- `products` : un objet par produit (`name`, `description`, `price`, `available`, `popular`, `upsell`, `groups`…).
- **Options** : `OptionGroup` réutilisables (`size`, `sugar`, `ice`, `extraToppings`, sauces…).
  Un groupe a un `min` (0 = facultatif, 1+ = obligatoire), un `max` (1 = choix unique) et des
  options avec leur supplément `price`. Une option `available: false` est grisée.
- **Photos réelles** : déposez vos fichiers dans `public/products/` puis ajoutez `image: "/products/brown-sugar.jpg"`
  au produit. Sans `image`, une illustration vectorielle de démonstration est affichée.
  Format conseillé : carré, 800×800 px minimum, fond uni ou naturel.
- `popular: true` → apparaît dans « Les incontournables ». `upsell: true` → proposé dans le panier.
- Les formules sont de simples produits de la catégorie `formules` dont les groupes listent les choix.

Les prix sont recalculés **côté serveur** à partir de ce même fichier : le navigateur n'est jamais cru sur parole.

## Identité visuelle et photos

- **Palette** (dans `src/app/globals.css`, bloc `@theme`) : brun profond `#302019`, crème `#FFF8EF`, caramel `#C58A50`
  (actions), vert matcha `#78966A`, rose fruité `#F1A6B6`. Le caramel est assombri (`accent-text`) pour le texte, afin de
  garder un contraste suffisant.
- **Typographie** : titres en *Fraunces* (serif expressif, arrondi), texte en *DM Sans*. Classes utilitaires : `display-xl`,
  `display-lg`, `display-em` (italique d'accent), `eyebrow`.
- **Visuels** : le site livre des **illustrations vectorielles originales de démonstration** (gobelets, perles, fruits,
  snacks), pas des photographies. Elles sont remplacées par vos vraies photos, sans rien casser :
  | Où | Comment |
  | --- | --- |
  | Produit | champ `image: "/products/brown-sugar.jpg"` dans `src/data/menu.ts` |
  | Catégorie | champ `image: "/categories/snacks.jpg"` sur la catégorie |
  | Hero de l'accueil | `site.media.hero = "/media/hero.jpg"` dans `src/config/site.ts` (paysage, 1600 px mini) |
  | Section « L'univers I Tea » | `site.media.brand = "/media/brand.jpg"` (portrait, 1200 px mini) |

  Déposez les fichiers dans `public/products`, `public/categories` ou `public/media` : `next/image` les optimise (AVIF/WebP)
  et réserve leur place pour éviter les sauts de mise en page. Utilisez vos propres photos ou des images dont vous avez les droits.
- **Avis clients** : `site.reviews.items` accepte de vrais avis (auteur, texte, note et source facultatives). Vide : la section
  est masquée en production et remplacée par un emplacement explicite en mode démo. Aucun avis n'est jamais inventé.

## Commandes : ce qui est réellement en place

| Élément | État |
| --- | --- |
| Validation serveur (produits, options, quantités, prix, frais, champs client) | ✅ implémentée et testée |
| Enregistrement des commandes en **base PostgreSQL** (Neon) | ✅ testé sur une vraie base Neon (schéma, enregistrement, statuts, contraintes) et en local |
| Numéro de commande unique (`IT-AAMMJJ-XXXX`) | ✅ |
| **Espace admin** `/admin` : connexion par mot de passe, liste des commandes, statuts | ✅ implémenté et testé (voir plus bas) |
| Anti-abus (champ piège, limitation par IP, taille du corps) | ✅ (limitation des commandes en mémoire, voir plus bas) |
| Notification restaurant par **webhook** (Slack, Discord, n8n, Make…) | ✅ implémentée, testée contre un serveur local |
| Notification restaurant par **Telegram** | ⚙️ implémentée, **non testée avec un vrai bot** |
| Paiement à la réception | ✅ |
| Paiement mobile (Apple Pay, Google Pay…) | ❌ non intégré → masqué |
| Carte bancaire en ligne | ❌ non intégré → masqué |
| Suivi de commande côté client, gestion de la carte depuis l'admin | ❌ non inclus |
| Codes promo / remises | ❌ non implémentés (aucune fausse promotion n'est affichée) |

## Espace admin (`/admin`)

Réservé au restaurant : liste des commandes qui se met à jour toute seule (toutes les 15 s), alerte sonore
et titre d'onglet « (2) Nouvelles commandes », fiche complète (client, téléphone cliquable, adresse, notes,
articles et options, total), et suivi par statut : **Nouvelle → En préparation → Prête → Terminée**
(ou **Annulée**). Onglets « À traiter », « Terminées », « Annulées ». Utilisable sur téléphone et tablette.

**Activation** : définissez la variable `ADMIN_PASSWORD` (10 caractères minimum ; une phrase de passe longue
est idéale), puis redémarrez / redéployez. Sans elle, `/admin` affiche « non configuré » et rien n'est accessible.

**Sécurité** : session par cookie signé (HMAC-SHA256, `HttpOnly`, `SameSite=Strict`, `Secure` en HTTPS, 12 h),
comparaison du mot de passe en temps constant, blocage après 8 échecs en 10 min par IP (compteur en base, donc
efficace sur Vercel), vérification de l'origine sur chaque modification, réponses `no-store`, page jamais indexée.
Changer `ADMIN_PASSWORD` déconnecte toutes les sessions. Limites assumées : un seul mot de passe partagé (pas de
comptes individuels ni d'historique des actions) ; pensez à le changer si une personne quitte l'équipe.

### Notifications (recommandé : à configurer avant le lancement)
L'admin se met à jour en direct, mais une notification évite de devoir garder la page ouverte.
Renseignez **au moins un** canal :

```bash
ORDER_WEBHOOK_URL=https://hooks.slack.com/services/...   # Slack, Discord, n8n, Make, Zapier…
TELEGRAM_BOT_TOKEN=123456:ABC...                          # ou Telegram
TELEGRAM_CHAT_ID=123456789
```
Sans canal configuré, la commande est tout de même enregistrée et visible dans l'admin, mais personne n'est prévenu.

### Paiement
Seul le **paiement à la réception** est actif. Un moyen de paiement n'apparaît côté client que si
`enabled: true` **et** `integrated: true` dans `site.payments`, et le serveur refuse tout autre moyen.
Pour ajouter un paiement en ligne : intégrer le prestataire (création de la session de paiement dans
`src/app/api/orders/route.ts`, confirmation par webhook), puis passer `integrated: true`.

### Base de données
Un seul langage, **PostgreSQL**, pour le développement comme pour la production :

- **Production / Vercel** : une base Postgres, par exemple **Neon**. Copiez sa « connection string » (version *pooled*)
  dans la variable `DATABASE_URL`. Le driver `@neondatabase/serverless` (requêtes HTTP) est adapté au serverless.
  C'est un **secret** : saisissez-la dans Vercel → Settings → Environment Variables, jamais dans un fichier commité.
- **Sans configuration** (développement, VPS avec disque persistant) : un Postgres embarqué (**PGlite**) stocke
  les données dans `data/pglite`, sans rien installer ni créer de compte.
- Les tables (`orders`, `admin_login_attempts`) sont créées automatiquement au premier accès. Sur Vercel, sans
  `DATABASE_URL`, les commandes et l'admin renvoient une erreur explicite (rien n'est simulé).

Pour tester contre votre vraie base sans l'écrire dans un fichier suivi par git, mettez `DATABASE_URL` dans un fichier
ignoré comme `.env.neon.local` et lancez par exemple `node --env-file=.env.neon.local node_modules/next/dist/bin/next dev`.

La limitation du nombre de commandes par IP (`api/orders/route.ts`) est en mémoire : suffisante contre les abus
basiques, à remplacer par un store partagé (Redis/Upstash) si le site tourne sur plusieurs instances.

## Déploiement

1. Renseigner `src/config/site.ts` et `src/data/menu.ts`, passer `demoMode: false`.
2. **Vercel** : importer le dépôt, puis dans *Settings → Environment Variables* ajouter :
   `NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD`, `DATABASE_URL` (Neon) et un canal de notification.
   Redéployer, puis ouvrir `https://votre-site/admin`.
3. **VPS / serveur Node** : `npm ci && npm run build && npm start` (derrière nginx/Caddy en HTTPS, process manager
   type `pm2`). Utilisez `DATABASE_URL` (Neon ou autre Postgres), ou sauvegardez régulièrement `data/pglite`.
4. Compléter `/mentions-legales` et `/confidentialite` (textes modèles à valider juridiquement).
5. Faire une vraie commande de test de bout en bout : elle doit apparaître dans `/admin` et déclencher la notification.

## Architecture

```
src/
  config/site.ts            infos restaurant, livraison, paiement
  data/menu.ts              catégories, produits, options (source unique)
  lib/pricing.ts            moteur de prix (partagé navigateur + serveur)
  lib/cart-state.ts         logique pure du panier
  lib/order-validation.ts   validation + reconstruction serveur de la commande
  lib/order-status.ts       statuts de commande (partagés navigateur + serveur)
  lib/server/               db (PostgreSQL), orders-store, admin-auth, admin-api, notify
  app/(site)/               site public : accueil, /commande, /commande/confirmation, légales
  app/admin/                espace restaurant (connexion + tableau de bord)
  app/api/orders/           POST /api/orders (commande client)
  app/api/admin/            login, logout, liste et statuts des commandes
  components/               UI (sections, panier, modale produit, checkout, admin)
tests/                      tests unitaires (node:test)
```

## Accessibilité et performance
- Modales natives `<dialog>` (focus piégé, Échap, arrière-plan inerte), lien d'évitement, focus visibles,
  champs ≥ 16 px (pas de zoom iOS), cibles tactiles ≥ 44 px, `prefers-reduced-motion` respecté.
- Aucune librairie d'animation, aucun script tiers ; polices auto-hébergées via `next/font`.
- Images produits : `next/image` (AVIF/WebP, tailles adaptées) dès qu'une photo est renseignée.
