# turkey-run-game-01

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/akeww05/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/akeww05/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

**Gobble Getaway** — a complete turkey escape game that plays offline in a desktop browser. Thanksgiving is coming, the oven is hot, and you are the turkey: outrun the farmer through the farmyard, the barn and the kitchen, and reach the woods 3,000 metres away. Jump fences, pumpkins and pitchforks, slide under the farmer's thrown carving knives, dodge the roaring oven, and hide in haystacks while he searches — every stumble lets him surge closer, and three hearts are all you get. Corn, golden feathers and pumpkin pie along the way; a best-distance record to beat on the next run. Canvas 2D art, WebAudio sounds, no libraries, no network.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

Controls: ← → or A / D steer, ↑ / W / Space / click jumps, ↓ / S slides (and hides beside a haystack), P pauses, R restarts, M mutes.

## Screenshots

Four real renders of the game, listed in `shots.json` (the first is the cover):

1. `1-gameplay.png` — a run in play, stage two, HUD live
2. `2-title.png` — the title screen
3. `3-escaped.png` — the escaped end screen
4. `4-caught.png` — the caught end screen

Each shot is staged with a query string (`?shot=play`, `?shot=title`, `?shot=escaped`, `?shot=caught`) that any browser can open to see the same scene live.

---

<sub>Entered on [make.fun](https://make.fun/?ref=npqdtzjs&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
