import { resolve } from "path";

export default {
  root: ".",
  resolve: {
    alias: {
      "@src": resolve(__dirname, "src"),
      "@tests": resolve(__dirname, "src/tests"),
    },
  },
  build: {
    outDir: "dist",
  },
  publicDir: resolve(__dirname, "public"),
  server: {
    port: 6969,
  },
  preview: {
    port: 6868,
    strictPort: true,
  },
  test: {
    dir: "./tests/unit/",
    environment: "jsdom",
  },
};
