// Gobble Getaway — every picture in the game is drawn here in Canvas 2D.
// No images, no fonts to download: the turkey, the farmer, the farm, the
// kitchen and the woods are all code, in one autumn palette.
import { GROUND_Y } from './turkey.js';

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function poly(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

// ---------------------------------------------------------------- background

export function drawBackground(ctx, stage, scrollPx, time) {
  const W = 960;
  const H = 540;
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, stage.skyTop);
  sky.addColorStop(1, stage.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, GROUND_Y + 4);

  // Sun and drifting clouds. The sun sits low on the right, clear of the HUD.
  ctx.fillStyle = '#fff3c4';
  circle(ctx, 850, 140, 30);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < 3; i++) {
    const cx = ((i * 340 + time * 12) % 1100) - 80;
    const cy = 66 + i * 42;
    ellipse(ctx, cx, cy, 44, 16);
    ellipse(ctx, cx + 30, cy + 6, 32, 13);
  }

  // Far hills / trees, parallax at half speed.
  ctx.fillStyle = stage.accent;
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 8; i++) {
    const hx = ((i * 173 - scrollPx * 0.4) % 1100 + 1100) % 1100 - 60;
    ellipse(ctx, hx, GROUND_Y - 8, 130, 52);
  }
  ctx.globalAlpha = 1;

  // Stage scenery on the horizon.
  if (stage.name === 'The Barn') drawBarn(ctx, 700 - ((scrollPx * 0.6) % 1400), GROUND_Y);
  if (stage.name === 'The Kitchen') drawFarmhouse(ctx, 660 - ((scrollPx * 0.6) % 1400), GROUND_Y);
  if (stage.name === 'The Woods') {
    for (let i = 0; i < 6; i++) {
      const tx = ((i * 211 - scrollPx * 0.7) % 1100 + 1100) % 1100 - 40;
      drawPine(ctx, tx, GROUND_Y, 92 + (i % 3) * 18);
    }
  }
  if (stage.name === 'The Farmyard') {
    for (let i = 0; i < 5; i++) {
      const tx = ((i * 260 - scrollPx * 0.5) % 1150 + 1150) % 1150 - 50;
      drawHayBale(ctx, tx, GROUND_Y);
    }
  }

  // Ground.
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  ctx.fillStyle = stage.groundDark;
  ctx.fillRect(0, GROUND_Y, W, 8);
  // Grass tufts and fallen leaves scrolling past.
  ctx.fillStyle = stage.leaf;
  for (let i = 0; i < 14; i++) {
    const lx = ((i * 137 - scrollPx) % 1000 + 1000) % 1000 - 20;
    const ly = GROUND_Y + 22 + ((i * 53) % 52);
    ellipse(ctx, lx, ly, 7, 3);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for (let i = 0; i < 10; i++) {
    const gx = ((i * 211 - scrollPx) % 1000 + 1000) % 1000 - 20;
    ctx.fillRect(gx, GROUND_Y + 34 + (i % 3) * 14, 16, 3);
  }
}

function drawBarn(ctx, x, groundY) {
  if (x < -160 || x > 1000) return;
  ctx.fillStyle = '#a83226';
  ctx.fillRect(x, groundY - 120, 150, 120);
  ctx.fillStyle = '#7e2318';
  poly(ctx, [[x - 12, groundY - 118], [x + 75, groundY - 168], [x + 162, groundY - 118]]);
  ctx.fillStyle = '#f7e8c9';
  ctx.fillRect(x + 55, groundY - 78, 40, 78);
  ctx.strokeStyle = '#7e2318';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + 55, groundY - 78);
  ctx.lineTo(x + 95, groundY);
  ctx.moveTo(x + 95, groundY - 78);
  ctx.lineTo(x + 55, groundY);
  ctx.stroke();
}

function drawFarmhouse(ctx, x, groundY) {
  if (x < -220 || x > 1000) return;
  ctx.fillStyle = '#e8d9b0';
  ctx.fillRect(x, groundY - 110, 190, 110);
  ctx.fillStyle = '#8a4a2b';
  poly(ctx, [[x - 14, groundY - 108], [x + 95, groundY - 152], [x + 204, groundY - 108]]);
  ctx.fillStyle = '#ffd76a';
  ctx.fillRect(x + 22, groundY - 84, 34, 34);
  ctx.fillRect(x + 128, groundY - 84, 34, 34);
  ctx.fillStyle = '#5d2f10';
  ctx.fillRect(x + 80, groundY - 62, 32, 62);
  // Chimney with a lazy curl of smoke.
  ctx.fillStyle = '#a83226';
  ctx.fillRect(x + 148, groundY - 168, 22, 44);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  circle(ctx, x + 162, groundY - 186, 9);
  circle(ctx, x + 170, groundY - 200, 12);
}

function drawPine(ctx, x, groundY, h) {
  ctx.fillStyle = '#3d5c2a';
  poly(ctx, [[x, groundY - h], [x - h * 0.32, groundY], [x + h * 0.32, groundY]]);
  poly(ctx, [[x, groundY - h * 0.78], [x - h * 0.26, groundY - h * 0.28], [x + h * 0.26, groundY - h * 0.28]]);
  ctx.fillStyle = '#5d3a1a';
  ctx.fillRect(x - 4, groundY - 12, 8, 12);
}

function drawHayBale(ctx, x, groundY) {
  ctx.fillStyle = '#d9a441';
  ellipse(ctx, x, groundY - 14, 34, 20);
  ctx.strokeStyle = '#a8762a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, groundY - 14, 22, 12, 0, 0, Math.PI * 2);
  ctx.stroke();
}

// ---------------------------------------------------------------- the turkey

export function drawTurkey(ctx, turkey, time) {
  if (turkey.hidden) return; // tucked inside the haystack
  const x = turkey.x;
  const y = turkey.y;
  const legSwing = Math.sin(turkey.runCycle) * (turkey.onGround ? 9 : 3);
  ctx.save();
  if (turkey.invulnerable && Math.floor(time * 12) % 2 === 0) ctx.globalAlpha = 0.35;

  // Tail fan: five autumn feathers fanning out behind.
  const tailColors = ['#d94f04', '#e8a020', '#a83226', '#e2701d', '#c96a2e'];
  ctx.save();
  ctx.translate(x - 16, y - 34);
  ctx.rotate(-0.25);
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate(-0.7 + i * 0.35);
    ctx.fillStyle = tailColors[i];
    ellipse(ctx, 0, -20, 7, 22);
    ctx.fillStyle = '#f7e8c9';
    ellipse(ctx, 0, -34, 3, 6);
    ctx.restore();
  }
  ctx.restore();

  // Legs, pumping while running, tucked while airborne.
  ctx.strokeStyle = '#e8a020';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  const legY = turkey.sliding ? y - 8 : y;
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 18);
  ctx.lineTo(x - 8 + legSwing, legY);
  ctx.moveTo(x + 6, y - 18);
  ctx.lineTo(x + 8 - legSwing, legY);
  ctx.stroke();

  // Body.
  const bodyY = turkey.sliding ? y - 16 : y - 30;
  ctx.fillStyle = '#8a5a2b';
  ellipse(ctx, x, bodyY, 24, turkey.sliding ? 13 : 19);
  ctx.fillStyle = '#a06a33';
  ellipse(ctx, x + 4, bodyY + 4, 17, 12);
  // Wing.
  ctx.fillStyle = '#6b4420';
  ellipse(ctx, x - 2, bodyY - 2, 13, 8);

  // Head, beak, wattle and a very worried eye.
  const headX = x + 20;
  const headY = turkey.sliding ? y - 26 : y - 52;
  ctx.fillStyle = '#8a5a2b';
  circle(ctx, headX, headY, 11);
  ctx.fillStyle = '#e8a020';
  poly(ctx, [[headX + 8, headY - 2], [headX + 20, headY + 2], [headX + 8, headY + 5]]);
  ctx.fillStyle = '#d94f04';
  ellipse(ctx, headX + 10, headY + 8, 4, 6);
  ctx.fillStyle = '#fff';
  circle(ctx, headX + 4, headY - 4, 3.5);
  ctx.fillStyle = '#1a1a1a';
  circle(ctx, headX + 5, headY - 4, 1.8);
  // Panic sweat drop when the farmer is close.
  if (turkey.stumbling) {
    ctx.fillStyle = '#9fd8ff';
    ellipse(ctx, headX - 8, headY - 14, 3, 5);
  }
  // A puff of dust on landing.
  if (turkey.justLanded) {
    ctx.fillStyle = 'rgba(200,160,110,0.8)';
    ellipse(ctx, x - 14, y - 2, 9, 4);
    ellipse(ctx, x + 14, y - 2, 8, 4);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- the farmer

export function drawFarmer(ctx, farmer, turkeyX, time) {
  const x = farmer.xOf(turkeyX);
  const y = GROUND_Y;
  if (x < -90 || x > 1050) return;
  const legSwing = Math.sin(farmer.runCycle) * 10;
  const searching = farmer.state === 'search';

  ctx.save();
  // Legs in blue overalls, mid-chase.
  ctx.strokeStyle = '#3a5a8a';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (searching) {
    ctx.moveTo(x - 4, y - 34);
    ctx.lineTo(x - 6, y);
    ctx.moveTo(x + 6, y - 34);
    ctx.lineTo(x + 8, y);
  } else {
    ctx.moveTo(x - 4, y - 34);
    ctx.lineTo(x - 8 + legSwing, y);
    ctx.moveTo(x + 6, y - 34);
    ctx.lineTo(x + 10 - legSwing, y);
  }
  ctx.stroke();

  // Overalls body and red shirt.
  ctx.fillStyle = '#c0392b';
  ellipse(ctx, x, y - 52, 17, 15);
  ctx.fillStyle = '#3a5a8a';
  ctx.fillRect(x - 14, y - 58, 28, 26);
  ctx.fillStyle = '#f7e8c9';
  circle(ctx, x - 8, y - 48, 2.5);
  circle(ctx, x + 8, y - 48, 2.5);

  // Arms: one pumping, one waving a pitchfork.
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x + 12, y - 58);
  ctx.lineTo(x + 26, y - 44 + (searching ? -14 : legSwing * 0.5));
  ctx.stroke();
  // Pitchfork.
  ctx.strokeStyle = '#8a6a3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 26, y - 30);
  ctx.lineTo(x + 38, y - 78);
  ctx.stroke();
  ctx.strokeStyle = '#c0c0c0';
  ctx.lineWidth = 2;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 38 + i * 5, y - 78);
    ctx.lineTo(x + 40 + i * 5, y - 90);
    ctx.stroke();
  }

  // Head: beard, nose, straw hat.
  ctx.fillStyle = '#f2c89b';
  circle(ctx, x, y - 76, 13);
  ctx.fillStyle = '#e8e8e8';
  ellipse(ctx, x, y - 66, 11, 7);
  ctx.fillStyle = '#f2c89b';
  circle(ctx, x + 12, y - 76, 3);
  ctx.fillStyle = '#1a1a1a';
  circle(ctx, x + 5, y - 79, 2);
  if (searching) {
    // Squinting into the hay.
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 2, y - 82);
    ctx.lineTo(x + 9, y - 82);
    ctx.stroke();
  }
  // Straw hat.
  ctx.fillStyle = '#e8c95a';
  ellipse(ctx, x, y - 86, 19, 5);
  poly(ctx, [[x - 11, y - 86], [x - 8, y - 98], [x + 8, y - 98], [x + 11, y - 86]]);
  ctx.fillStyle = '#a83226';
  ctx.fillRect(x - 11, y - 89, 22, 3);

  // Taunt bubble.
  if (farmer.taunt) {
    ctx.font = 'bold 15px Georgia, serif';
    const w = ctx.measureText(farmer.taunt).width + 18;
    ctx.fillStyle = '#fff8e0';
    ctx.strokeStyle = '#7a3b12';
    ctx.lineWidth = 2;
    const bx = Math.min(940 - w, Math.max(8, x - w / 2));
    const by = y - 128;
    ctx.beginPath();
    ctx.roundRect(bx, by, w, 26, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#7a3b12';
    ctx.fillText(farmer.taunt, bx + 9, by + 18);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- hazards

export function drawHazard(ctx, kind, x, roll, time) {
  const y = GROUND_Y;
  if (x < -120 || x > 1080) return;
  ctx.save();
  if (kind === 'fence') {
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(x - 18, y - 46, 6, 46);
    ctx.fillRect(x + 12, y - 46, 6, 46);
    ctx.fillStyle = '#a06a33';
    ctx.fillRect(x - 22, y - 40, 44, 7);
    ctx.fillRect(x - 22, y - 24, 44, 7);
    ctx.fillStyle = '#d94f04';
    poly(ctx, [[x - 18, y - 52], [x - 15, y - 46], [x - 21, y - 46]]);
    poly(ctx, [[x + 15, y - 52], [x + 18, y - 46], [x + 12, y - 46]]);
  } else if (kind === 'pumpkin') {
    ctx.save();
    ctx.translate(x, y - 16);
    ctx.rotate(roll);
    ctx.fillStyle = '#e2701d';
    ellipse(ctx, 0, 0, 18, 15);
    ctx.strokeStyle = '#b3500f';
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.ellipse(0, 0, 10 + Math.abs(i) * 4, 15, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#3d5c2a';
    ctx.fillRect(-2, -20, 4, 7);
    ctx.restore();
  } else if (kind === 'pitchfork') {
    ctx.strokeStyle = '#8a6a3a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 46);
    ctx.stroke();
    ctx.strokeStyle = '#d8d8d8';
    ctx.lineWidth = 2.5;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 7, y - 46);
      ctx.lineTo(x + i * 8, y - 58);
      ctx.stroke();
    }
  } else if (kind === 'knife') {
    // A giant carving knife stuck blade-up in the dirt.
    ctx.save();
    ctx.translate(x, y - 30);
    ctx.rotate(0.12);
    ctx.fillStyle = '#c0c0c0';
    poly(ctx, [[-4, -28], [4, -28], [7, 12], [-7, 12]]);
    ctx.fillStyle = '#5d2f10';
    ctx.fillRect(-5, 12, 10, 18);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-1, -24, 2, 30);
    ctx.restore();
  } else if (kind === 'oven') {
    // A roaring farmhouse oven, door open, heat shimmering.
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(x - 48, y - 74, 96, 74);
    ctx.fillStyle = '#6b6b6b';
    ctx.fillRect(x - 48, y - 74, 96, 10);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x - 34, y - 58, 68, 46);
    const flick = Math.sin(time * 14) * 4;
    ctx.fillStyle = '#ff7b1c';
    poly(ctx, [[x - 28, y - 14], [x - 14, y - 52 + flick], [x - 2, y - 14]]);
    ctx.fillStyle = '#ffd76a';
    poly(ctx, [[x + 2, y - 14], [x + 14, y - 48 - flick], [x + 28, y - 14]]);
    ctx.fillStyle = '#c0c0c0';
    circle(ctx, x + 36, y - 66, 3);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.fillText('HOT!', x - 40, y - 80);
  } else if (kind === 'mud') {
    ctx.fillStyle = '#6b4420';
    ellipse(ctx, x, y - 4, 38, 6);
    ctx.fillStyle = '#8a5a2b';
    ellipse(ctx, x - 10, y - 5, 14, 3);
    ellipse(ctx, x + 12, y - 5, 10, 3);
  }
  ctx.restore();
}

export function drawPickup(ctx, kind, x, y, time) {
  const bob = Math.sin(time * 4 + x * 0.05) * 4;
  const yy = y + bob;
  ctx.save();
  if (kind === 'corn') {
    ctx.fillStyle = '#2f7a2f';
    ellipse(ctx, x, yy, 6, 12);
    ctx.fillStyle = '#ffd76a';
    ellipse(ctx, x, yy - 2, 7, 12);
    ctx.fillStyle = '#e8a020';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(x - 5, yy - 10 + i * 7, 10, 2);
    }
  } else if (kind === 'feather') {
    ctx.fillStyle = '#ffd76a';
    ctx.save();
    ctx.translate(x, yy);
    ctx.rotate(0.5);
    ellipse(ctx, 0, 0, 6, 16);
    ctx.fillStyle = '#d94f04';
    ellipse(ctx, 0, -8, 3, 8);
    ctx.restore();
    ctx.fillStyle = 'rgba(255,215,106,0.5)';
    circle(ctx, x, yy, 20 + Math.sin(time * 5) * 3);
  } else if (kind === 'pie') {
    ctx.fillStyle = '#c98f4e';
    ellipse(ctx, x, yy + 4, 16, 7);
    ctx.fillStyle = '#a83226';
    ellipse(ctx, x, yy + 1, 13, 6);
    ctx.strokeStyle = '#e8c95a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 12, yy - 2);
    ctx.lineTo(x + 12, yy - 2);
    ctx.moveTo(x - 12, yy + 2);
    ctx.lineTo(x + 12, yy + 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawHaystack(ctx, x, w, hiddenInside, time) {
  const y = GROUND_Y;
  ctx.save();
  ctx.fillStyle = '#d9a441';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + w / 2, y - 74, x + w, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#a8762a';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const hx = x + 8 + i * ((w - 16) / 4);
    ctx.beginPath();
    ctx.moveTo(hx, y - 8);
    ctx.quadraticCurveTo(hx + 4, y - 40, hx - 2, y - 58);
    ctx.stroke();
  }
  if (hiddenInside) {
    // Rustling hay and a single suspicious feather poking out.
    const rustle = Math.sin(time * 9) * 2;
    ctx.fillStyle = '#d94f04';
    ellipse(ctx, x + w / 2 + rustle, y - 62, 5, 11);
    ctx.fillStyle = '#7a3b12';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.fillText('...', x + w / 2 - 8, y - 74);
  } else {
    ctx.fillStyle = '#7a3b12';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.fillText('HAY — press ↓ to hide', x - 8, y - 66);
  }
  ctx.restore();
}

export function drawThrownKnife(ctx, knife) {
  ctx.save();
  ctx.translate(knife.x, knife.y);
  ctx.rotate(knife.spin);
  ctx.fillStyle = '#c0c0c0';
  poly(ctx, [[-16, -3], [8, -3], [16, 0], [8, 3], [-16, 3]]);
  ctx.fillStyle = '#5d2f10';
  ctx.fillRect(-24, -3, 9, 6);
  ctx.restore();
}
