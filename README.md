# I Tea — site de commande en ligne

Site de commande pour le restaurant **I Tea** (Bures-sur-Yvette) : cuisine vietnamienne, bubble tea, matcha, cafés,
taiyaki et bubble waffle, halal, fait maison :
Next.js 16 · React 19 · TypeScript · Tailwind CSS 4. Mobile first, panier persistant,
personnalisation des produits, checkout invité, enregistrement des commandes en base de données
et espace admin pour le restaurant.

> ⚠️ **Version de démonstration.** La carte, les prix, l'adresse, les téléphones, les horaires et les photos viennent des
> documents fournis par I Tea (carte papier et affiches). Restent à confirmer : frais, minimum et zones de livraison,
> et plusieurs points listés dans [`A_CONFIRMER.md`](A_CONFIRMER.md). Une fois tout confirmé, passez `demoMode` à `false`.

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
- `contact` : adresse, deux numéros, e-mail et lien de carte, repris des affiches. `socials` : `null` tant que les comptes
  ne sont pas fournis. Une info à `null` n'est pas affichée.
- `hours`, `timezone` (par défaut `Europe/Paris`) : horaires (affichés + badge « Ouvert / Fermé »). Actuellement 7j/7, 11h30–21h00
  (affiche du restaurant).
- `offer`, `loyalty`, `highlights` : le texte de l'offre « 1 bubble tea ou 1 matcha acheté = 1 bubble waffle ou 2 taiyakis offerts », de la
  carte de fidélité et les mentions « viande halal », « fait maison · produits frais », tels qu'imprimés. Ils servent
  de **point de départ** : les offres se gèrent ensuite depuis l'admin (voir « Offres »).
- `ordering` : retrait / livraison, frais de livraison, seuil de livraison offerte, commande minimum.
- `payments` : moyens de paiement (voir « Paiement » plus bas).

### 2. `src/data/menu.ts` — la carte
- `categories` : les 8 catégories de la carte (Entrées, Plats, Desserts, Bubble tea, Matcha & Special series, Cafés,
  Gourmandises, Boissons), avec leur illustration. Ajoutez, supprimez, réordonnez.
- `products` : un objet par produit (`name`, `description`, `price`, `available`, `popular`, `upsell`, `badge`, `image`, `groups`…).
  Les noms et prix viennent de la carte papier ; les descriptions, de la carte et des affiches (jamais inventées).
- **Options** : `OptionGroup` réutilisables (taille 500/700 ml, toppings +0,50 €, crèmes +1,00 €, parfums, choix des nems…).
  Un groupe a un `min` (0 = facultatif, 1+ = obligatoire), un `max` (1 = choix unique) et des
  options avec leur supplément `price`. Une option `available: false` est grisée.
- **Photos** : 20 produits ont une vraie photo (`image: "/products/soupe-pho.jpg"`), recadrée depuis les affiches d'I Tea.
  Les autres affichent une illustration vectorielle générique. Pour en ajouter : déposez un carré (1000 px mini) dans
  `public/products/` et renseignez `image`.
- `popular: true` → apparaît dans « Notre sélection » (choix éditorial, sans affirmation de popularité). `upsell: true` → proposé
  dans le panier. `badge: "Signature"` : repris des affiches (soupe phở, bibimbap, bò bún).

Les prix sont recalculés **côté serveur** à partir de ce même fichier : le navigateur n'est jamais cru sur parole.

## Identité visuelle et photos

- **Palette** (dans `src/app/globals.css`, bloc `@theme`) : brun profond `#302019`, crème `#FFF8EF`, caramel `#C58A50`
  (actions), vert matcha `#78966A`, rose fruité `#F1A6B6`. Le caramel est assombri (`accent-text`) pour le texte, afin de
  garder un contraste suffisant.
- **Logo** : le logo rond d'I Tea (`public/brand/logo.webp`, généré depuis le fichier fourni) sert dans l'en-tête, le pied de page,
  l'icône du navigateur (`src/app/icon.png`, `apple-icon.png`) et l'image de partage (`opengraph-image.jpg`).
- **Typographie** : titres en *Fraunces* (avec le sous-ensemble vietnamien, pour « phở »), texte en *DM Sans* ; *Be Vietnam Pro* ne
  sert que de repli pour les caractères vietnamiens. Classes utilitaires : `display-xl`, `display-lg`, `display-em`, `eyebrow`.
- **Visuels** : les photos de plats viennent des affiches d'I Tea. Les produits sans photo, le hero et les catégories utilisent des
  **illustrations vectorielles originales** (gobelets, bols, rouleaux, taiyaki…), qui ne prétendent pas être des photos. La photo de
  la salle (`public/media/resto.jpg`) illustre la section « L'univers I Tea » : à vérifier (voir `A_CONFIRMER.md`). Tout se remplace :
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

## Carte et pause des commandes (admin)

**Carte (`/admin/carte`)** : l'équipe décide, plat par plat et sans toucher au code, de :
- laisser le plat **disponible** ;
- le mettre **en rupture** : il reste visible mais grisé (« Indisponible ») et ne peut plus être commandé ;
- le **retirer du site** : il disparaît du menu, de la sélection et des compteurs, et ne peut plus être commandé.

Le changement est immédiat. Il est aussi appliqué au panier des clients (un plat devenu indisponible en sort avec un message) et **vérifié par le
serveur à chaque commande**. Un cadeau d'offre lié à un plat en rupture n'est plus proposé. Les noms et les prix restent dans `src/data/menu.ts`.

**Pause (bouton « Commandes ouvertes / en pause » en haut de l'admin)** : un clic pour suspendre les commandes en ligne (cuisine débordée,
fermeture…), avec un message facultatif pour les clients (« Reprise des commandes à 18h30 »). Pendant la pause, un bandeau s'affiche sur le site, le
bouton de commande est désactivé et le serveur refuse les commandes. Un clic pour rouvrir.

Tables `menu_status` et `app_meta` (créées automatiquement). API : `GET /api/shop` (publique), `/api/admin/menu` et `/api/admin/shop` (admin).

## Offres (`/admin/offres`)

Les offres se créent et se modifient dans l'espace admin, onglet **Offres**, sans toucher au code. Deux types :

- **Annonce** : un texte affiché sur le site (carte de fidélité, fermeture exceptionnelle, événement…). Aucun effet sur le panier.
- **Produit offert** : acheter N produits parmi une liste donne droit à un cadeau, **au choix parmi plusieurs** (« 1 bubble waffle ou
  2 taiyakis »), avec un choix éventuel (le parfum). Le client le choisit dans son panier ; le cadeau coûte 0 € et apparaît « Offert »
  sur le ticket, dans l'admin et dans la notification.

Réglages d'une offre : titre, description, période (dates facultatives), commandes en ligne concernées (à emporter, livraison), produits qui
déclenchent l'offre, nombre à acheter pour 1 cadeau, nombre maximal de cadeaux par commande, cadeaux au choix. On peut activer ou
désactiver une offre d'un clic.

**Sécurité** : le serveur ne croit jamais le navigateur. À chaque commande, il relit les offres en base et vérifie que l'offre est en vigueur,
que le mode de commande est concerné, que le panier réel donne droit au nombre de cadeaux demandés et que le choix existe (voir
`src/lib/offers.ts`, testé dans `tests/offers.test.ts`). En cas de doute, la commande est refusée avec un message clair.

**Au premier lancement**, deux offres sont créées à partir des documents d'I Tea : « 1 bubble tea ou 1 matcha acheté = 1 bubble waffle ou 2 taiyakis
offerts » (**commandes à emporter uniquement**, 1 cadeau par commande) et la carte de fidélité (annonce). Modifiez-les ou supprimez-les : elles ne
reviennent pas. Si la base est injoignable, le site n'affiche que des annonces (aucun cadeau ne peut être vérifié).

API : `GET /api/offers` (offres en vigueur, publique) ; `/api/admin/offers` et `/api/admin/offers/[id]` (admin). Tables `offers` et `app_meta`,
créées automatiquement comme les autres.

## Espace admin (`/admin`)

Trois onglets : **Commandes**, **Carte**, **Offres**. Tableau de bord des commandes : nouvelles commandes, nombre et montant du jour, recherche (numéro,
client, téléphone, plat), filtre à emporter / livraison, historique par période (aujourd'hui, 7 jours, 30 jours), durée d'attente en couleur
(une commande oubliée se voit) et **ticket imprimable** (imprimante à tickets 80 mm ou feuille A4).

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
