import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";

const browserXmlBackend = fileURLToPath(
  new URL("./src/util/xml-backend.browser.ts", import.meta.url),
);

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  pack: [
    {
      entry: { index: "src/index.ts" },
      dts: {
        generator: "tsgo",
      },
      // package.json exports are maintained by hand (types condition, main/types fallbacks).
      exports: false,
    },
    {
      // Same API, but parses with the browser's DOMParser instead of bundling xmldom.
      entry: { "index.browser": "src/index.ts" },
      platform: "browser",
      fixedExtension: true,
      alias: { "./xml-backend.ts": browserXmlBackend },
      dts: false,
      exports: false,
      clean: false,
    },
  ],
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
