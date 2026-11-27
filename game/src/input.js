// Gobble Getaway — keyboard and mouse input.
// Arrow keys / WASD move and jump, Space jumps, Down slides or hides,
// P pauses, R restarts, M mutes. Clicks jump mid-run and press menu buttons.
export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.pressed = [];
    this.clicks = [];
    this.onFirstGesture = null;

    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (!e.repeat) {
        this.keys.add(e.code);
        this.pressed.push(e.code);
      }
      this.gesture();
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
    canvas.addEventListener('pointerdown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      this.clicks.push({ x, y });
      this.gesture();
    });
    // Keep keys from sticking when the window loses focus.
    window.addEventListener('blur', () => {
      this.keys.clear();
    });
    // A right-click on the canvas is not a menu here.
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  gesture() {
    if (this.onFirstGesture) {
      const fn = this.onFirstGesture;
      this.onFirstGesture = null;
      fn();
    }
  }

  // Keys held right now.
  get left() {
    return this.keys.has('ArrowLeft') || this.keys.has('KeyA');
  }

  get right() {
    return this.keys.has('ArrowRight') || this.keys.has('KeyD');
  }

  get down() {
    return this.keys.has('ArrowDown') || this.keys.has('KeyS');
  }

  // Was this code pressed since the last frame? Consumes it.
  wasPressed(code) {
    const i = this.pressed.indexOf(code);
    if (i === -1) return false;
    this.pressed.splice(i, 1);
    return true;
  }

  // True if any jump key was pressed since the last frame.
  jumpPressed() {
    for (const code of ['ArrowUp', 'KeyW', 'Space']) {
      if (this.wasPressed(code)) return true;
    }
    return false;
  }

  // True if any slide/hide key was pressed since the last frame.
  downPressed() {
    for (const code of ['ArrowDown', 'KeyS']) {
      if (this.wasPressed(code)) return true;
    }
    return false;
  }

  // Clicks since the last frame, in canvas coordinates.
  takeClicks() {
    const out = this.clicks;
    this.clicks = [];
    return out;
  }

  // Clear the pressed queue (used when changing screens).
  flush() {
    this.pressed = [];
    this.clicks = [];
  }
}
