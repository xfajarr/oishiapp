// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

// Cloudflare Workers: set VERCEL=0 (default) and use `wrangler deploy` with wrangler.jsonc.
// Vercel: set env VERCEL=1 in the Vercel project so we skip the Cloudflare plugin and emit a Nitro
// output that Vercel recognizes (see https://vercel.com/docs/frameworks/full-stack/tanstack-start ).
const deployTarget = process.env.VERCEL === "1" ? "vercel" : "cloudflare";

export default defineConfig({
  cloudflare: deployTarget === "vercel" ? false : undefined,
  plugins: deployTarget === "vercel" ? [nitro()] : [],
  tanstackStart: {
    server: { entry: "server" },
  },
});
