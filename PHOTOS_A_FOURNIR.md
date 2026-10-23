# Photos et contenus à fournir pour I TEA

Le site est livré avec des **emplacements de photos clairement identifiés** (« Photo à venir ») : aucune image n'est
inventée ni présentée comme une photo du restaurant. Ce document liste ce qu'il faut fournir pour les remplacer.

Utilisez uniquement des photos que vous avez prises vous-même ou dont vous détenez les droits. Pas de photo d'un autre
restaurant, pas d'image trouvée sur internet sans licence.

## Conseils généraux

- **Lumière naturelle**, près d'une fenêtre, sans flash ; fond simple (bois, table, nappe).
- **Plats réels, tels qu'ils sont servis** : la photo doit correspondre à ce que le client recevra.
- **Format** : JPG ou WebP, qualité élevée. Inutile de réduire le poids, `next/image` optimise automatiquement.
- **Cadrage** : gardez de la marge autour du sujet, le site recadre selon l'écran (mobile / ordinateur).
- Une personne reconnaissable doit avoir donné son accord pour apparaître sur le site.

## Photos de l'accueil

| Emplacement | Réglage dans `src/config/site.ts` | Format | Contenu attendu |
| --- | --- | --- | --- |
| Hero (haut de l'accueil) | `media.hero` | paysage 16:9, **2000 px de large minimum** | un plat signature en gros plan, lumière naturelle |
| Section « La cuisine vietnamienne » | `media.cuisine` | paysage 4:3, 1600 px | plat vietnamien généreux, herbes fraîches visibles, vue 3/4 |
| Section « Le thé et les boissons » | `media.boissons` | paysage 4:3, 1600 px | boisson (thé ou café) en gros plan, couleurs naturelles |
| Section « Les desserts » | `media.desserts` | paysage 4:3, 1600 px | dessert avec sa texture, vue de dessus ou 3/4 |
| Section « Notre histoire » | `media.histoire` | **portrait 4:5**, 1200 px de large | la restauratrice dans son restaurant (avec son accord) |

Déposez les fichiers dans `public/media/` (ex. `public/media/hero.jpg`), puis renseignez `media.hero = "/media/hero.jpg"`.

## Photos des produits

Une photo par plat, boisson ou dessert de la carte, idéalement **4:3 ou carrée, 1200 px minimum**.
Déposez-les dans `public/products/` (ex. `public/products/pho-bo.jpg`), puis ajoutez au produit, dans `src/data/menu.ts` :
`image: "/products/pho-bo.jpg"`. Les produits mis en avant (`featured`, 4 au maximum) s'affichent en grand sur l'accueil :
commencez par eux.

Facultatif : une photo par catégorie (champ `image` de la catégorie).

## Autres éléments à fournir

- **La vraie carte** : noms, descriptions, prix en euros, allergènes si vous les indiquez, options (portion, piment, sucre…).
  Le catalogue actuel est un exemple.
- **Logo** : si I TEA possède un logo, fournissez-le en SVG ou PNG fond transparent. À défaut, le site utilise une
  signature typographique « I TEA ».
- **Informations pratiques** : adresse, téléphone, e-mail, réseaux sociaux, horaires réels, zones de livraison, frais de
  livraison. Rien n'est affiché tant que l'information n'est pas renseignée.
- **Histoire** : quelques phrases écrites ou validées par la restauratrice (`site.story`). Aucun récit n'est inventé.
- **Avis clients** : de vrais avis, copiés tels quels avec leur source (`site.reviews.items`).
- **Accroche** : valider ou choisir la phrase du hero (`site.tagline`).
- **Écriture du nom** : le site écrit « I TEA » (avec espace, en capitales). À confirmer.

## Avant la mise en ligne

- [ ] Toutes les photos sont remplacées (plus aucun cadre « Photo à venir » visible).
- [ ] `demoMode: false` dans `src/config/site.ts` : le bandeau de démonstration disparaît et le site devient indexable.
- [ ] Carte, prix, horaires, adresse et zones de livraison sont réels.
- [ ] Mentions légales et politique de confidentialité complétées et validées.
- [ ] Une commande de test passe de bout en bout (admin + notification).
