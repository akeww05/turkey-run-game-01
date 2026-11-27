// Gobble Getaway — hazards and pickups: what the world throws at the turkey.
// Fences, pumpkins, pitchforks, ovens and mud to dodge; corn, golden feathers
// and pumpkin pie to grab; haystacks to hide in; knives the farmer throws.
import { hazardsFor, spawnGapFor } from './levels.js';
import { GROUND_Y } from './turkey.js';
import { pick, range, rangeInt } from './rng.js';

export const HAZARD_KINDS = ['fence', 'pumpkin', 'pitchfork', 'knife', 'oven', 'mud'];

// Collision box (w, h, y-offset from ground) for each ground hazard.
export const HAZARD_BOX = {
  fence: { w: 36, h: 46, lift: 0 },
  pumpkin: { w: 34, h: 30, lift: 0 },
  pitchfork: { w: 22, h: 52, lift: 0 },
  knife: { w: 26, h: 58, lift: 0 },
  oven: { w: 96, h: 74, lift: 0 },
  mud: { w: 76, h: 10, lift: 0 },
};

function boxesOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export class HazardField {
  constructor(rng) {
    this.rng = rng;
    this.reset();
  }

  reset() {
    this.obstacles = []; // {kind, x, passed, roll}
    this.pickups = []; // {kind, x, y, bob}
    this.haystacks = []; // {x, w, used}
    this.knives = []; // thrown knives {x, y, vx, vy}
    this.nextSpawnX = 1050;
    this.distancePx = 0;
  }

  // Throw one carving knife from the farmer toward the turkey.
  throwKnife(fromX, fromY, targetX, targetY) {
    const flight = 0.85;
    const vx = (targetX - fromX) / flight;
    const vy = (targetY - fromY - 0.5 * 900 * flight * flight) / flight;
    this.knives.push({ x: fromX, y: fromY, vx, vy, spin: 0 });
  }

  spawnAhead(distanceM) {
    const kinds = hazardsFor(distanceM);
    const kind = pick(this.rng, kinds);
    const x = this.nextSpawnX;
    this.obstacles.push({ kind, x, passed: false, roll: 0 });
    // A haystack now and then, always with room to reach it.
    if (this.rng() < 0.22) {
      this.haystacks.push({ x: x + range(this.rng, 240, 380), w: 78, used: false });
    }
    // Corn trails and the rare golden feather or pie.
    const roll = this.rng();
    if (roll < 0.55) {
      const n = rangeInt(this.rng, 2, 4);
      for (let i = 0; i < n; i++) {
        this.pickups.push({ kind: 'corn', x: x + 90 + i * 46, y: GROUND_Y - 66, bob: this.rng() * 6 });
      }
    } else if (roll < 0.68) {
      this.pickups.push({ kind: 'feather', x: x + 120, y: GROUND_Y - 120, bob: 0 });
    } else if (roll < 0.76) {
      this.pickups.push({ kind: 'pie', x: x + 120, y: GROUND_Y - 66, bob: 0 });
    }
    this.nextSpawnX = x + spawnGapFor(distanceM) + range(this.rng, 0, 190);
  }

  update(dt, speed, distanceM, turkey) {
    // Everything scrolls left at the world speed; pumpkins roll faster.
    for (const o of this.obstacles) {
      o.x -= speed * dt;
      if (o.kind === 'pumpkin') {
        o.x -= 90 * dt;
        o.roll += dt * 6;
      }
    }
    for (const p of this.pickups) p.x -= speed * dt;
    for (const h of this.haystacks) h.x -= speed * dt;
    for (const k of this.knives) {
      k.vy += 900 * dt;
      k.x += k.vx * dt;
      k.y += k.vy * dt;
      k.spin += dt * 12;
    }
    this.knives = this.knives.filter((k) => k.y < 560 && k.x > -60 && k.x < 1100);
    this.obstacles = this.obstacles.filter((o) => o.x > -140);
    this.pickups = this.pickups.filter((p) => p.x > -60);
    this.haystacks = this.haystacks.filter((h) => h.x + h.w > -40);

    // The next spawn point scrolls left with the world; when it nears the
    // right edge, lay down the next hazard ahead of it.
    this.nextSpawnX -= speed * dt;
    while (this.nextSpawnX < 1250) this.spawnAhead(distanceM);

    // Score for cleanly clearing an obstacle.
    const events = [];
    for (const o of this.obstacles) {
      if (!o.passed && o.x + 40 < turkey.x - 20) {
        o.passed = true;
        events.push({ type: 'cleared', kind: o.kind });
      }
    }
    return events;
  }

  // The haystack the turkey is standing beside right now, if any.
  haystackNear(turkey) {
    for (const h of this.haystacks) {
      if (!h.used && turkey.x > h.x - 10 && turkey.x < h.x + h.w + 10) return h;
    }
    return null;
  }

  // Collisions this frame. Returns events: hit, mud, pickup, thrown.
  checkCollisions(turkey) {
    const events = [];
    if (turkey.hidden) return events;
    const tb = turkey.box;

    for (const o of this.obstacles) {
      const b = HAZARD_BOX[o.kind];
      const ob = { x: o.x - b.w / 2, y: GROUND_Y - b.h + b.lift, w: b.w, h: b.h };
      if (o.kind === 'mud') {
        if (boxesOverlap(tb, ob) && turkey.onGround && turkey.mudTimer <= 0) {
          turkey.mudTimer = 1.1;
          events.push({ type: 'mud' });
        }
        continue;
      }
      if (!turkey.invulnerable && boxesOverlap(tb, ob)) {
        events.push({ type: 'hit', kind: o.kind });
        // Move it behind the turkey so one obstacle cannot hit twice.
        o.x = turkey.x - 90;
        o.passed = true;
        break;
      }
    }

    for (const k of this.knives) {
      const kb = { x: k.x - 14, y: k.y - 6, w: 28, h: 12 };
      if (!turkey.invulnerable && boxesOverlap(tb, kb)) {
        events.push({ type: 'hit', kind: 'thrown-knife' });
        k.y = 9999;
        break;
      }
    }

    for (const p of this.pickups) {
      const pb = { x: p.x - 16, y: p.y - 16, w: 32, h: 32 };
      if (boxesOverlap(tb, pb)) {
        events.push({ type: 'pickup', kind: p.kind });
        p.x = -9999;
      }
    }
    this.pickups = this.pickups.filter((p) => p.x > -9000);
    return events;
  }
}
