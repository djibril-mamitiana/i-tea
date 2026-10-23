import type { Metadata } from "next";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold">Politique de confidentialité</h1>
      {site.demoMode && (
        <p className="mt-4 rounded-2xl bg-lemon/50 p-4 text-sm font-semibold">
          Texte décrivant le fonctionnement technique actuel du site. À faire valider et compléter (identité du responsable
          de traitement, durée de conservation, droits des personnes) avant la mise en ligne.
        </p>
      )}
      <div className="mt-8 space-y-6 leading-relaxed">
        <section>
          <h2 className="text-2xl font-semibold">Données collectées lors d&apos;une commande</h2>
          <p className="mt-2 text-muted">
            Pour préparer et livrer votre commande, nous enregistrons : votre nom, votre numéro de téléphone, votre adresse (en cas de
            livraison), vos éventuelles instructions et le contenu de la commande. Aucun compte n&apos;est nécessaire.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">Utilisation</h2>
          <p className="mt-2 text-muted">
            Ces données servent uniquement au traitement de votre commande et à vous contacter à son sujet. Elles sont transmises au
            restaurant {site.name} par le canal de notification qu&apos;il a configuré.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">Sur votre appareil</h2>
          <p className="mt-2 text-muted">
            Votre panier, votre mode de réception et, après une commande, votre nom, votre téléphone et votre adresse sont mémorisés
            dans le stockage local de votre navigateur pour vous faire gagner du temps. Ils ne quittent pas votre appareil sauf au
            moment de commander. Vous pouvez les effacer en vidant les données du site dans votre navigateur. Le site n&apos;utilise
            aucun cookie publicitaire ni outil de suivi.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">Vos droits</h2>
          <p className="mt-2 text-muted">
            Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données en contactant le restaurant
            {site.contact.email ? ` à ${site.contact.email}` : ""}.
          </p>
        </section>
      </div>
    </article>
  );
}
