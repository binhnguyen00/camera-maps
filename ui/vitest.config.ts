import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { defineConfig } from "vitest/config";

export default function vitestConfig() {
  return defineConfig({
    plugins: [
      react(),
      tsconfigPaths(),
      tailwindcss()
    ],
    base: "./",
    test: {
      environment: "jsdom",
    }
  })
}