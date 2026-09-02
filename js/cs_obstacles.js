/**
 * COLOR PULSE: SPACE ODYSSEY - Themed Obstacles & Collectibles
 *
 * Each map has UNIQUE obstacle geometry that matches its visual theme:
 *   cyber   → Hexagonal rotating shields, circuit-board cross
 *   sunset  → Wavy sine-arc rings, retro grid slabs
 *   galaxy  → Planetary orbital rings with satellites, asteroid belt
 *   lava    → Jagged lava gears, molten drip bars
 *   frost   → Snowflake crystal spinners, ice shard shuriken
 *
 * Color Switcher orbs are replaced by map-unique collectibles.
 */

// roundRect polyfill for older browsers / Safari
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    const rr = Math.min(r, w/2, h/2);
    this.beginPath();
    this.moveTo(x + rr, y);
    this.lineTo(x + w - rr, y); this.arcTo(x + w, y, x + w, y + rr, rr);
    this.lineTo(x + w, y + h - rr); this.arcTo(x + w, y + h, x + w - rr, y + h, rr);
    this.lineTo(x + rr, y + h); this.arcTo(x, y + h, x, y + h - rr, rr);
    this.lineTo(x, y + rr); this.arcTo(x, y, x + rr, y, rr);
    this.closePath();
    return this;
  };
}

function normalizeAngle(a) {
  a = a % (Math.PI * 2);
  return a < 0 ? a + Math.PI * 2 : a;
}

// Draw a regular polygon (for hexagon, etc.)
function drawPolygon(ctx, x, y, sides, radius, rotation = 0) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = rotation + (i * Math.PI * 2) / sides;
    i === 0 ? ctx.moveTo(x + Math.cos(a) * radius, y + Math.sin(a) * radius)
             : ctx.lineTo(x + Math.cos(a) * radius, y + Math.sin(a) * radius);
  }
  ctx.closePath();
}

// ============================================================
// BASE RING OBSTACLE — 4-color segmented ring (used as fallback)
// ============================================================
class RingObstacle {
  constructor(y, radius, thickness, speed, colors, centerX, mapId = 'cyber') {
    this.y = y;
    this.x = centerX;
    this.radius = radius;
    this.thickness = thickness;
    this.speed = speed;
    this.angle = 0;
    this.colors = colors;
    this.mapId = mapId;
    this.passed = false;
  }
  update(sm = 1) { this.angle += this.speed * sm; }

  draw(ctx, cameraY) {
    const cy = this.y - cameraY;
    const drawFn = MAP_RING_DRAWERS[this.mapId] || MAP_RING_DRAWERS.cyber;
    drawFn(ctx, this.x, cy, this.radius, this.thickness, this.angle, this.colors);
  }

  checkCollision(ball) {
    const dist = Math.hypot(ball.x - this.x, ball.y - this.y);
    const t = this.thickness / 2 + ball.radius * 0.72;
    if (dist >= this.radius - t && dist <= this.radius + t) {
      const rel = normalizeAngle(Math.atan2(ball.y - this.y, ball.x - this.x) - this.angle);
      const seg = Math.floor(rel / (Math.PI / 2)) % 4;
      const c = this.colors[seg % this.colors.length];
      if (c !== ball.color) return { hit: true };
    }
    return { hit: false };
  }
}

// ============================================================
// MAP-SPECIFIC RING DRAWERS — unique geometry per theme
// ============================================================
const MAP_RING_DRAWERS = {

  // CYBER: Hexagonal shield panels rotating
  cyber(ctx, cx, cy, radius, thick, angle, colors) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    const segAngle = (Math.PI * 2) / 4;
    for (let i = 0; i < 4; i++) {
      const color = colors[i % colors.length];
      const a1 = i * segAngle + 0.08;
      const a2 = (i + 1) * segAngle - 0.08;

      // Draw hex-faceted arc using straight-line chords
      ctx.beginPath();
      const steps = 5;
      for (let s = 0; s <= steps; s++) {
        const a = a1 + (a2 - a1) * (s / steps);
        const r = radius + Math.cos(s * Math.PI / steps) * (thick * 0.3); // faceted bulge
        s === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
                : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      // Close inner edge
      for (let s = steps; s >= 0; s--) {
        const a = a1 + (a2 - a1) * (s / steps);
        const ri = radius - thick * 0.5;
        ctx.lineTo(Math.cos(a) * ri, Math.sin(a) * ri);
      }
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      ctx.fill();

      // Neon circuit etch on each panel
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.stroke();
    }
    ctx.restore();
  },

  // SUNSET VAPORWAVE: Wavy sine-curve ring segments
  sunset(ctx, cx, cy, radius, thick, angle, colors) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    const segCount = 4;
    const waveAmp = thick * 0.35;
    const waveFreq = 3;

    for (let i = 0; i < segCount; i++) {
      const color = colors[i % colors.length];
      const a1 = i * (Math.PI * 2 / segCount) + 0.1;
      const a2 = (i + 1) * (Math.PI * 2 / segCount) - 0.1;

      ctx.beginPath();
      const steps = 20;
      // Outer wavy edge
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const a = a1 + (a2 - a1) * t;
        const wave = Math.sin(t * Math.PI * waveFreq) * waveAmp;
        const r = radius + wave;
        s === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
                : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      // Inner wavy edge (reversed)
      for (let s = steps; s >= 0; s--) {
        const t = s / steps;
        const a = a1 + (a2 - a1) * t;
        const wave = Math.sin(t * Math.PI * waveFreq + Math.PI) * waveAmp;
        const ri = radius - thick * 0.5 + wave;
        ctx.lineTo(Math.cos(a) * ri, Math.sin(a) * ri);
      }
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      ctx.fill();

      // Retro scanline shimmer
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1.2;
      ctx.shadowBlur = 0;
      ctx.stroke();
    }
    ctx.restore();
  },

  // GALAXY: Planetary orbital ring with small satellite dots at segment joints
  galaxy(ctx, cx, cy, radius, thick, angle, colors) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Main orbital band
    for (let i = 0; i < 4; i++) {
      const color = colors[i % colors.length];
      const a1 = i * (Math.PI / 2) + 0.05;
      const a2 = (i + 1) * (Math.PI / 2) - 0.05;
      ctx.beginPath();
      ctx.arc(0, 0, radius, a1, a2);
      ctx.strokeStyle = color;
      ctx.lineWidth = thick;
      ctx.lineCap = 'round';
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.stroke();

      // Inner highlight streak
      ctx.beginPath();
      ctx.arc(0, 0, radius, a1 + 0.08, a2 - 0.08);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = thick * 0.25;
      ctx.shadowBlur = 0;
      ctx.stroke();
    }

    // Satellite dots at the 4 joints
    for (let i = 0; i < 4; i++) {
      const a = i * (Math.PI / 2);
      const color = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(Math.cos(a) * radius, Math.sin(a) * radius, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fill();
    }
    ctx.restore();
  },

  // LAVA: Jagged gear-tooth ring segments (like a molten gear)
  lava(ctx, cx, cy, radius, thick, angle, colors) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    for (let i = 0; i < 4; i++) {
      const color = colors[i % colors.length];
      const baseA = i * (Math.PI / 2);
      const endA = (i + 1) * (Math.PI / 2);
      const teeth = 4;

      ctx.beginPath();
      for (let t = 0; t <= teeth; t++) {
        const frac = t / teeth;
        const a = baseA + (endA - baseA) * frac + 0.06;
        const isOuter = t % 2 === 0;
        const r = isOuter ? radius + thick * 0.55 : radius;
        t === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
                : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      // Return on inner edge
      for (let t = teeth; t >= 0; t--) {
        const frac = t / teeth;
        const a = baseA + (endA - baseA) * frac + 0.06;
        const ri = radius - thick * 0.45;
        ctx.lineTo(Math.cos(a) * ri, Math.sin(a) * ri);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
      ctx.fill();

      // Molten glow crack
      ctx.strokeStyle = '#fff7ed';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.stroke();
    }
    ctx.restore();
  },

  // FROST: Snowflake crystal arms — 4 segments as ice crystal blades
  frost(ctx, cx, cy, radius, thick, angle, colors) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    for (let i = 0; i < 4; i++) {
      const color = colors[i % colors.length];
      const a1 = i * (Math.PI / 2) + 0.06;
      const a2 = (i + 1) * (Math.PI / 2) - 0.06;
      const steps = 14;

      ctx.beginPath();
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const a = a1 + (a2 - a1) * t;
        // Ice crystal: alternating spike inward/outward
        const spike = (s % 2 === 0) ? 0 : thick * 0.4;
        const r = radius + spike;
        s === 0 ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
                : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      for (let s = steps; s >= 0; s--) {
        const t = s / steps;
        const a = a1 + (a2 - a1) * t;
        const ri = radius - thick * 0.5;
        ctx.lineTo(Math.cos(a) * ri, Math.sin(a) * ri);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.stroke();
    }
    ctx.restore();
  }
};

// ============================================================
// MAP-SPECIFIC CROSS DRAWERS
// ============================================================
const MAP_CROSS_DRAWERS = {
  cyber(ctx, cx, cy, armLen, thick, angle, colors) {
    // Circuit-board cross: arms with right-angle elbows
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
    for (let i = 0; i < 4; i++) {
      ctx.save(); ctx.rotate(i * Math.PI / 2);
      const color = colors[i % colors.length];
      const notchAt = armLen * 0.55;
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 14;
      // Main arm
      ctx.beginPath(); ctx.roundRect(0, -thick/2, armLen, thick, 3); ctx.fill();
      // Perpendicular circuit node
      ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(notchAt, 0, thick * 0.28, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
    // Center hub
    ctx.fillStyle = '#0f172a'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.5;
    ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.restore();
  },

  sunset(ctx, cx, cy, armLen, thick, angle, colors) {
    // Retro-wave: wavy arms like VHS tape reels
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
    for (let i = 0; i < 4; i++) {
      ctx.save(); ctx.rotate(i * Math.PI / 2);
      const color = colors[i % colors.length];
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 12;
      // Arm with wavy top
      ctx.beginPath();
      ctx.moveTo(0, -thick/2);
      for (let s = 0; s <= 12; s++) {
        const x = (s / 12) * armLen;
        const y = -thick/2 + Math.sin((s/12)*Math.PI*3) * (thick*0.22);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(armLen, thick/2); ctx.lineTo(0, thick/2); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#2a0a3a'; ctx.strokeStyle = '#ff007f'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx-cx, 0, 12, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.restore();
  },

  galaxy(ctx, cx, cy, armLen, thick, angle, colors) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
    for (let i = 0; i < 4; i++) {
      ctx.save(); ctx.rotate(i * Math.PI / 2);
      const color = colors[i % colors.length];
      // Tapered arm (wider at base, pointed tip)
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(0, -thick/2);
      ctx.quadraticCurveTo(armLen*0.4, -thick*0.7, armLen, 0);
      ctx.quadraticCurveTo(armLen*0.4, thick*0.7, 0, thick/2);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#060a1a'; ctx.strokeStyle = '#facc15'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.restore();
  },

  lava(ctx, cx, cy, armLen, thick, angle, colors) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
    for (let i = 0; i < 4; i++) {
      ctx.save(); ctx.rotate(i * Math.PI / 2);
      const color = colors[i % colors.length];
      // Jagged drip arm
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.moveTo(0, -thick/2);
      const drips = 5;
      for (let d = 0; d <= drips; d++) {
        const x = (d/drips) * armLen;
        const yDrip = -thick/2 - (d%2===0 ? thick*0.5 : 0);
        ctx.lineTo(x, yDrip);
      }
      ctx.lineTo(armLen, thick/2); ctx.lineTo(0, thick/2); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#3b0808'; ctx.strokeStyle = '#f97316'; ctx.lineWidth = 3;
    ctx.shadowColor = '#f97316'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.restore();
  },

  frost(ctx, cx, cy, armLen, thick, angle, colors) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
    for (let i = 0; i < 4; i++) {
      ctx.save(); ctx.rotate(i * Math.PI / 2);
      const color = colors[i % colors.length];
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 14;
      // Shard/shuriken arm
      ctx.beginPath();
      ctx.moveTo(0, -thick/2);
      ctx.lineTo(armLen * 0.6, -thick * 0.7);
      ctx.lineTo(armLen, 0);
      ctx.lineTo(armLen * 0.6, thick * 0.7);
      ctx.lineTo(0, thick/2);
      ctx.closePath(); ctx.fill();
      // Ice highlight
      ctx.strokeStyle = '#e0f2fe'; ctx.lineWidth = 1; ctx.shadowBlur = 0; ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = '#0c1f3b'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
};

// ============================================================
// 1. CIRCLE OBSTACLE  (map-themed ring)
// ============================================================
class CircleObstacle {
  constructor(y, radius = 100, thickness = 14, speed = 0.022, colors = [], centerX = 480, mapId = 'cyber') {
    this.type = 'circle'; this.y = y; this.x = centerX;
    this.radius = radius; this.thickness = thickness;
    this.speed = speed; this.angle = 0;
    this.colors = colors; this.mapId = mapId; this.passed = false;
  }
  update(sm = 1) { this.angle += this.speed * sm; }

  draw(ctx, cameraY) {
    const cy = this.y - cameraY;
    const fn = MAP_RING_DRAWERS[this.mapId] || MAP_RING_DRAWERS.cyber;
    fn(ctx, this.x, cy, this.radius, this.thickness, this.angle, this.colors);
  }

  checkCollision(ball) {
    const dist = Math.hypot(ball.x - this.x, ball.y - this.y);
    const t = this.thickness / 2 + ball.radius * 0.72;
    if (dist >= this.radius - t && dist <= this.radius + t) {
      const rel = normalizeAngle(Math.atan2(ball.y - this.y, ball.x - this.x) - this.angle);
      const seg = Math.floor(rel / (Math.PI / 2)) % 4;
      if (this.colors[seg % this.colors.length] !== ball.color) return { hit: true };
    }
    return { hit: false };
  }
}

// ============================================================
// 2. DOUBLE CIRCLE OBSTACLE (two concentric themed rings)
// ============================================================
class DoubleCircleObstacle {
  constructor(y, outerR = 118, innerR = 74, thickness = 13, speed = 0.02, colors = [], centerX = 480, mapId = 'cyber') {
    this.type = 'double_circle'; this.y = y; this.x = centerX;
    this.outerR = outerR; this.innerR = innerR; this.thickness = thickness;
    this.speed = speed; this.angleOuter = 0; this.angleInner = 0;
    this.colors = colors; this.mapId = mapId; this.passed = false;
  }
  update(sm = 1) {
    this.angleOuter += this.speed * sm;
    this.angleInner -= this.speed * 1.3 * sm;
  }
  draw(ctx, cameraY) {
    const cy = this.y - cameraY;
    const fn = MAP_RING_DRAWERS[this.mapId] || MAP_RING_DRAWERS.cyber;
    fn(ctx, this.x, cy, this.outerR, this.thickness, this.angleOuter, this.colors);
    fn(ctx, this.x, cy, this.innerR, this.thickness * 0.85, this.angleInner, this.colors);
  }
  checkCollision(ball) {
    const dist = Math.hypot(ball.x - this.x, ball.y - this.y);
    const t = this.thickness / 2 + ball.radius * 0.72;
    for (const [r, a] of [[this.outerR, this.angleOuter], [this.innerR, this.angleInner]]) {
      if (dist >= r - t && dist <= r + t) {
        const rel = normalizeAngle(Math.atan2(ball.y - this.y, ball.x - this.x) - a);
        const seg = Math.floor(rel / (Math.PI / 2)) % 4;
        if (this.colors[seg % this.colors.length] !== ball.color) return { hit: true };
      }
    }
    return { hit: false };
  }
}

// ============================================================
// 3. CROSS OBSTACLE (map-themed spinning arms)
// ============================================================
class CrossObstacle {
  constructor(y, armLen = 130, thickness = 15, speed = 0.022, colors = [], centerX = 480, mapId = 'cyber') {
    this.type = 'cross'; this.y = y; 
    // Geser lebih jauh ke kiri sehingga bintang (di centerX) berada di 1/5 ujung baling-baling
    this.x = centerX - 104;
    this.armLen = armLen; this.thickness = thickness;
    this.speed = speed; this.angle = 0;
    this.colors = colors; this.mapId = mapId; this.passed = false;
  }
  update(sm = 1) { this.angle += this.speed * sm; }
  draw(ctx, cameraY) {
    const cy = this.y - cameraY;
    const fn = MAP_CROSS_DRAWERS[this.mapId] || MAP_CROSS_DRAWERS.cyber;
    fn(ctx, this.x, cy, this.armLen, this.thickness, this.angle, this.colors);
  }
  checkCollision(ball) {
    const dist = Math.hypot(ball.x - this.x, ball.y - this.y);
    if (dist > this.armLen + ball.radius) return { hit: false };
    const relA = normalizeAngle(Math.atan2(ball.y - this.y, ball.x - this.x) - this.angle);
    for (let i = 0; i < 4; i++) {
      const armA = i * Math.PI / 2;
      let diff = Math.abs(normalizeAngle(relA - armA));
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      const perp = dist * Math.sin(diff);
      const along = dist * Math.cos(diff);
      if (along >= 0 && along <= this.armLen + ball.radius && perp <= this.thickness / 2 + ball.radius * 0.72) {
        if (this.colors[i % this.colors.length] !== ball.color) return { hit: true };
      }
    }
    return { hit: false };
  }
}

// ============================================================
// 4. SQUARE OBSTACLE (extruded, themed corners)
// ============================================================
class SquareObstacle {
  constructor(y, size = 155, thickness = 14, speed = 0.018, colors = [], centerX = 480, mapId = 'cyber') {
    this.type = 'square'; this.y = y; this.x = centerX;
    this.size = size; this.thickness = thickness;
    this.speed = speed; this.angle = 0;
    this.colors = colors; this.mapId = mapId; this.passed = false;
  }
  update(sm = 1) { this.angle += this.speed * sm; }
  draw(ctx, cameraY) {
    const cy = this.y - cameraY;
    const half = this.size / 2;
    ctx.save(); ctx.translate(this.x, cy); ctx.rotate(this.angle);
    const edges = [
      [-half,-half, half,-half],
      [half,-half,  half, half],
      [half, half, -half, half],
      [-half,half, -half,-half]
    ];
    edges.forEach(([x1,y1,x2,y2], i) => {
      const color = this.colors[i % this.colors.length];
      ctx.strokeStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 14;
      ctx.lineWidth = this.thickness; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      // Map-specific: add corner accent dots for cyber map
      if (this.mapId === 'cyber') {
        ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(x1, y1, 3.5, 0, Math.PI*2); ctx.fill();
      }
      ctx.lineWidth = this.thickness * 0.3; ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.moveTo(x1*0.86,y1*0.86); ctx.lineTo(x2*0.86,y2*0.86); ctx.stroke();
    });
    ctx.restore();
  }
  checkCollision(ball) {
    const dx = ball.x - this.x, dy = ball.y - this.y;
    const cos = Math.cos(-this.angle), sin = Math.sin(-this.angle);
    const lx = dx*cos - dy*sin, ly = dx*sin + dy*cos;
    const half = this.size / 2, r = ball.radius * 0.72 + this.thickness / 2;
    if (Math.abs(ly+half)<=r && lx>=-half-r && lx<=half+r && this.colors[0]!==ball.color) return{hit:true};
    if (Math.abs(lx-half)<=r && ly>=-half-r && ly<=half+r && this.colors[1]!==ball.color) return{hit:true};
    if (Math.abs(ly-half)<=r && lx>=-half-r && lx<=half+r && this.colors[2]!==ball.color) return{hit:true};
    if (Math.abs(lx+half)<=r && ly>=-half-r && ly<=half+r && this.colors[3]!==ball.color) return{hit:true};
    return { hit: false };
  }
}

// ============================================================
// 5. FULL-SCREEN CONVEYOR (edge-to-edge themed laser beams)
// ============================================================
class SlidingBarsObstacle {
  constructor(y, colors = [], speed = 2.4, centerX = 480, screenWidth = 960, mapId = 'cyber') {
    this.type = 'sliding_bars'; this.y = y; this.x = centerX;
    this.colors = colors; this.speed = speed; this.offset = 0;
    this.barWidth = 160; this.thickness = 18;
    this.screenWidth = screenWidth; this.mapId = mapId; this.passed = false;
  }
  update(sm = 1) { this.offset = (this.offset + this.speed * sm) % (this.barWidth * 4); }
  draw(ctx, cameraY) {
    const cy = this.y - cameraY;
    ctx.save();
    // Rail guides
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, cy - this.thickness/2 - 4); ctx.lineTo(this.screenWidth, cy - this.thickness/2 - 4);
    ctx.moveTo(0, cy + this.thickness/2 + 4); ctx.lineTo(this.screenWidth, cy + this.thickness/2 + 4);
    ctx.stroke();

    const count = Math.ceil(this.screenWidth / this.barWidth) + 8;
    for (let i = -8; i < count; i++) {
      const color = this.colors[(i + 40) % 4];
      const bx = i * this.barWidth + this.offset - this.barWidth;

      // Map-specific visual treatment
      if (this.mapId === 'lava') {
        // Dripping lava segments with irregular bottom edge
        ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.rect(bx, cy - this.thickness/2, this.barWidth - 4, this.thickness);
        ctx.fill();
        // Lava drip
        ctx.beginPath();
        ctx.arc(bx + this.barWidth*0.3, cy + this.thickness/2, 4, 0, Math.PI*2);
        ctx.fill();
      } else if (this.mapId === 'frost') {
        // Ice panel with jagged top edge
        ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(bx, cy - this.thickness/2);
        for (let s = 0; s <= 6; s++) {
          const sx = bx + (s/6)*(this.barWidth-4);
          const sy = cy - this.thickness/2 - (s%2===0 ? 4 : 0);
          ctx.lineTo(sx, sy);
        }
        ctx.lineTo(bx + this.barWidth-4, cy + this.thickness/2);
        ctx.lineTo(bx, cy + this.thickness/2);
        ctx.closePath(); ctx.fill();
      } else if (this.mapId === 'galaxy') {
        // Star-field panel with dots
        ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 14;
        ctx.fillRect(bx, cy - this.thickness/2, this.barWidth-4, this.thickness);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        for (let d = 0; d < 3; d++) {
          ctx.beginPath();
          ctx.arc(bx + (d+1)*((this.barWidth-4)/4), cy, 1.5, 0, Math.PI*2);
          ctx.fill();
        }
      } else {
        // Default clean panel
        ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 14;
        ctx.fillRect(bx, cy - this.thickness/2, this.barWidth-4, this.thickness);
      }

      // Core highlight
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.shadowBlur = 0;
      ctx.fillRect(bx+4, cy-2, this.barWidth-12, 4);
    }
    ctx.restore();
  }
  checkCollision(ball) {
    if (Math.abs(ball.y - this.y) <= this.thickness/2 + ball.radius*0.72) {
      const relX = ball.x - (this.offset - this.barWidth);
      const idx = Math.floor(relX / this.barWidth);
      if (this.colors[(idx+40)%4] !== ball.color) return { hit: true };
    }
    return { hit: false };
  }
}

// ============================================================
// 6. MAP-UNIQUE COLOR SWITCHERS (replace plain orb)
// ============================================================
class ColorSwitchOrb {
  constructor(y, x = 480, colors = [], mapId = 'cyber') {
    this.x = x; this.y = y; this.radius = 18;
    this.colors = colors; this.mapId = mapId;
    this.collected = false; this.rot = 0; this.pulse = 0;
  }
  update() { this.rot += 0.04; this.pulse += 0.07; }
  draw(ctx, cameraY) {
    if (this.collected) return;
    const sy = this.y - cameraY;
    const fn = MAP_SWITCHER_DRAWERS[this.mapId] || MAP_SWITCHER_DRAWERS.cyber;
    fn(ctx, this.x, sy, this.radius, this.colors, this.rot, this.pulse);
  }
  checkCollision(ball) {
    if (this.collected) return false;
    const dist = Math.hypot(ball.x - this.x, ball.y - this.y);
    if (dist <= this.radius + ball.radius) { this.collected = true; return true; }
    return false;
  }
}

const MAP_SWITCHER_DRAWERS = {
  // CYBER: Holographic Data Prism (spinning triangle)
  cyber(ctx, x, y, r, colors, rot, pulse) {
    ctx.save(); ctx.translate(x, y);
    // Outer glow ring
    ctx.strokeStyle = '#00f5d4'; ctx.lineWidth = 2;
    ctx.shadowColor = '#00f5d4'; ctx.shadowBlur = 16 + Math.sin(pulse)*4;
    ctx.beginPath(); ctx.arc(0, 0, r+5, 0, Math.PI*2); ctx.stroke();
    // Spinning prism
    ctx.rotate(rot);
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate(i * Math.PI * 2/3);
      ctx.fillStyle = colors[i % colors.length];
      ctx.shadowColor = colors[i % colors.length]; ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0,0); ctx.lineTo(r*0.9, 0); ctx.lineTo(r*0.45, -r*0.78); ctx.closePath();
      ctx.fill(); ctx.restore();
    }
    ctx.restore();
  },

  // SUNSET: Retro CD / Rainbow Disc
  sunset(ctx, x, y, r, colors, rot, pulse) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const grad = ctx.createConicalGradient ? null : null;
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.shadowColor = colors[i % colors.length]; ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0,0); ctx.arc(0,0,r, i*Math.PI/2, (i+1)*Math.PI/2); ctx.closePath();
      ctx.fill();
    }
    // CD hole
    ctx.fillStyle = '#160924'; ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(0,0,r*0.3,0,Math.PI*2); ctx.fill();
    // Sheen ring
    ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(0,0,r*0.6,0,Math.PI*2); ctx.stroke();
    ctx.restore();
  },

  // GALAXY: Black Hole Vortex
  galaxy(ctx, x, y, r, colors, rot, pulse) {
    ctx.save(); ctx.translate(x, y);
    // Accretion disk
    const scale = 1 + Math.sin(pulse)*0.08;
    for (let ring = 3; ring >= 1; ring--) {
      ctx.beginPath();
      ctx.arc(0,0, r*0.35*ring*scale, 0, Math.PI*2);
      ctx.strokeStyle = colors[(ring-1) % colors.length];
      ctx.lineWidth = 3; ctx.shadowColor = colors[(ring-1)%colors.length]; ctx.shadowBlur = 10;
      ctx.stroke();
    }
    // Event horizon
    ctx.fillStyle = '#000000'; ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(0,0,r*0.32,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath(); ctx.arc(0,0,4,0,Math.PI*2); ctx.fill();
    ctx.restore();
  },

  // LAVA: Molten Core Crystal Gem
  lava(ctx, x, y, r, colors, rot, pulse) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    // Gem facets (diamond shape)
    const facets = [
      [0, -r, r*0.8, -r*0.3, 0, r*0.5],
      [0, -r, -r*0.8, -r*0.3, 0, r*0.5]
    ];
    facets.forEach((pts, i) => {
      ctx.fillStyle = colors[i%colors.length]; ctx.shadowColor=colors[i%colors.length]; ctx.shadowBlur=16+Math.sin(pulse)*4;
      ctx.beginPath(); ctx.moveTo(pts[0],pts[1]); ctx.lineTo(pts[2],pts[3]); ctx.lineTo(pts[4],pts[5]); ctx.closePath();
      ctx.fill();
    });
    // Inner glow
    ctx.fillStyle='rgba(255,200,50,0.6)'; ctx.shadowBlur=0;
    ctx.beginPath(); ctx.arc(0,0,r*0.25,0,Math.PI*2); ctx.fill();
    ctx.restore();
  },

  // FROST: Ice Nova Star (snowflake burst)
  frost(ctx, x, y, r, colors, rot, pulse) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot + pulse*0.2);
    // 6 ice arms
    for (let i = 0; i < 6; i++) {
      ctx.save(); ctx.rotate(i * Math.PI/3);
      const color = colors[i%colors.length];
      ctx.fillStyle = color; ctx.shadowColor=color; ctx.shadowBlur=12;
      // Crystal arm shape
      ctx.beginPath();
      ctx.moveTo(0, -2); ctx.lineTo(r*0.7, -3); ctx.lineTo(r*0.9, 0);
      ctx.lineTo(r*0.7, 3); ctx.lineTo(0, 2); ctx.closePath();
      ctx.fill();
      // Sub-branches
      ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.shadowBlur=0;
      ctx.beginPath(); ctx.arc(r*0.45, 0, 2.5, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle='#e0f2fe';
    ctx.beginPath(); ctx.arc(0,0,5,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
};

// ============================================================
// 7. STAR COLLECTIBLE
// ============================================================
class StarItem {
  constructor(y, x = 480) {
    this.x = x; this.y = y; this.radius = 14;
    this.collected = false; this.rot = 0;
  }
  update() { this.rot += 0.04; }
  draw(ctx, cameraY) {
    if (this.collected) return;
    const sy = this.y - cameraY;
    ctx.save(); ctx.translate(this.x, sy); ctx.rotate(this.rot);
    ctx.fillStyle = '#fee440'; ctx.shadowColor = '#fee440'; ctx.shadowBlur = 16;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a1 = (i*Math.PI*2/5) - Math.PI/2;
      const a2 = a1 + Math.PI/5;
      ctx.lineTo(Math.cos(a1)*this.radius, Math.sin(a1)*this.radius);
      ctx.lineTo(Math.cos(a2)*(this.radius*0.48), Math.sin(a2)*(this.radius*0.48));
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 0;
    ctx.beginPath(); ctx.arc(0,0,this.radius*0.28,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
  checkCollision(ball) {
    if (this.collected) return false;
    if (Math.hypot(ball.x-this.x, ball.y-this.y) <= this.radius+ball.radius) { this.collected=true; return true; }
    return false;
  }
}

// ============================================================
// 8. FINISH GATE
// ============================================================
class FinishGate {
  constructor(y, x = 480, mapId = 'cyber') {
    this.x = x; this.y = y; this.radius = 45;
    this.rot = 0; this.passed = false; this.mapId = mapId;
  }
  update() { this.rot += 0.02; }
  draw(ctx, cameraY) {
    const sy = this.y - cameraY;
    ctx.save(); ctx.translate(this.x, sy); ctx.rotate(this.rot);
    
    if (this.mapId === 'lava') {
      ctx.fillStyle = '#ea580c'; ctx.shadowColor = '#ea580c'; ctx.shadowBlur = 30;
      ctx.beginPath(); ctx.arc(0,0,this.radius,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#7c2d12'; ctx.beginPath(); ctx.arc(-10,-10,8,0,Math.PI*2); ctx.fill();
    } else if (this.mapId === 'frost') {
      ctx.fillStyle = '#0284c7'; ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 30;
      ctx.beginPath(); ctx.arc(0,0,this.radius,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#e0f2fe'; ctx.beginPath(); ctx.moveTo(-20,0); ctx.lineTo(0,-20); ctx.lineTo(20,0); ctx.lineTo(0,20); ctx.fill();
    } else if (this.mapId === 'galaxy') {
      ctx.fillStyle = '#4c1d95'; ctx.shadowColor = '#8b5cf6'; ctx.shadowBlur = 30;
      ctx.beginPath(); ctx.arc(0,0,this.radius,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = '#c4b5fd'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0,0,this.radius+15,10,Math.PI/6,0,Math.PI*2); ctx.stroke();
    } else {
      ctx.fillStyle = '#0f172a'; ctx.strokeStyle = '#00f5d4'; ctx.shadowColor = '#00f5d4'; ctx.shadowBlur = 20; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0,0,this.radius,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#00f5d4'; ctx.fillRect(-15, -15, 12, 12); ctx.fillRect(3, 3, 12, 12);
    }
    
    ctx.restore();
  }
  checkCollision(ball) {
    if (this.passed) return false;
    if (Math.hypot(ball.x-this.x, ball.y-this.y) <= this.radius+ball.radius) { this.passed=true; return true; }
    return false;
  }
}
