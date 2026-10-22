import type { Metadata } from "next";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-extrabold">Politique de confidentialité</h1>
      {site.demoMode && (
        <p className="mt-4 rounded-2xl bg-lemon/50 p-4 text-sm font-semibold">
          Texte décrivant le fonctionnement technique actuel du site. À faire valider et compléter (identité du responsable
          de traitement, durée de conservation, droits des personnes) avant la mise en ligne.
        </p>
      )}
      <div className="mt-8 space-y-6 leading-relaxed">
        <section>
          <h2 className="text-2xl font-extrabold">Données collectées lors d&apos;une commande</h2>
          <p className="mt-2 text-muted">
            Pour préparer et livrer ta commande, nous enregistrons : ton nom, ton numéro de téléphone, ton adresse (en cas de
            livraison), tes éventuelles instructions et le contenu de la commande. Aucun compte n&apos;est nécessaire.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-extrabold">Utilisation</h2>
          <p className="mt-2 text-muted">
            Ces données servent uniquement au traitement de ta commande et à te contacter à son sujet. Elles sont transmises au
            restaurant {site.name} par le canal de notification qu&apos;il a configuré.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-extrabold">Sur ton appareil</h2>
          <p className="mt-2 text-muted">
            Ton panier, ton mode de réception et, après une commande, ton nom, ton téléphone et ton adresse sont mémorisés
            dans le stockage local de ton navigateur pour te faire gagner du temps. Ils ne quittent pas ton appareil sauf au
            moment de commander. Tu peux les effacer en vidant les données du site dans ton navigateur. Le site n&apos;utilise
            aucun cookie publicitaire ni outil de suivi.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-extrabold">Tes droits</h2>
          <p className="mt-2 text-muted">
            Tu peux demander l&apos;accès, la rectification ou la suppression de tes données en contactant le restaurant
            {site.contact.email ? ` à ${site.contact.email}` : ""}.
          </p>
        </section>
      </div>
    </article>
  );
}
