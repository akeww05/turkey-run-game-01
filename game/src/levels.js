// Gobble Getaway — the four stages of the escape, farmyard to freedom.
// Each stage has its own palette, its own hazards, and its own speed, so the run
// visibly grows harder the further the turkey gets from the dinner table.
export const ESCAPE_DISTANCE_M = 3000;

// distance thresholds (metres) where each stage begins.
export const STAGES = [
  {
    name: 'The Farmyard',
    sub: 'Stage 1 of 4 — slip past the fence',
    skyTop: '#f7b733', skyBottom: '#fceabb',
    ground: '#c98f4e', groundDark: '#a06a33',
    accent: '#7a3b12', leaf: '#e2701d',
    hazards: ['fence', 'pumpkin', 'pitchfork', 'mud'],
    speedBonus: 0, spawnGap: 460, knifeEvery: 0,
  },
  {
    name: 'The Barn',
    sub: 'Stage 2 of 4 — the farmer keeps a knife in here',
    skyTop: '#e08a3c', skyBottom: '#f2d38a',
    ground: '#8a5a2b', groundDark: '#6b4420',
    accent: '#5d2f10', leaf: '#b3500f',
    hazards: ['fence', 'pumpkin', 'pitchfork', 'knife', 'mud'],
    speedBonus: 25, spawnGap: 420, knifeEvery: 7,
  },
  {
    name: 'The Kitchen',
    sub: 'Stage 3 of 4 — dodge the oven, mind the carving knife',
    skyTop: '#c96a2e', skyBottom: '#e8a56b',
    ground: '#7c4a2d', groundDark: '#5e3520',
    accent: '#4a2408', leaf: '#d94f04',
    hazards: ['oven', 'knife', 'fence', 'pitchfork', 'mud'],
    speedBonus: 50, spawnGap: 390, knifeEvery: 5,
  },
  {
    name: 'The Woods',
    sub: 'Final stage — the trees, and freedom',
    skyTop: '#5d8a4a', skyBottom: '#cfe8a8',
    ground: '#6b7a3a', groundDark: '#4d5c28',
    accent: '#2f4a1e', leaf: '#c96a2e',
    hazards: ['fence', 'pumpkin', 'knife', 'pitchfork'],
    speedBonus: 60, spawnGap: 430, knifeEvery: 4.5,
  },
];

// Which stage the turkey is in at a given distance.
export function stageFor(distanceM) {
  if (distanceM >= 2250) return 3;
  if (distanceM >= 1500) return 2;
  if (distanceM >= 750) return 1;
  return 0;
}

// How fast the world scrolls (px/s) at a given distance.
export function scrollSpeed(distanceM) {
  const stage = STAGES[stageFor(distanceM)];
  return 300 + stage.speedBonus + Math.min(40, distanceM * 0.02);
}

// How far apart (px) new hazards spawn at a given distance.
export function spawnGapFor(distanceM) {
  return STAGES[stageFor(distanceM)].spawnGap;
}

// Seconds between the farmer's thrown knives at a given distance (0 = never).
export function knifeIntervalFor(distanceM) {
  return STAGES[stageFor(distanceM)].knifeEvery;
}

// How far through the current stage the turkey is, 0 to 1.
export function stageProgress(distanceM) {
  const bounds = [0, 750, 1500, 2250, ESCAPE_DISTANCE_M];
  const i = stageFor(distanceM);
  return (distanceM - bounds[i]) / (bounds[i + 1] - bounds[i]);
}

// The hazard kinds this stage can throw at the turkey.
export function hazardsFor(distanceM) {
  return STAGES[stageFor(distanceM)].hazards;
}
