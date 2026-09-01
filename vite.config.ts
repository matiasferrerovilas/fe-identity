import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

const localConfigPath = fileURLToPath(
  new URL("./config/config.local.js", import.meta.url),
);
const prodConfigPath = fileURLToPath(
  new URL("./config/config.prod.js", import.meta.url),
);

// Sirve config/config.local.js como /config.js en dev (o config.prod.js corriendo con
// `--mode prod`), y hornea config/config.prod.js en /config.js en cada `vite build` —
// mismo patrón que fe-movements/fe-keep.
function envConfig(): Plugin {
  let devConfigPath = localConfigPath;
  return {
    name: "env-config",
    configResolved(config) {
      devConfigPath = config.mode === "prod" ? prodConfigPath : localConfigPath;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/config.js") {
          res.setHeader("Content-Type", "text/javascript");
          res.end(readFileSync(devConfigPath));
          return;
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "config.js",
        source: readFileSync(prodConfigPath, "utf-8"),
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    envConfig(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    target: "es2022",
    minify: "esbuild",
    cssCodeSplit: true,
    sourcemap: false,
  },
});
