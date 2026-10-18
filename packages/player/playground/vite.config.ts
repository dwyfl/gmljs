import { spawn, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite-plus";

const packageDir = fileURLToPath(new URL("..", import.meta.url));

/** Rebuilds the library (`vp pack --watch`) for as long as the dev server runs. */
function packWatch(): Plugin {
  let child: ChildProcess | undefined;
  const stop = () => {
    child?.kill();
    child = undefined;
  };
  return {
    name: "gmljs-player:pack-watch",
    apply: "serve",
    configureServer(server) {
      // --no-clean: keep dist/ in place while rebuilding, so the page never sees it missing.
      child = spawn("vp", ["pack", "--watch", "--no-clean"], {
        cwd: packageDir,
        stdio: "inherit",
      });
      server.httpServer?.once("close", stop);
      process.once("exit", stop);
    },
  };
}

export default defineConfig({
  plugins: [react(), packWatch()],
  resolve: {
    alias: [
      // CSS from source, so style edits hot-reload; the build only copies it.
      {
        find: "@gmljs/player/style.css",
        replacement: fileURLToPath(new URL("../src/style.css", import.meta.url)),
      },
      // The built library, so the page runs what gets published.
      {
        find: /^@gmljs\/player$/,
        replacement: fileURLToPath(new URL("../dist/index.mjs", import.meta.url)),
      },
    ],
  },
  server: {
    open: true,
  },
});
