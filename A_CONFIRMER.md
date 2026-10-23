# À confirmer avec I Tea

Le site a été construit à partir de la carte papier (2 pages), du logo et de 28 affiches fournis par I Tea. Ces documents
se contredisent parfois, et certains choix de fonctionnement ne figurent nulle part. Voici ce qu'il faut trancher avant la mise en ligne.

## 1. Contradictions entre les documents

| Sujet | Carte papier | Affiches | Ce que fait le site |
| --- | --- | --- | --- |
| **Bò bún bœuf** | Poulet 12,50 € ; crevettes ou bœuf 13,50 € ; végé 10,50 € | « Bò bún (bœuf / poulet) » 12,50 € ; crevettes 13,50 € ; végé 10,50 € | Suit la carte papier : le bœuf est à 13,50 € |
| **Fruit teas** | Peach ice tea, Lychee ice tea, Passion fruit tea, Mango ice tea, Strawberry tea | Peach mango ice tea, Passion fruit tea, Peach iced tea, Mango passion fruit tea, Lychee green tea (avec leur composition) | Suit la carte papier |
| **Offre** | « 1 bubble tea acheté = 1 bubble waffle ou 2 taiyakis offerts » | « 1 bubble tea **ou 1 matcha** acheté = 1 bubble waffle **ou** 2 taiyakis offerts », « à emporter ou sur place » (une affiche ne cite que le waffle) | Reprend la version complète |
| **Nom** | « Soupe pho » | « Soupe phở » | « Soupe phở » |

## 2. Décisions qui vous reviennent

1. **Livraison.** Aucune affiche ne parle de livraison : toutes disent « à emporter ou sur place ». Le site propose pourtant la livraison, avec des
   valeurs d'exemple (2,90 €, offerte dès 25 €, minimum 10 €, zones à préciser). Faites-vous de la livraison ? Sinon : `ordering.delivery.enabled = false`
   dans `src/config/site.ts`.
2. **Offre « boisson achetée, gourmandise offerte » en ligne.** Elle est maintenant **active dans le panier pour les commandes à emporter** (les
   affiches disent « à emporter ou sur place »). Réglages de départ, à valider dans l'admin (onglet Offres) : valable pour les bubble teas (fruit tea,
   milk tea) et les matchas, hors Special series (taro, cacao) ; **1 cadeau par commande** ; « 2 taiyakis » avec un seul parfum pour les deux. Souhaitez-vous
   l'étendre à la livraison, autoriser plusieurs cadeaux par commande, ou inclure les Special series ? La **carte de fidélité** reste une carte papier
   (simple annonce).
3. **Horaires.** « Ouvert 7j/7 – 11h30 à 21h00 » figure sur plusieurs affiches ; le site l'applique tous les jours. Jours fériés, fermetures ?
4. **Plats crousty.** La carte indique seulement « Plats crousty : taille M 8 € / taille L 10 € », sans liste de plats. Le site propose un produit
   « Plat crousty » avec le choix de taille. Quels sont les plats ?
5. **Options non écrites sur la carte** (hypothèses du site, à valider) :
   - toppings (+0,50 € chacun) et crèmes (+1,00 €) proposés sur les bubble teas, matchas et Special series, sans limite de nombre, pas sur les cafés ;
   - matcha et Special series à 7 € sans choix de taille ;
   - un seul parfum par taiyaki ou bubble waffle ; bubble waffle « au choix » (6 €) ou « avec glaces, 3 boules » (8 €) ;
   - nems : porc, poulet ou végé au même prix (affiche des nems) ;
   - aucun choix de sucre ou de glace, puisque la carte n'en parle pas.
6. **Bières (Tsingtao, Asahi).** Alcool : vente à emporter et livraison encadrées (majorité, licence). Le site précise « réservée aux personnes
   majeures » ; à vérifier avec I Tea.
7. **Écriture du nom.** Le logo s'écrit « iTea » ; le texte du site « I Tea ». Quelle écriture retenir ?
8. **Réseaux sociaux.** La carte de fidélité montre les icônes Facebook et Instagram sans nom de compte : à fournir.
9. **Mentions légales et politique de confidentialité** : textes modèles à compléter (raison sociale, SIRET, hébergeur, responsable de traitement).

## 2 bis. Plats à retirer

Le catalogue du site reprend la carte papier ligne par ligne (73 plats). Si certains plats de la carte ne sont plus servis, retirez-les vous-même dans
l'admin, onglet **Carte** (« Retiré du site » ou « En rupture »), ou donnez-moi leur liste pour les supprimer définitivement du code.

## 3. Coordonnées confirmées

Adresse 7 rue du Général Leclerc, 91440 Bures-sur-Yvette ; téléphones 07 67 68 10 91 et 01 86 04 51 70 ; e-mail `itearestaurant@gmail.com`.

## 4. Photos

- Les photos viennent de la page Facebook d'I Tea (affiches). **20 produits** en ont une, recadrée sans les textes (`public/products/`) ; elles servent aussi
  au hero (collage de trois plats) et aux cartes de catégories. Les autres produits utilisent des illustrations vectorielles, clairement stylisées.
- **Fruit teas** : l'affiche les montre en petit format ; pas de photo individuelle exploitable. Des photos de chaque boisson seraient utiles.
- **Photo de la salle** (`public/media/resto.jpg`) : elle ressemble à une image de synthèse. Est-ce bien une photo du restaurant ? Sinon, remplacez-la
  par une vraie photo avant la mise en ligne.
- **Correspondance photo / plat** : à vérifier, par exemple « nouilles sautées aux légumes » dont l'image montre des nems, du tofu et de la salade.
- **Affiches** : les textes promotionnels qu'elles contiennent (allégations santé sur le matcha, mention « best seller ») ne sont pas repris sur le site.

## 5. Sécurité

Le mot de passe Neon et le mot de passe admin ont été affichés dans des échanges précédents : changez-les.
