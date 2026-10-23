# À confirmer avec I Tea

Le site a été construit à partir de la carte papier (2 pages), du logo et de 28 affiches fournis par I Tea. Ces documents
se contredisent parfois, et certains choix de fonctionnement ne figurent nulle part. Voici ce qu'il faut trancher avant la mise en ligne.

## 1. Contradictions entre les documents

| Sujet | Carte papier | Affiches | Ce que fait le site |
| --- | --- | --- | --- |
| **Bò bún bœuf** | Poulet 12,50 € ; crevettes ou bœuf 13,50 € ; végé 10,50 € | « Bò bún (bœuf / poulet) » 12,50 € ; crevettes 13,50 € ; végé 10,50 € | Suit la carte papier : le bœuf est à 13,50 € |
| **Fruit teas** | Peach ice tea, Lychee ice tea, Passion fruit tea, Mango ice tea, Strawberry tea | Peach mango ice tea, Passion fruit tea, Peach iced tea, Mango passion fruit tea, Lychee green tea (avec leur composition) | Suit la carte papier |
| **E-mail** | — | `iteaivie@gmail.com` (carte de fidélité et la plupart des affiches) ou `itearestaurant@gmail.com` (quelques affiches) | Affiche `iteaivie@gmail.com` |
| **Offre** | « 1 bubble tea acheté = 1 bubble waffle ou 2 taiyakis offerts » | « 1 bubble tea **ou 1 matcha** acheté = 1 bubble waffle **ou** 2 taiyakis offerts », « à emporter ou sur place » (une affiche ne cite que le waffle) | Reprend la version complète |
| **Nom** | « Soupe pho » | « Soupe phở » | « Soupe phở » |

## 2. Décisions qui vous reviennent

1. **Livraison.** Aucune affiche ne parle de livraison : toutes disent « à emporter ou sur place ». Le site propose pourtant la livraison, avec des
   valeurs d'exemple (2,90 €, offerte dès 25 €, minimum 10 €, zones à préciser). Faites-vous de la livraison ? Sinon : `ordering.delivery.enabled = false`
   dans `src/config/site.ts`.
2. **Offre et carte de fidélité en ligne.** Les affiches les annoncent « à emporter ou sur place ». L'offre n'est pas calculée dans le panier et la
   carte de fidélité (tampons) reste une carte papier. Souhaitez-vous qu'elles s'appliquent aux commandes en ligne ? Il faudra alors fixer les règles
   (produits concernés, cumul, quel waffle ou combien de taiyakis).
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

## 3. Photos

- **20 produits** ont une photo, recadrée depuis les affiches fournies (`public/products/`). Les autres produits, le hero et les catégories
  utilisent des illustrations vectorielles, clairement stylisées.
- **Fruit teas** : l'affiche les montre en petit format ; pas de photo individuelle exploitable. Des photos de chaque boisson seraient utiles.
- **Photo de la salle** (`public/media/resto.jpg`) : elle ressemble à une image de synthèse. Est-ce bien une photo du restaurant ? Sinon, remplacez-la
  par une vraie photo avant la mise en ligne.
- **Correspondance photo / plat** : à vérifier, par exemple « nouilles sautées aux légumes » dont l'image montre des nems, du tofu et de la salade.
- **Affiches** : les textes promotionnels qu'elles contiennent (allégations santé sur le matcha, mention « best seller ») ne sont pas repris sur le site.

## 4. Sécurité

Le mot de passe Neon et le mot de passe admin ont été affichés dans des échanges précédents : changez-les.
