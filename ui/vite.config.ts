import path from "path";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

import { defineConfig } from "vite";

export default function viteConfig() {
  return defineConfig({
    plugins: [
      react(),
      tsconfigPaths(),
      tailwindcss()
    ],
    base: "./",
    build: {
      chunkSizeWarningLimit: 1000,
      emptyOutDir: true,
      sourcemap: true,
      outDir: path.resolve(__dirname, "./dist"),
    },
    server: {
      port: 2999,
      open: true,
    },
    preview: {
      port: 2999,
      open: true,
    }
  })
}