# I TEA — site de commande en ligne

Site de commande pour le restaurant **I TEA** (cuisine vietnamienne, thés et boissons, desserts) :
Next.js 16 · React 19 · TypeScript · Tailwind CSS 4. Mobile first, panier persistant,
personnalisation des produits, checkout invité, enregistrement des commandes en base de données
et espace admin pour le restaurant.

> ⚠️ **Version de démonstration.** La carte, les prix, les horaires et les emplacements de photos sont fictifs
> ou provisoires, et signalés comme tels sur le site. Rien n'est inventé en production : remplacez les données
> (voir ci-dessous) puis passez `demoMode` à `false`. Les photos attendues sont listées dans
> [`PHOTOS_A_FOURNIR.md`](PHOTOS_A_FOURNIR.md).

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
- `categories` : les catégories (nom, accroche, `image` facultative). Ajoutez, supprimez, réordonnez.
  L'accueil affiche une section par catégorie ; la carte (`#carte`) les regroupe sous des filtres.
- `products` : un objet par produit (`name`, `description`, `price`, `available`, `featured`, `upsell`, `groups`…).
  Le catalogue actuel (13 plats, boissons et desserts) est un **exemple de démonstration** : remplacez-le par la vraie carte.
- **Options** : `OptionGroup` réutilisables (`portion`, `spice`, `sugar`, sauces, garnitures…).
  Un groupe a un `min` (0 = facultatif, 1+ = obligatoire), un `max` (1 = choix unique) et des
  options avec leur supplément `price`. Une option `available: false` est grisée.
- **Photos réelles** : déposez vos fichiers dans `public/products/` puis ajoutez `image: "/products/pho-bo.jpg"`
  au produit. Sans `image`, un emplacement « photo à venir » s'affiche en mode démo (jamais une illustration
  présentée comme une photo du restaurant). Format conseillé : 4:3 ou carré, 1200 px minimum.
- `featured: true` → apparaît dans « Notre sélection » (**3 ou 4 produits disponibles**, vérifié par les tests).
  `upsell: true` → proposé dans le panier.

Les prix sont recalculés **côté serveur** à partir de ce même fichier : le navigateur n'est jamais cru sur parole.

## Identité visuelle et photos

Direction « maison vietnamienne contemporaine » : sobre, chaleureuse, éditoriale, portée par la photographie.

- **Palette** (`src/app/globals.css`, bloc `@theme`) : crème `#F5EFE3` (fond), vert profond `#234638` (identité, boutons),
  rouge piment `#A83B2B` (appels à l'action principaux, avec parcimonie), miel doré `#D6A65D` (filets, accents sur fond
  sombre), brun foncé `#332B23` (texte). Toutes les paires texte/fond atteignent un contraste d'au moins 4,5:1 (WCAG AA).
- **Typographie** : titres en *Newsreader* (serif élégant, italique pour l'emphase), texte, prix, navigation et boutons
  en *Be Vietnam Pro*, choisie parce qu'elle couvre le **vietnamien** (Phở, Bánh mì, Cà phê sữa đá). Classes utilitaires :
  `display-xl`, `display-lg`, `display-em`, `eyebrow`.
- **Style** : boutons rectangulaires (rayon 4 px), cartes à bordure fine, ombres quasi absentes, aucune animation
  décorative. Le texte du site vouvoie le client.
- **Photos** : le site ne contient **aucune photo inventée**. Chaque emplacement est un cadre « Photo à venir » décrivant
  la photo attendue (visible uniquement en `demoMode`). Dès qu'un chemin est renseigné, `next/image` l'optimise
  (AVIF/WebP) et réserve sa place pour éviter les sauts de mise en page :

  | Où | Comment |
  | --- | --- |
  | Hero de l'accueil | `site.media.hero = "/media/hero.jpg"` dans `src/config/site.ts` (paysage, 2000 px mini) |
  | Sections cuisine, boissons, desserts | `site.media.cuisine`, `.boissons`, `.desserts` |
  | Portrait de la restauratrice | `site.media.histoire` (portrait 4:5) |
  | Produit | champ `image` dans `src/data/menu.ts` |
  | Catégorie | champ `image` sur la catégorie |

  Déposez les fichiers dans `public/media`, `public/products` ou `public/categories`, avec des images dont vous avez les droits.
- **Accroche** : `site.tagline` (« Cuisine vietnamienne, thés et douceurs. ») est une proposition neutre. Alternatives
  possibles, **à faire valider par la restauratrice** : « Maison de thé et de cuisine vietnamienne » ; ou, seulement si elle
  s'y reconnaît, « Les saveurs du Vietnam, comme à la maison ».
- **Notre histoire** : `site.story` (titre, paragraphes, signature). Rien n'est inventé : tant que les paragraphes sont vides,
  un emplacement « texte à fournir » s'affiche en mode démo et la section disparaît en production.
- **Avis clients** : `site.reviews.items` accepte de vrais avis (auteur, texte, note et source facultatives). Vide : la section
  est masquée en production et remplacée par un emplacement explicite en mode démo. Aucun avis n'est jamais inventé.
- **Navigation** : `src/lib/nav.ts` ne propose que des destinations qui existent (La carte, Notre histoire, Contact).

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
tests/                      tests unitaires (node:test) ; fixtures.ts choisit ses produits selon leurs caractéristiques,
                            jamais par nom : la vraie carte peut remplacer la démo sans casser les tests
```

## Accessibilité et performance
- Modales natives `<dialog>` (focus piégé, Échap, arrière-plan inerte), lien d'évitement, focus visibles,
  champs ≥ 16 px (pas de zoom iOS), cibles tactiles ≥ 44 px, `prefers-reduced-motion` respecté.
- Aucune librairie d'animation, aucun script tiers ; polices auto-hébergées via `next/font`.
- Images produits : `next/image` (AVIF/WebP, tailles adaptées) dès qu'une photo est renseignée.
