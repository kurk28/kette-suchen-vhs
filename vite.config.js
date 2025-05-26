import { resolve } from "path";

export default {
  root: "./src",
  resolve: {
    alias: {
      "@src": resolve(__dirname, "src"),
      "@tests": resolve(__dirname, "src/tests"),
    },
  },
  build: {
    outDir: "../dist",
  },
  publicDir: "public",
  server: {
    port: 6969,
  },
  test: {
    dir: "./tests/unit/",
    environment: "jsdom",
  },
};
