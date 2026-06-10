import type { MetadataRoute } from "next";

// Web App Manifest (se sirve en /manifest.webmanifest y Next lo enlaza solo).
// Hace la app instalable ("Agregar a pantalla de inicio") con ícono propio y
// pantalla completa. Íconos en public/icons/.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prodolmo",
    short_name: "Prodolmo",
    description: "Prode del Mundial 2026 para el grupo de amigos.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b6e34",
    theme_color: "#16a34a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
