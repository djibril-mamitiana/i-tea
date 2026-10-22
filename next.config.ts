import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Les photos produits réelles peuvent être déposées dans /public/products
  // ou servies depuis un CDN : ajoutez son domaine ici.
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },
};

export default nextConfig;
