"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Petit réglage booléen mémorisé dans le navigateur (ex. alerte sonore). Sûr pour l'hydratation. */
export function useLocalFlag(key: string): [boolean, (value: boolean) => void] {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const handler = (e: Event) => {
        if (e instanceof StorageEvent && e.key !== key) return;
        onChange();
      };
      window.addEventListener("storage", handler);
      window.addEventListener(`flag:${key}`, handler);
      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener(`flag:${key}`, handler);
      };
    },
    [key],
  );

  const value = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key) === "1";
      } catch {
        return false;
      }
    },
    () => false,
  );

  const set = useCallback(
    (next: boolean) => {
      try {
        localStorage.setItem(key, next ? "1" : "0");
      } catch {
        /* stockage indisponible : le réglage ne sera pas mémorisé */
      }
      window.dispatchEvent(new Event(`flag:${key}`));
    },
    [key],
  );

  return [value, set];
}

/** Horloge grossière (arrondie à `stepMs`) pour afficher « il y a 5 min » sans écart d'hydratation. */
export function useNow(stepMs = 30_000): number {
  return useSyncExternalStore(
    (onChange) => {
      const id = setInterval(onChange, stepMs);
      return () => clearInterval(id);
    },
    () => Math.floor(Date.now() / stepMs) * stepMs,
    () => 0,
  );
}
