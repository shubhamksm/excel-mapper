import path from "path";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";
import EnvironmentPlugin from "vite-plugin-environment";

export default defineConfig({
  plugins: [react(), tsConfigPaths(), EnvironmentPlugin("all")],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
