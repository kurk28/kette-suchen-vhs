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
  test: {
    dir: "./tests/unit/",
    environment: "jsdom",
  },
};
