import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/core.ts", "src/node.ts", "src/browser.ts"],
    deps: {
      // tsdown <0.23 compatibility: resolve external dependency subpaths.
      // Remove to preserve subpath imports as written (the new default).
      // https://tsdown.dev/options/dependencies#deps-resolvedepsubpath
      resolveDepSubpath: true,
    },
    dts: {
      generator: "tsgo",
    },
    // Keep the conditional Node/browser root export authored in package.json.
    exports: false,
  },
});
