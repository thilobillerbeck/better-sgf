import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import Icons from "unplugin-icons/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Icons({ compiler: "jsx", jsx: "react" }),
    VitePWA({
      workbox: {
        cleanupOutdatedCaches: false,
        sourcemap: true,
      },
      mode: "development",
      base: "/",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "BetterSGF",
        short_name: "BetterSGF",
        description:
          "Eine inoffizielle Companion App für das Schlossgrabenfest",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      devOptions: {
        enabled: true,
        /* other options */
      },
    }),
  ],
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
});
