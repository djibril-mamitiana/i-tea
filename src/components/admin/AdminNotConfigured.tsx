import { LockKeyhole } from "lucide-react";
import { Logo } from "../Logo";

export function AdminNotConfigured({ reason }: { reason: "missing" | "too-short" }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-6 px-4 py-16">
      <Logo />
      <div className="rounded-card bg-white p-8 shadow-card">
        <span className="grid size-12 place-items-center rounded-2xl bg-ink text-cream">
          <LockKeyhole size={24} aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold">Espace admin non configuré</h1>
        <p className="mt-2 text-muted">
          {reason === "missing"
            ? "Aucun mot de passe n'est défini. Ajoute la variable d'environnement ADMIN_PASSWORD (10 caractères minimum), puis redémarre le site."
            : "Le mot de passe défini dans ADMIN_PASSWORD est trop court : 10 caractères minimum."}
        </p>
        <p className="mt-3 text-sm text-muted">Les étapes détaillées sont dans le README, section « Espace admin ».</p>
      </div>
    </main>
  );
}
