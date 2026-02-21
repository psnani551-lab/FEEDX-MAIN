import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  base: "/FEEDX-MAIN/",
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "fitting-improved-participated-continues.trycloudflare.com",
      "characteristic-translate-advert-smile.trycloudflare.com",
    ],
    proxy: {
      "/api/auth": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      "/api/admin": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      "/api/upload": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      "/api/login": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      "/api/register": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
