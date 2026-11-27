// Gobble Getaway — the turkey: run, jump, slide and hide.
// The turkey auto-runs to the right; the player steers speed with Left/Right,
// jumps with Up/Space, slides with Down, and hides in haystacks with Down.
export const GROUND_Y = 452;
export const TURKEY_HOME_X = 210;

export class Turkey {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = TURKEY_HOME_X;
    this.y = GROUND_Y;
    this.vy = 0;
    this.onGround = true;
    this.sliding = false;
    this.slideTimer = 0;
    this.hidden = false;
    this.hideTimer = 0;
    this.stumbleTimer = 0;
    this.invulnTimer = 0;
    this.mudTimer = 0;
    this.runCycle = 0;
    this.facing = 1;
    this.dead = false;
    this.justLanded = false;
  }

  // Height of the turkey's body right now (shorter while sliding).
  get height() {
    return this.sliding ? 26 : 48;
  }

  // Width of the turkey's body right now.
  get width() {
    return 40;
  }

  // Axis-aligned box used for hazard collisions.
  get box() {
    return {
      x: this.x - this.width / 2 + 4,
      y: this.y - this.height,
      w: this.width - 8,
      h: this.height,
    };
  }

  // True while the turkey is flashing after a hit and cannot be hit again.
  get invulnerable() {
    return this.invulnTimer > 0;
  }

  // True while a stumble is slowing the turkey down.
  get stumbling() {
    return this.stumbleTimer > 0;
  }

  jump() {
    if (this.dead || this.hidden) return false;
    if (!this.onGround) return false;
    this.vy = -800;
    this.onGround = false;
    this.sliding = false;
    this.slideTimer = 0;
    return true;
  }

  slide() {
    if (this.dead || this.hidden || !this.onGround) return false;
    this.sliding = true;
    this.slideTimer = 0.55;
    return true;
  }

  hide() {
    if (this.dead || !this.onGround) return false;
    this.hidden = true;
    this.hideTimer = 2.6;
    this.sliding = false;
    return true;
  }

  unhide() {
    this.hidden = false;
    this.hideTimer = 0;
  }

  // Called when a hazard connects: a stumble, a flash of invulnerability.
  stumble() {
    this.stumbleTimer = 0.9;
    this.invulnTimer = 1.4;
    this.unhide();
  }

  update(dt, input, scrollSpeed) {
    if (this.dead) return;
    this.invulnTimer = Math.max(0, this.invulnTimer - dt);
    this.stumbleTimer = Math.max(0, this.stumbleTimer - dt);
    this.mudTimer = Math.max(0, this.mudTimer - dt);

    // Steering: Right sprints ahead, Left dawdles (and lets the farmer close in).
    if (input.left) this.x -= 130 * dt;
    if (input.right) this.x += 150 * dt;
    this.x = Math.max(90, Math.min(560, this.x));

    // Sliding lasts a short while, then the turkey pops back up.
    if (this.slideTimer > 0) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) this.sliding = false;
    }

    // Hiding ends on its own; the turkey pops out of the hay.
    if (this.hidden) {
      this.hideTimer -= dt;
      if (this.hideTimer <= 0) this.unhide();
    }

    // Gravity and landing.
    if (!this.onGround) {
      this.vy += 1900 * dt;
      this.y += this.vy * dt;
      if (this.y >= GROUND_Y) {
        this.y = GROUND_Y;
        this.vy = 0;
        this.onGround = true;
        this.justLanded = true;
      }
    } else {
      this.justLanded = false;
    }

    // Legs pump faster the faster the world scrolls past.
    const speedFactor = scrollSpeed / 300;
    this.runCycle += dt * (this.onGround ? 11 * speedFactor : 4);
  }
}
