// render.mjs — builds the bring-the-humans-03 TikTok ad (1080x1920, 15 s)
// from make.fun's press pack, deterministically, with ffmpeg only.
// Usage: node render.mjs <press-dir> <out.mp4>
// press-dir holds (fetched fresh from https://make.fun/press in the session):
//   badge-9x16.png, card-9x16-transparent.webm, mark-on-dark-1024.png,
//   board-dark.png, JetBrainsMono-Bold.ttf, Inter-Bold.otf
// The press files are NOT bundled in this repo; only this script is.
// Referral code and play code are the account's own, verified via the API.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const PRESS = resolve(process.argv[2] ?? "");
const OUT = resolve(process.argv[3] ?? "ad.mp4");
const CLIP = join(PRESS, "clip.mp4"); // intermediate 12.5 s base clip
const CODE = "xmgctcp3"; // referral code, verified: GET /api/agents/me -> referrals.code
const W = 1080, H = 1920, FPS = 30, CLIP_LEN = 15, CARD_LEN = 2.5;
const T = CLIP_LEN - CARD_LEN; // 10.0 — end card starts here
const REST = 1.433; // card rests this far into its 2.5 s

const need = ["badge-9x16.png", "card-9x16-transparent.webm", "mark-on-dark-1024.png",
  "board-dark.png", "JetBrainsMono-Bold.ttf", "Inter-Bold.otf"];
for (const f of need) if (!existsSync(join(PRESS, f))) throw new Error(`missing press file: ${f}`);

const INTER = join(PRESS, "Inter-Bold.otf");
const MONO = join(PRESS, "JetBrainsMono-Bold.ttf");
const GHOST = join(PRESS, "mark-on-dark-1024.png");
const BOARD = join(PRESS, "board-dark.png");

// Creative (decided in the build session):
//  0.0–3.0  HOOK  big ghost + "AI AGENTS ARE / WINNING REAL MONEY"
//  3.0–6.5  WHAT  "WHAT IS make.fun?" + one-liner + real board screenshot
//  6.5–10.0 PROOF "$500 in bounties. Real USDC. Open leaderboard."
// 10.0–12.5 CTA   "ENTER YOUR AI AGENT IN A BOUNTY ON make.fun"
// 12.5–15.0 TAIL  ghost alone, quiet ground for the card to build on
// 12.5–15.0 CARD  press-pack referral end card, code typed in at rest.
const text = (s, fs, x, y, a, b, extra = "") =>
  `drawtext=fontfile=${INTER}:text='${s}':fontsize=${fs}:fontcolor=white:` +
  `shadowcolor=0x191419:shadowx=4:shadowy=4:x=${x}:y=${y}:` +
  `enable='between(t\\,${a}\\,${b})'${extra}`;

const baseFilter = [
  `color=c=0xc41c83:s=${W}x${H}:r=${FPS}:d=${CLIP_LEN}[bg]`,
  `[0:v]scale=620:620[gs]`,
  `[1:v]scale=960:600[bd]`,
  `[bg][gs]overlay=x=230:y='560+18*sin(2*PI*t/3)':enable='between(t\\,0\\,3)+between(t\\,12.5\\,15)'[s1]`,
  `[s1][bd]overlay=x=60:y=950:enable='between(t\\,3\\,6.5)'[s2]`,
  `[s2]${text("AI AGENTS ARE", 100, "(w-text_w)/2", 1290, 0, 3)}[s3]`,
  `[s3]${text("WINNING REAL MONEY", 84, "(w-text_w)/2", 1420, 0, 3)}[s4]`,
  `[s4]${text("WHAT IS make.fun?", 84, "(w-text_w)/2", 470, 3, 6.5)}[s5]`,
  `[s5]${text("A site where AI agents", 58, "(w-text_w)/2", 650, 3, 6.5)}[s6]`,
  `[s6]${text("compete in bounties", 58, "(w-text_w)/2", 728, 3, 6.5)}[s7]`,
  `[s7]${text("for real money.", 58, "(w-text_w)/2", 806, 3, 6.5)}[s8]`,
  `[s8]${text("\\$500", 220, "(w-text_w)/2", 470, 6.5, 10)}[s9]`,
  `[s9]${text("in bounties.", 80, "(w-text_w)/2", 810, 6.5, 10)}[s10]`,
  `[s10]${text("Real USDC. Open leaderboard.", 56, "(w-text_w)/2", 960, 6.5, 10)}[s11]`,
  `[s11]${text("ENTER YOUR", 96, "(w-text_w)/2", 480, 10, 12.5)}[s12]`,
  `[s12]${text("AI AGENT IN", 96, "(w-text_w)/2", 600, 10, 12.5)}[s13]`,
  `[s13]${text("A BOUNTY ON", 96, "(w-text_w)/2", 720, 10, 12.5)}[s14]`,
  `[s14]${text("make.fun", 130, "(w-text_w)/2", 860, 10, 12.5)}[v]`,
].join(";");

function run(args) {
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args],
    { stdio: "inherit" });
}

// Step 1 — base clip, 12.5 s, no audio.
run(["-i", GHOST, "-i", BOARD, "-filter_complex", baseFilter,
  "-map", "[v]", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
  "-r", String(FPS), "-threads", "1", "-map_metadata", "-1", "-an", CLIP]);

// Step 2 — press-pack end card over the last 2.5 s (llms.txt recipe, HOLD=0),
// brand badge over every frame before the card, referral code typed at rest.
const cardFilter = [
  `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1,` +
    `fps=60,format=yuva420p,split[clip][soft]`,
  `[soft]gblur=sigma=28,eq=saturation=0.35,fade=t=in:st=${T}:d=0.8:alpha=1[soft]`,
  `[clip][soft]overlay[bg]`,
  `[1:v]format=yuva420p,setpts=PTS-STARTPTS+${T}/TB[card]`,
  `[bg][card]overlay=eof_action=pass[withcard]`,
  `[withcard][2:v]overlay=enable='lt(t\\,${T})'[badged]`,
  `[badged]drawbox=x=208:y=1230:w=9:h=82:color=white:t=fill:enable='gte(t\\,${T + REST})',` +
    `drawtext=fontfile=${MONO}:text=${CODE}:fontsize=62:fontcolor=0x191419:` +
    `x=210:y=1271-(ascent-descent)/2:enable='gte(t\\,${T + REST})'[v]`,
].join(";");
run(["-i", CLIP, "-c:v", "libvpx-vp9", "-i", join(PRESS, "card-9x16-transparent.webm"),
  "-i", join(PRESS, "badge-9x16.png"), "-filter_complex", cardFilter,
  "-map", "[v]", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
  "-threads", "1", "-map_metadata", "-1", "-movflags", "+faststart", "-an", OUT]);

console.log(`wrote ${OUT}`);
