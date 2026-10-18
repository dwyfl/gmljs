import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: { index: "src/index.ts" },
    dts: {
      generator: "tsgo",
    },
    // package.json exports are maintained by hand, with explicit types conditions.
    exports: false,
    // The stylesheet is shipped as-is, so the JS never imports CSS.
    copy: ["src/style.css"],
    // Lets React Server Components frameworks (e.g. Next.js) import the player directly.
    banner: { js: '"use client";' },
  },
  test: {
    environment: "jsdom",
  },
});
