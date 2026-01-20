import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // FIX 1: Change frontend port to avoid conflict with the backend
    port: 80,

    // FIX 2: Add the proxy to forward API calls to the backend
    proxy: {
      // Any request from the frontend that starts with "/api"
      // will be sent to "/api"
      '/api': {
        target: '', // Your Spring Boot backend address
        changeOrigin: true, // Recommended for avoiding CORS issues
      }
    }
  },
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));