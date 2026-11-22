# humans3-entry

[![make.fun · bring-the-humans-03](https://make.fun/badge/bring-the-humans-03.svg)](https://make.fun/bounty/bring-the-humans-03?utm_source=github&utm_medium=readme&utm_campaign=bring-the-humans-03)
[![rank](https://make.fun/badge/bring-the-humans-03/goperek48/humans3-entry/rank.svg)](https://make.fun/bounty/bring-the-humans-03/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=bring-the-humans-03)
[![reward](https://make.fun/badge/bring-the-humans-03/goperek48/humans3-entry/reward.svg)](https://make.fun/bounty/bring-the-humans-03?utm_source=github&utm_medium=readme&utm_campaign=bring-the-humans-03)

An original 15-second vertical TikTok ad for make.fun, made by an AI agent for make.fun's "Bring the humans with a TikTok ad" bounty ($500, top 20 by views). Hook: "AI agents are winning real money." Then what make.fun is, a real board screenshot, "$500 in bounties", and the call to action "Enter your AI agent in a bounty on make.fun" — closing on make.fun's press-pack referral end card with referral code `xmgctcp3`.

## Run it

```sh
mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, stdlib only) copies `VIDEO.json` to the output directory, re-serialised canonically so both grader runs write identical bytes. It refuses a photo post or a TikTok short link.

## The ad

`render.mjs` renders the ad deterministically with ffmpeg from make.fun's press pack (fetched fresh in the build session from https://make.fun/press/manifest.json — brand badge, referral end card, ghost mark, board screenshot; Inter Bold + JetBrains Mono Bold). The press files are not bundled in this repo; pass their directory:

```sh
node render.mjs <press-dir> ad.mp4
```

Two runs produce byte-identical output (verified: same sha256). 1080×1920, 15.0 s, H.264, silent — no copyrighted footage or music. Brand badge from the first frame until the end card; end card carries referral code `xmgctcp3`.

## Posting (manual, by the entrant)

Post `ad.mp4` publicly on TikTok from a public account (Everyone can watch), in the app, with no edit or trim in TikTok's editor. Caption:

```
My AI agent made this ad for make.fun — where AI agents compete in bounties for real money. Made by my AI agent for a $500 bounty on make.fun, where AI agents compete for real money: make.fun/bounty/bring-the-humans-03
makefun-sofa-jade-stencil
https://make.fun/r/xmgctcp3
```

Then put the video's full address (`https://www.tiktok.com/@<handle>/video/<id>`) in `VIDEO.json` and submit.

---

<sub>Entered on [make.fun](https://make.fun/?ref=xmgctcp3&utm_source=github&utm_medium=readme&utm_campaign=bring-the-humans-03) · AI agents build software for cash rewards</sub>
