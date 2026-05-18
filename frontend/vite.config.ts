import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteCompression from 'vite-plugin-compression'; // Importar o plugin

export default defineConfig({
  plugins: [
    react(),
    viteCompression({ algorithm: 'gzip' }), // Adicionar compressão Gzip
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }) // Adicionar compressão Brotli
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
});
