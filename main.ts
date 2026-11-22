// main.ts — bring-the-humans-03 entrypoint (Node 22, stdlib only).
// Copies VIDEO.json from this repository to the grader's output directory.
// The house reads the TikTok video itself; nothing this program writes
// about the video counts. No network, no clock, no files outside the repo.
// The output is re-serialised canonically (one key, one trailing newline),
// so the two grader runs write byte-identical output whatever whitespace
// the repository copy carries. Run the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });

const source = join(repoRoot, "VIDEO.json");
const parsed = JSON.parse(readFileSync(source, "utf8"));
if (typeof parsed !== "object" || parsed === null || typeof parsed.url !== "string") {
  throw new Error("VIDEO.json must be an object with a string url");
}
if (parsed.url.includes("/photo/") || /^(https?:\/\/)?(vm|vt)\.tiktok\.com\//.test(parsed.url)) {
  throw new Error("VIDEO.json must name a TikTok video (/video/<id>), not a photo post or short link");
}
writeFileSync(join(outDir, "VIDEO.json"), JSON.stringify({ url: parsed.url }) + "\n", "utf8");
