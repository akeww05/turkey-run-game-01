// Gobble Getaway — the farmer: he chases, he searches, he corners.
// The farmer is a gap behind the turkey, measured in pixels. Clean running
// widens the gap; every stumble, every puddle and every dawdle closes it.
// When the gap hits zero he grabs the turkey and dinner is served.
export const FARMER_CATCH_GAP = 34;
export const FARMER_START_GAP = 280;

export class Farmer {
  constructor() {
    this.reset();
  }

  reset() {
    this.gap = FARMER_START_GAP; // px behind the turkey
    this.state = 'chase'; // chase | search | cornered | celebrate
    this.stateTimer = 0;
    this.throwTimer = 5;
    this.runCycle = 0;
    this.searchingHay = null;
    this.taunt = '';
    this.tauntTimer = 0;
  }

  // Screen x of the farmer, given the turkey's x.
  xOf(turkeyX) {
    return turkeyX - this.gap;
  }

  // The farmer surges forward (a stumble, a spotting, a corner).
  surge(px) {
    this.gap = Math.max(FARMER_CATCH_GAP, this.gap - px);
  }

  // The turkey pulls away (clean running, a sneaky escape, a stage bonus).
  fallBehind(px) {
    this.gap = Math.min(520, this.gap + px);
  }

  // He found the turkey's haystack and stops to search it.
  startSearch(haystack) {
    this.state = 'search';
    this.stateTimer = 1.5;
    this.searchingHay = haystack;
  }

  say(text, seconds) {
    this.taunt = text;
    this.tauntTimer = seconds;
  }

  update(dt, turkey, speed, knifeInterval) {
    this.runCycle += dt * (this.state === 'chase' ? 10 : 3);
    this.tauntTimer = Math.max(0, this.tauntTimer - dt);
    if (this.tauntTimer === 0) this.taunt = '';

    if (this.state === 'search') {
      // Rooting through the hay: he stands still, then gives up and trudges on.
      this.stateTimer -= dt;
      if (this.stateTimer <= 0) {
        this.state = 'chase';
        this.searchingHay = null;
        this.fallBehind(170);
      }
      return 0; // no knife while searching
    }

    // Clean running pulls the turkey away; dawdling or mud lets him close in.
    let drift = 16;
    if (turkey.stumbling) drift = -45;
    else if (turkey.mudTimer > 0) drift = -26;
    else if (turkey.x < 150) drift = -30;
    else if (turkey.x > 420) drift = 16;
    this.gap = Math.max(FARMER_CATCH_GAP, Math.min(520, this.gap + drift * dt));

    // Pressure: too far ahead and he sprints; too close and he gloats, briefly.
    if (this.gap > 420) this.gap -= 26 * dt;
    if (this.gap < 90 && this.state === 'chase') {
      this.state = 'cornered';
      this.stateTimer = 1.1;
      this.say('GOTCHA, DINNER!', 1.1);
    }
    if (this.state === 'cornered') {
      this.stateTimer -= dt;
      this.gap = Math.max(FARMER_CATCH_GAP, this.gap - 46 * dt);
      if (this.stateTimer <= 0) this.state = 'chase';
    }

    // In later stages he hurls a carving knife at the turkey now and then.
    if (knifeInterval > 0) {
      this.throwTimer -= dt;
      if (this.throwTimer <= 0) {
        this.throwTimer = knifeInterval;
        return 1; // tell the game to throw one
      }
    }
    return 0;
  }
}
