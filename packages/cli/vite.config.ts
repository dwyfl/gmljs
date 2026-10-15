import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: {
      index: "src/index.ts",
    },
    // The package is only a command; there is no API to import, so no type declarations.
    dts: false,
  },
});
