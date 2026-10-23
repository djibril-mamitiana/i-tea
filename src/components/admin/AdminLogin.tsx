"use client";

import { CircleAlert, LoaderCircle, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "../Logo";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.refresh(); // la page serveur affiche maintenant le tableau de bord
        return;
      }
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Connexion impossible. Veuillez réessayer.");
    } catch {
      setError("Connexion impossible. Vérifiez votre connexion internet.");
    }
    setLoading(false);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4 py-16">
      <Logo />
      <form onSubmit={onSubmit} className="rounded-card bg-white p-8 shadow-card" noValidate>
        <span className="grid size-12 place-items-center rounded-2xl bg-ink text-cream">
          <LockKeyhole size={24} aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold">Espace restaurant</h1>
        <p className="mt-1 text-muted">Connectez-vous pour gérer les commandes.</p>

        <label htmlFor="admin-password" className="mt-6 block font-bold">
          Mot de passe
        </label>
        <input
          id="admin-password"
          type="password"
          className="field mt-1.5"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          autoFocus
          required
          aria-invalid={!!error}
          aria-describedby={error ? "admin-error" : undefined}
        />

        {error && (
          <p id="admin-error" role="alert" className="mt-3 flex items-start gap-2 text-sm font-semibold text-danger">
            <CircleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-accent btn-lg mt-6 w-full" disabled={loading || password.length === 0}>
          {loading && <LoaderCircle className="animate-spin" size={20} aria-hidden="true" />}
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
