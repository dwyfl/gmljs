import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
    overrides: [
      {
        files: ["packages/player/**"],
        plugins: ["react"],
        rules: {
          "react/rules-of-hooks": "error",
          "react/exhaustive-deps": "error",
        },
      },
    ],
  },
  run: {
    cache: true,
    tasks: {
      // Uncached, so it runs in the terminal and can show its prompts. Cached tasks and
      // scripts get no terminal input.
      changeset: { command: "changeset", cache: false },
    },
  },
});
