// Gobble Getaway — the HUD and the menus: title, pause, caught and escaped.
// Everything is drawn on the canvas so the screenshots show the whole game;
// buttons are plain rectangles main.js can test clicks against.
import { ESCAPE_DISTANCE_M, STAGES, stageProgress } from './levels.js';
import { FARMER_CATCH_GAP } from './farmer.js';

export const BUTTONS = {
  start: { x: 380, y: 392, w: 200, h: 52, label: 'START THE RUN' },
  howto: { x: 380, y: 452, w: 200, h: 40, label: 'HOW TO PLAY' },
  restart: { x: 380, y: 396, w: 200, h: 52, label: 'RUN AGAIN  (R)' },
  menu: { x: 380, y: 458, w: 200, h: 40, label: 'TITLE SCREEN' },
  resume: { x: 380, y: 300, w: 200, h: 52, label: 'RESUME  (P)' },
};

function inside(button, x, y) {
  return x >= button.x && x <= button.x + button.w && y >= button.y && y <= button.y + button.h;
}

export function buttonAt(state, x, y) {
  if (state === 'title') {
    if (inside(BUTTONS.start, x, y)) return 'start';
    if (inside(BUTTONS.howto, x, y)) return 'howto';
  } else if (state === 'caught' || state === 'escaped') {
    if (inside(BUTTONS.restart, x, y)) return 'restart';
    if (inside(BUTTONS.menu, x, y)) return 'menu';
  } else if (state === 'paused') {
    if (inside(BUTTONS.resume, x, y)) return 'resume';
    if (inside(BUTTONS.menu, x, y)) return 'menu';
  }
  return null;
}

function drawButton(ctx, button, highlight) {
  ctx.fillStyle = highlight ? '#ffb347' : '#e2701d';
  ctx.strokeStyle = '#7a3b12';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(button.x, button.y, button.w, button.h, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#3a1c05';
  ctx.font = 'bold 19px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(button.label, button.x + button.w / 2, button.y + 33);
  ctx.textAlign = 'left';
}

function drawPanel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(43,26,16,0.82)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = '#ffb347';
  ctx.lineWidth = 3;
  ctx.stroke();
}

export function drawHud(ctx, game) {
  const stage = STAGES[game.stageIndex];
  // Top bar.
  ctx.fillStyle = 'rgba(43,26,16,0.78)';
  ctx.fillRect(0, 0, 960, 46);
  ctx.fillStyle = '#ffb347';
  ctx.font = 'bold 17px Georgia, serif';
  ctx.fillText(`SCORE ${Math.floor(game.score)}`, 14, 29);
  ctx.fillStyle = '#f7e8c9';
  ctx.fillText(`DISTANCE ${Math.floor(game.distanceM)} m / ${ESCAPE_DISTANCE_M} m`, 200, 29);
  ctx.fillText(stage.name.toUpperCase(), 560, 29);
  // Hearts.
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < game.lives ? '#d94f04' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    const hx = 800 + i * 30;
    ctx.arc(hx, 24, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = i < game.lives ? '#fff' : 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.fillText('♥', hx - 4, 28);
    ctx.fillStyle = i < game.lives ? '#d94f04' : 'rgba(255,255,255,0.25)';
  }
  // Farmer proximity bar: how close dinner is to catching the turkey.
  const frac = 1 - (game.farmer.gap - FARMER_CATCH_GAP) / (520 - FARMER_CATCH_GAP);
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(14, 52, 220, 14);
  ctx.fillStyle = frac > 0.75 ? '#d94f04' : frac > 0.45 ? '#e8a020' : '#7ab648';
  ctx.fillRect(14, 52, 220 * Math.max(0, Math.min(1, frac)), 14);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.fillText('FARMER', 20, 63);
  ctx.fillStyle = '#f7e8c9';
  ctx.font = '12px Georgia, serif';
  ctx.fillText(`BEST ${Math.floor(game.best)} m`, 860, 66);
  // Thin progress bar through the current stage.
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(240, 52, 220, 14);
  ctx.fillStyle = '#ffd76a';
  ctx.fillRect(240, 52, 220 * Math.max(0, Math.min(1, stageProgress(game.distanceM))), 14);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.fillText('STAGE', 246, 63);
  if (game.sound.muted) {
    ctx.fillStyle = '#f7e8c9';
    ctx.fillText('MUTED (M)', 800, 86);
  }

  // Toasts: short feedback lines under the bar.
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  game.toasts.forEach((toast, i) => {
    ctx.globalAlpha = Math.min(1, toast.life / 0.5);
    ctx.fillStyle = toast.color;
    ctx.strokeStyle = 'rgba(43,26,16,0.9)';
    ctx.lineWidth = 4;
    const ty = 108 + i * 28;
    ctx.strokeText(toast.text, 480, ty);
    ctx.fillText(toast.text, 480, ty);
  });
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';

  // Stage banner, fading in and out.
  if (game.stageBanner > 0) {
    ctx.globalAlpha = Math.min(1, game.stageBanner);
    ctx.fillStyle = '#ffb347';
    ctx.font = 'bold 34px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(43,26,16,0.95)';
    ctx.lineWidth = 6;
    ctx.strokeText(stage.name, 480, 190);
    ctx.fillText(stage.name, 480, 190);
    ctx.font = 'italic 18px Georgia, serif';
    ctx.fillStyle = '#fff8e0';
    ctx.fillText(stage.sub, 480, 220);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  // "Spotted" flash at the edges when the farmer is very close.
  if (frac > 0.85) {
    ctx.fillStyle = `rgba(217,79,4,${(frac - 0.85) * 2.4})`;
    ctx.fillRect(0, 0, 960, 10);
    ctx.fillRect(0, 530, 960, 10);
  }
}

export function drawTitle(ctx, game, time) {
  ctx.fillStyle = 'rgba(43,26,16,0.45)';
  ctx.fillRect(0, 0, 960, 540);
  drawPanel(ctx, 180, 52, 600, 330);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffb347';
  ctx.font = 'bold 52px Georgia, serif';
  ctx.strokeStyle = '#7a3b12';
  ctx.lineWidth = 6;
  ctx.strokeText('GOBBLE', 480, 128);
  ctx.fillText('GOBBLE', 480, 128);
  ctx.fillStyle = '#f7e8c9';
  ctx.strokeText('GETAWAY', 480, 182);
  ctx.fillText('GETAWAY', 480, 182);
  ctx.font = 'italic 18px Georgia, serif';
  ctx.fillStyle = '#e8c98f';
  ctx.fillText('Thanksgiving is coming. The oven is hot.', 480, 216);
  ctx.fillText('You are the turkey. Run for the woods!', 480, 242);
  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = '#fff8e0';
  const bob = Math.sin(time * 3) * 4;
  ctx.fillText('↑ jump · ↓ slide & hide in hay · ← → steer', 480, 288 + bob * 0.2);
  ctx.fillText('Grab corn, dodge fences, ovens and carving knives.', 480, 314);
  ctx.fillText('Reach 3,000 m and you are free. Get caught and you are dinner.', 480, 340);
  if (game.best > 0) {
    ctx.fillStyle = '#ffb347';
    ctx.font = 'bold 16px Georgia, serif';
    ctx.fillText(`Best escape so far: ${Math.floor(game.best)} m`, 480, 368);
  }
  ctx.textAlign = 'left';
  drawButton(ctx, BUTTONS.start, true);
  drawButton(ctx, BUTTONS.howto, false);

  if (game.showHowto) {
    drawPanel(ctx, 230, 120, 500, 300);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffb347';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillText('HOW TO PLAY', 480, 162);
    ctx.fillStyle = '#fff8e0';
    ctx.font = '16px Georgia, serif';
    const lines = [
      'The farmer chases you — the red bar shows how close he is.',
      'Every fence, pumpkin, pitchfork, oven and knife costs a heart',
      'and lets him surge forward. Three hearts, then dinner.',
      '',
      'Haystacks are your friend: press ↓ beside one to hide.',
      'He will search the hay, give up, and fall behind.',
      '',
      'Slide (↓) under thrown knives. Jump (↑ / Space) the rest.',
      'Corn is 50 points, a golden feather 150, pie heals a heart.',
    ];
    lines.forEach((line, i) => ctx.fillText(line, 480, 196 + i * 24));
    ctx.fillStyle = '#ffb347';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.fillText('Click anywhere or press any key to close', 480, 396);
    ctx.textAlign = 'left';
  }
}

export function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(43,26,16,0.6)';
  ctx.fillRect(0, 0, 960, 540);
  drawPanel(ctx, 280, 130, 400, 260);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffb347';
  ctx.font = 'bold 38px Georgia, serif';
  ctx.fillText('PAUSED', 480, 200);
  ctx.fillStyle = '#fff8e0';
  ctx.font = '17px Georgia, serif';
  ctx.fillText('The farmer waits. He is patient. He is hungry.', 480, 240);
  ctx.textAlign = 'left';
  drawButton(ctx, BUTTONS.resume, true);
  drawButton(ctx, BUTTONS.menu, false);
}

export function drawEnd(ctx, game, escaped) {
  ctx.fillStyle = escaped ? 'rgba(47,74,30,0.55)' : 'rgba(90,20,8,0.6)';
  ctx.fillRect(0, 0, 960, 540);
  drawPanel(ctx, 180, 74, 600, 300);
  ctx.textAlign = 'center';
  if (escaped) {
    ctx.fillStyle = '#9fd87a';
    ctx.font = 'bold 46px Georgia, serif';
    ctx.fillText('ESCAPED!', 480, 148);
    ctx.fillStyle = '#fff8e0';
    ctx.font = 'italic 19px Georgia, serif';
    ctx.fillText('You made the woods. No oven, no carving knife,', 480, 188);
    ctx.fillText('no farmer — just you, the trees, and tomorrow.', 480, 214);
  } else {
    ctx.fillStyle = '#ff6b4a';
    ctx.font = 'bold 46px Georgia, serif';
    ctx.fillText('CAUGHT!', 480, 148);
    ctx.fillStyle = '#fff8e0';
    ctx.font = 'italic 19px Georgia, serif';
    ctx.fillText('The farmer got you. Dinner is served at six.', 480, 188);
    ctx.fillText('The oven was already warm. It always is.', 480, 214);
  }
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillStyle = '#ffb347';
  ctx.fillText(`Score ${Math.floor(game.score)}   ·   Distance ${Math.floor(game.distanceM)} m`, 480, 262);
  ctx.fillStyle = '#fff8e0';
  ctx.font = '17px Georgia, serif';
  ctx.fillText(`Best escape: ${Math.floor(game.best)} m`, 480, 292);
  ctx.fillText(`Corn ${game.corn}  ·  Feathers ${game.feathers}  ·  Sneaky hides ${game.sneaks}`, 480, 320);
  if (game.score >= game.bestScore && game.score > 0) {
    ctx.fillStyle = '#ffd76a';
    ctx.font = 'bold 17px Georgia, serif';
    ctx.fillText('★ New best score! ★', 480, 348);
  }
  ctx.textAlign = 'left';
  drawButton(ctx, BUTTONS.restart, true);
  drawButton(ctx, BUTTONS.menu, false);
}
