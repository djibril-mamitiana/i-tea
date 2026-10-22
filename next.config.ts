import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Client de base de données : chargé tel quel par Node (pas de bundling du module natif).
  serverExternalPackages: ["@libsql/client", "libsql"],
  // Les photos produits réelles peuvent être déposées dans /public/products
  // ou servies depuis un CDN : ajoutez son domaine ici.
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },
};

export default nextConfig;
