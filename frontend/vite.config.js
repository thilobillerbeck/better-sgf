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
      includeAssets: ["src/favicon.svg"],
      manifest: {
        name: "BetterSGF",
        short_name: "BetterSGF",
        description:
          "Eine inoffizielle Companion App für das Schlossgrabenfest",
        theme_color: "#ffffff",
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
