import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Next 16 génère sinon un fichier AGENTS.md à la racine du projet.
  agentRules: false,
  reactStrictMode: true,
  // Postgres embarqué (PGlite, développement) : chargé tel quel par Node, il a besoin de ses fichiers WASM.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Les photos produits réelles peuvent être déposées dans /public/products
  // ou servies depuis un CDN : ajoutez son domaine ici.
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },
};

export default nextConfig;
