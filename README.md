# I Tea — site de commande en ligne

Site de commande pour le restaurant **I Tea** (bubble tea, thés fruités, snacks, desserts) :
Next.js 16 · React 19 · TypeScript · Tailwind CSS 4. Mobile first, panier persistant,
personnalisation des produits, checkout invité, enregistrement des commandes côté serveur.

> ⚠️ **Version de démonstration.** La carte, les prix, les horaires et les illustrations sont fictifs.
> Rien n'est inventé en production : remplacez les données (voir ci-dessous) puis passez
> `demoMode` à `false`.

## Lancer le projet

Prérequis : Node.js 20.9 ou plus récent.

```bash
npm install
npm run dev        # http://localhost:3000
```

| Commande            | Rôle                                         |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | serveur de développement                     |
| `npm run build`     | build de production                          |
| `npm start`         | sert le build de production                  |
| `npm test`          | tests unitaires (prix, panier, validation)   |
| `npm run typecheck` | vérification TypeScript                      |
| `npm run lint`      | ESLint                                       |

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

## Commandes : ce qui est réellement en place

| Élément | État |
| --- | --- |
| Validation serveur (produits, options, quantités, prix, frais, champs client) | ✅ implémentée et testée |
| Enregistrement des commandes | ✅ fichier `data/orders/orders.jsonl` (une commande JSON par ligne) |
| Numéro de commande unique (`IT-AAMMJJ-XXXX`) | ✅ |
| Anti-abus (champ piège, limitation par IP, taille du corps) | ✅ (limitation en mémoire, voir plus bas) |
| Notification restaurant par **webhook** (Slack, Discord, n8n, Make…) | ✅ implémentée, testée contre un serveur local |
| Notification restaurant par **Telegram** | ⚙️ implémentée, **non testée avec un vrai bot** |
| Paiement à la réception (espèces) | ✅ |
| Paiement mobile (Apple Pay, Google Pay…) | ❌ non intégré → masqué |
| Carte bancaire en ligne | ❌ non intégré → masqué |
| Interface de gestion des commandes pour le restaurant | ❌ non incluse (la notification sert de canal) |
| Codes promo / remises | ❌ non implémentés (aucune fausse promotion n'est affichée) |

### Notifications (recommandé : à configurer avant le lancement)
Copiez `.env.example` en `.env.local` et renseignez **au moins un** canal :

```bash
ORDER_WEBHOOK_URL=https://hooks.slack.com/services/...   # Slack, Discord, n8n, Make, Zapier…
TELEGRAM_BOT_TOKEN=123456:ABC...                          # ou Telegram
TELEGRAM_CHAT_ID=123456789
```
Sans canal configuré, la commande est tout de même enregistrée, mais personne n'est prévenu :
l'écran de confirmation l'indique en mode démo, et le restaurant doit alors lire `orders.jsonl`.

### Paiement
Seul le **paiement à la réception** est actif. Un moyen de paiement n'apparaît côté client que si
`enabled: true` **et** `integrated: true` dans `site.payments`, et le serveur refuse tout autre moyen.
Pour ajouter un paiement en ligne : intégrer le prestataire (création de la session de paiement dans
`src/app/api/orders/route.ts`, confirmation par webhook), puis passer `integrated: true`.

### Base de données
Le stockage par fichier fonctionne en local et sur un serveur avec disque persistant (VPS, Docker + volume).
Sur Vercel/Netlify (disque éphémère), **remplacez `saveOrder`** dans `src/lib/server/orders-store.ts`
par un appel à une base (Supabase, Neon/Postgres, Firebase…) — l'interface ne change pas.
De même, la limitation par IP de `route.ts` est en mémoire : utilisez un store partagé (Redis/Upstash)
si le site tourne sur plusieurs instances.

## Déploiement

1. Renseigner `src/config/site.ts` et `src/data/menu.ts`, passer `demoMode: false`.
2. Définir les variables d'environnement (`NEXT_PUBLIC_SITE_URL`, notifications, `ORDERS_DIR`).
3. **VPS / serveur Node** : `npm ci && npm run build && npm start` (derrière nginx/Caddy en HTTPS,
   process manager type `pm2`). Pointez `ORDERS_DIR` vers un dossier persistant et sauvegardé.
4. **Vercel** : importer le dépôt, ajouter les variables ; **brancher d'abord une base de données**
   (stockage fichier non persistant, cf. ci-dessus).
5. Compléter `/mentions-legales` et `/confidentialite` (textes modèles à valider juridiquement).
6. Faire une vraie commande de test de bout en bout et vérifier la réception de la notification.

## Architecture

```
src/
  config/site.ts            infos restaurant, livraison, paiement
  data/menu.ts              catégories, produits, options (source unique)
  lib/pricing.ts            moteur de prix (partagé navigateur + serveur)
  lib/cart-state.ts         logique pure du panier
  lib/order-validation.ts   validation + reconstruction serveur de la commande
  lib/server/               enregistrement (orders-store) et notifications (notify)
  app/api/orders/route.ts   POST /api/orders
  app/                      pages : accueil, /commande, /commande/confirmation, légales
  components/               UI (sections, panier, modale produit, checkout)
tests/                      tests unitaires (node:test)
```

## Accessibilité et performance
- Modales natives `<dialog>` (focus piégé, Échap, arrière-plan inerte), lien d'évitement, focus visibles,
  champs ≥ 16 px (pas de zoom iOS), cibles tactiles ≥ 44 px, `prefers-reduced-motion` respecté.
- Aucune librairie d'animation, aucun script tiers ; polices auto-hébergées via `next/font`.
- Images produits : `next/image` (AVIF/WebP, tailles adaptées) dès qu'une photo est renseignée.
