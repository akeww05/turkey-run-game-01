// Gobble Getaway — the game itself: state machine, loop, scoring, staging.
// States: title → playing ⇄ paused → caught | escaped. The turkey auto-runs;
// the player jumps, slides and hides while the farmer chases behind.
import { Turkey, GROUND_Y } from './turkey.js';
import { Farmer, FARMER_CATCH_GAP } from './farmer.js';
import { HazardField } from './hazards.js';
import { SoundBank } from './audio.js';
import { Input } from './input.js';
import { makeRng } from './rng.js';
import { STAGES, ESCAPE_DISTANCE_M, stageFor, scrollSpeed, knifeIntervalFor } from './levels.js';
import {
  drawBackground, drawTurkey, drawFarmer,
  drawHazard, drawPickup, drawHaystack, drawThrownKnife,
} from './art.js';
import { drawHud, drawTitle, drawPaused, drawEnd, buttonAt } from './hud.js';

const BEST_KEY = 'gobble-getaway-best-m';
const BEST_SCORE_KEY = 'gobble-getaway-best-score';

function loadNumber(key) {
  try {
    const v = Number(window.localStorage.getItem(key));
    return Number.isFinite(v) ? v : 0;
  } catch {
    return 0;
  }
}

function saveNumber(key, value) {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // Storage may be unavailable; the game plays on regardless.
  }
}

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input(canvas);
    this.sound = new SoundBank();
    this.rng = makeRng(7);
    this.turkey = new Turkey();
    this.farmer = new Farmer();
    this.hazards = new HazardField(this.rng);
    this.state = 'title';
    this.time = 0;
    this.scrollPx = 0;
    this.distanceM = 0;
    this.score = 0;
    this.lives = 3;
    this.best = loadNumber(BEST_KEY);
    this.bestScore = loadNumber(BEST_SCORE_KEY);
    this.stageIndex = 0;
    this.stageBanner = 0;
    this.toasts = [];
    this.shakeTimer = 0;
    this.showHowto = false;
    this.corn = 0;
    this.feathers = 0;
    this.sneaks = 0;
    this.shotFrozen = false;
    this.lastTime = 0;

    this.input.onFirstGesture = () => {
      this.sound.ensure();
    };
  }

  // A short feedback line under the HUD.
  toast(text, color = '#fff8e0') {
    this.toasts.push({ text, color, life: 2.2 });
    if (this.toasts.length > 3) this.toasts.shift();
  }

  startRun() {
    this.rng = makeRng((Math.random() * 1e9) | 0);
    this.hazards = new HazardField(this.rng);
    this.turkey.reset();
    this.farmer.reset();
    this.distanceM = 0;
    this.score = 0;
    this.lives = 3;
    this.stageIndex = 0;
    this.stageBanner = 1.6;
    this.toasts = [];
    this.corn = 0;
    this.feathers = 0;
    this.sneaks = 0;
    this.state = 'playing';
    this.showHowto = false;
    this.input.flush();
    this.sound.ensure();
    this.sound.startMusic();
    this.sound.gobble();
    this.toast('RUN! The farmer is right behind you!', '#ffb347');
  }

  toTitle() {
    this.state = 'title';
    this.showHowto = false;
    this.sound.stopMusic();
    this.input.flush();
  }

  endRun(escaped) {
    this.state = escaped ? 'escaped' : 'caught';
    this.sound.stopMusic();
    if (escaped) this.sound.fanfare();
    else this.sound.caught();
    if (this.distanceM > this.best) {
      this.best = this.distanceM;
      saveNumber(BEST_KEY, Math.floor(this.best));
    }
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      saveNumber(BEST_SCORE_KEY, this.bestScore);
    }
    this.input.flush();
  }

  // One fixed step of the run: movement, farmer, hazards, scoring.
  update(dt) {
    const speed = scrollSpeed(this.distanceM);
    this.scrollPx += speed * dt;
    this.distanceM += (speed * dt) / 12;
    this.score += (speed * dt) / 12;

    const prevStage = this.stageIndex;
    this.stageIndex = stageFor(this.distanceM);
    if (this.stageIndex !== prevStage) {
      this.stageBanner = 2.2;
      this.sound.stageUp();
      this.score += 250;
      this.farmer.fallBehind(60);
      this.toast(`${STAGES[this.stageIndex].name} — +250`, '#ffb347');
    }
    this.stageBanner = Math.max(0, this.stageBanner - dt);
    for (const t of this.toasts) t.life -= dt;
    this.toasts = this.toasts.filter((t) => t.life > 0);
    this.shakeTimer = Math.max(0, this.shakeTimer - dt);

    // Player actions.
    if (this.input.jumpPressed()) {
      if (this.turkey.jump()) this.sound.jump();
    }
    if (this.input.downPressed()) {
      const hay = this.hazards.haystackNear(this.turkey);
      if (hay && this.turkey.onGround) {
        if (this.farmer.gap < 110) {
          this.toast('SPOTTED! Too close to hide!', '#ff6b4a');
          this.sound.spotted();
          this.farmer.surge(70);
        } else if (this.turkey.hide()) {
          this.sound.slide();
        }
      } else {
        if (this.turkey.slide()) this.sound.slide();
      }
    }
    this.turkey.update(dt, this.input, speed);

    // The farmer chases; a return of 1 means he throws a knife.
    if (this.farmer.update(dt, this.turkey, speed, knifeIntervalFor(this.distanceM)) === 1) {
      const fx = this.farmer.xOf(this.turkey.x);
      // The knife flies at head height: sliding ducks under it, a jump clears it.
      this.hazards.throwKnife(fx + 30, GROUND_Y - 70, this.turkey.x, this.turkey.y - 36);
      this.toast('DUCK! Knife!', '#ff6b4a');
      this.sound.spotted();
    }

    // If the turkey is hiding, the farmer searches the haystack when he reaches it.
    if (this.turkey.hidden) {
      const hay = this.hazards.haystacks.find((h) => !h.used && this.turkey.x > h.x - 10 && this.turkey.x < h.x + h.w + 10);
      const fx = this.farmer.xOf(this.turkey.x);
      if (hay && this.farmer.state === 'chase' && fx >= hay.x - 6) {
        hay.used = true;
        this.farmer.startSearch(hay);
        this.farmer.say('Where\'d that bird go?', 1.5);
        this.turkey.unhide();
        this.sneaks++;
        this.score += 100;
        this.toast('SNEAKY! +100', '#9fd87a');
        this.sound.sneaky();
      }
    }

    // Hazards scroll, spawn, and pay for clean clears.
    for (const e of this.hazards.update(dt, speed, this.distanceM, this.turkey)) {
      if (e.type === 'cleared') this.score += 10;
    }

    // Collisions: hits, mud, pickups.
    for (const e of this.hazards.checkCollisions(this.turkey)) {
      if (e.type === 'hit') {
        this.lives -= 1;
        this.turkey.stumble();
        this.farmer.surge(85);
        this.shakeTimer = 0.35;
        this.sound.thud();
        if (e.kind === 'oven') this.toast('THE OVEN! Ouch!', '#ff6b4a');
        else if (e.kind === 'thrown-knife') this.toast('Knife! That was close!', '#ff6b4a');
        else this.toast('Oof! The farmer gains!', '#ff6b4a');
        if (this.lives <= 0) {
          this.endRun(false);
          return;
        }
      } else if (e.type === 'mud') {
        this.toast('Mud! Shake it off!', '#e8c98f');
        this.sound.squelch();
      } else if (e.type === 'pickup') {
        if (e.kind === 'corn') {
          this.corn++;
          this.score += 50;
          this.sound.pickup();
        } else if (e.kind === 'feather') {
          this.feathers++;
          this.score += 150;
          this.sound.feather();
          this.toast('Golden feather! +150', '#ffd76a');
        } else if (e.kind === 'pie') {
          this.lives = Math.min(3, this.lives + 1);
          this.score += 25;
          this.sound.pickup();
          this.toast('Pumpkin pie! +1 heart', '#ff9ecf');
        }
      }
    }

    // Caught: the farmer closes the gap, or the turkey runs out of hearts.
    if (this.farmer.gap <= FARMER_CATCH_GAP + 2) {
      this.turkey.dead = true;
      this.endRun(false);
      return;
    }

    // Escaped: 3,000 metres, through the woods to freedom.
    if (this.distanceM >= ESCAPE_DISTANCE_M) {
      this.endRun(true);
    }
  }

  // Menu keys and clicks, by screen.
  handleMenus() {
    if (this.input.wasPressed('KeyM')) {
      if (this.sound.toggleMute()) this.toast('Muted', '#f7e8c9');
      else this.toast('Sound on', '#f7e8c9');
    }
    if (this.input.wasPressed('KeyR') && this.state !== 'title') {
      this.startRun();
      return;
    }

    const clicks = this.input.takeClicks();
    for (const click of clicks) {
      const action = buttonAt(this.state, click.x, click.y);
      if (action === 'start' || action === 'restart') {
        this.sound.click();
        this.startRun();
        return;
      }
      if (action === 'menu') {
        this.sound.click();
        this.toTitle();
        return;
      }
      if (action === 'howto') {
        this.showHowto = true;
        this.sound.click();
        return;
      }
      if (action === 'resume') {
        this.state = 'playing';
        this.sound.click();
        return;
      }
      if (this.state === 'title' && this.showHowto) {
        this.showHowto = false;
        return;
      }
      if (this.state === 'playing') {
        // Clicking the field jumps, like Space.
        if (this.turkey.jump()) this.sound.jump();
      }
    }

    if (this.state === 'title') {
      if (this.input.wasPressed('Enter') || this.input.wasPressed('Space')) {
        if (this.showHowto) this.showHowto = false;
        else this.startRun();
      }
    } else if (this.state === 'playing') {
      if (this.input.wasPressed('KeyP') || this.input.wasPressed('Escape')) {
        this.state = 'paused';
        this.input.flush();
      }
    } else if (this.state === 'paused') {
      if (this.input.wasPressed('KeyP') || this.input.wasPressed('Escape')) {
        this.state = 'playing';
        this.input.flush();
      }
    } else if (this.state === 'caught' || this.state === 'escaped') {
      if (this.input.wasPressed('Enter') || this.input.wasPressed('Space')) this.startRun();
    }
  }

  render() {
    const ctx = this.ctx;
    const stage = STAGES[this.stageIndex];
    ctx.save();
    if (this.shakeTimer > 0) {
      ctx.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8);
    }
    drawBackground(ctx, stage, this.scrollPx, this.time);
    for (const h of this.hazards.haystacks) {
      const hiddenHere = this.turkey.hidden && this.turkey.x > h.x - 10 && this.turkey.x < h.x + h.w + 10;
      drawHaystack(ctx, h.x, h.w, hiddenHere, this.time);
    }
    for (const p of this.hazards.pickups) drawPickup(ctx, p.kind, p.x, p.y, this.time);
    for (const o of this.hazards.obstacles) drawHazard(ctx, o.kind, o.x, o.roll, this.time);
    for (const k of this.hazards.knives) drawThrownKnife(ctx, k);
    drawTurkey(ctx, this.turkey, this.time);
    if (this.state !== 'title') drawFarmer(ctx, this.farmer, this.turkey.x, this.time);
    ctx.restore();

    if (this.state === 'title') drawTitle(ctx, this, this.time);
    else if (this.state === 'paused') drawPaused(ctx);
    else if (this.state === 'caught') drawEnd(ctx, this, false);
    else if (this.state === 'escaped') drawEnd(ctx, this, true);
    else drawHud(ctx, this);
  }

  frame(now) {
    const dt = Math.min(0.05, (now - this.lastTime) / 1000 || 0.016);
    this.lastTime = now;
    this.time += dt;
    this.handleMenus();
    if (this.state === 'playing' && !this.shotFrozen) this.update(dt);
    this.render();
    requestAnimationFrame((t) => this.frame(t));
  }

  // A scripted fast-forward used only to stage screenshot scenes (?shot=play
  // and friends): the turkey jumps the nearest fence and slides under knives,
  // exactly as a player would, then the frame freezes for the camera.
  stageShot(kind, seed) {
    this.rng = makeRng(seed);
    this.hazards = new HazardField(this.rng);
    this.turkey.reset();
    this.farmer.reset();
    this.distanceM = 0;
    this.score = 0;
    this.lives = 3;
    this.stageIndex = 0;
    this.toasts = [];
    this.state = 'playing';
    const step = () => {
      const near = this.hazards.obstacles
        .filter((o) => o.kind !== 'mud' && o.x > this.turkey.x)
        .sort((a, b) => a.x - b.x)[0];
      if (near && near.x - this.turkey.x < 150 && this.turkey.onGround) {
        this.turkey.jump();
      }
      const knife = this.hazards.knives[0];
      if (knife && knife.x - this.turkey.x < 170 && knife.x > this.turkey.x - 20 && this.turkey.onGround) {
        this.turkey.slide();
      }
      this.update(1 / 60);
    };
    if (kind === 'play') {
      // Six seconds in, mid-stage-two: turkey airborne, farmer close, HUD live.
      for (let i = 0; i < 360 && this.state === 'playing'; i++) step();
      if (this.state === 'playing') {
        // Pose the frozen frame: the turkey mid-jump over a fence, a knife
        // in the air from the farmer, the farmer close behind.
        this.turkey.jump();
        this.turkey.y = GROUND_Y - 110;
        this.turkey.vy = -150;
        this.hazards.obstacles.push({ kind: 'fence', x: this.turkey.x + 130, passed: false, roll: 0 });
        this.hazards.knives.push({ x: this.turkey.x - 60, y: GROUND_Y - 100, vx: 260, vy: 60, spin: 1.2 });
        this.farmer.gap = 150;
        this.toast('DUCK! Knife!', '#ff6b4a');
        this.shotFrozen = true;
      }
    } else if (kind === 'caught') {
      for (let i = 0; i < 240 && this.state === 'playing'; i++) step();
      this.lives = 0;
      this.turkey.dead = true;
      this.endRun(false);
    } else if (kind === 'escaped') {
      this.distanceM = ESCAPE_DISTANCE_M;
      this.score = 3420;
      this.corn = 18;
      this.feathers = 3;
      this.sneaks = 2;
      this.stageIndex = 3;
      this.endRun(true);
    }
    this.render();
  }

  start() {
    const params = new URLSearchParams(window.location.search);
    const shot = params.get('shot');
    const seed = Number(params.get('seed') || 7);
    if (shot === 'play' || shot === 'caught' || shot === 'escaped') {
      this.stageShot(shot, seed);
      if (!this.shotFrozen) this.frame(performance.now());
      return;
    }
    this.frame(performance.now());
  }
}

const canvas = document.getElementById('game');
const game = new Game(canvas);

// A small hook for automated playtests (not part of play): the state a test
// harness reads, and a way to start a run from outside the menus.
window.TURKEY = {
  game,
  state: () => ({
    state: game.state,
    score: Math.floor(game.score),
    distanceM: Math.floor(game.distanceM),
    lives: game.lives,
    farmerGap: Math.round(game.farmer.gap),
    farmerState: game.farmer.state,
    turkeyX: Math.round(game.turkey.x),
    turkeyY: Math.round(game.turkey.y),
    turkeyHidden: game.turkey.hidden,
    stage: STAGES[game.stageIndex].name,
    obstacles: game.hazards.obstacles.map((o) => ({ kind: o.kind, x: Math.round(o.x) })),
    knives: game.hazards.knives.map((k) => ({ x: Math.round(k.x), y: Math.round(k.y) })),
    haystacks: game.hazards.haystacks.map((h) => ({ x: Math.round(h.x), w: h.w })),
  }),
  start: () => game.startRun(),
  press: (code) => {
    game.input.keys.add(code);
    game.input.pressed.push(code);
  },
  release: (code) => game.input.keys.delete(code),
};

game.start();
