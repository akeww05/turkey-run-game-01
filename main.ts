// Gobble Getaway — the hand-in program (Node 22, standard library only).
// It takes this repository's game/ and screenshots/ and lays them out in
// /output (or MAKEFUN_OUTPUT_DIR when that is set), then writes the dossier
// the judge reads, built with the vendored make.fun library. It runs twice
// in grading and must write the same bytes both times, so it does nothing
// here that depends on the clock, the network, or the machine it runs on.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(here, 'game'), join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The gate's caps: at most 4 screenshots of 256 KiB each, game/ at most 993
// entries and 48 MiB, paths at most 1000 bytes, dossier text at most 160 KiB.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};
writeFileSync(join(outDir, 'dossier.json'), buildDossier(outDir, CAPS));
