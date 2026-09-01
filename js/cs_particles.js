/**
 * COLOR PULSE - Particle System & Visual FX Engine
 * Manages ball trails, death shatter shards, shockwaves, sparkles, and ambient world FX.
 */

class ParticleEngine {
  constructor() {
    this.particles = [];
    this.shards = [];
    this.shockwaves = [];
    this.ambientParticles = [];
  }

  // Init ambient particles based on active map
  initAmbient(mapId, canvasWidth, canvasHeight) {
    this.ambientParticles = [];
    const count = 45;
    for (let i = 0; i < count; i++) {
      this.ambientParticles.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        size: Math.random() * 2.5 + 0.8,
        vx: (Math.random() - 0.5) * 0.4,
        vy: mapId === 'lava' ? -(Math.random() * 0.8 + 0.3) : (mapId === 'frost' ? (Math.random() * 0.8 + 0.3) : (Math.random() - 0.5) * 0.3),
        alpha: Math.random() * 0.7 + 0.3,
        pulse: Math.random() * Math.PI * 2,
        color: mapId === 'lava' ? '#f97316' : (mapId === 'frost' ? '#bae6fd' : '#ffffff')
      });
    }
  }

  // Add Ball Trail Particle
  addBallTrail(x, y, radius, color, trailType = 'sparkle') {
    if (trailType === 'sparkle') {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 1.5 + 0.5,
        size: Math.random() * 4 + 2,
        color: color,
        alpha: 0.9,
        decay: 0.05,
        type: 'sparkle'
      });
    } else if (trailType === 'fire') {
      const colors = ['#f59e0b', '#ef4444', '#f97316', '#fbbf24'];
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2 + 1,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.95,
        decay: 0.06,
        type: 'fire'
      });
    } else if (trailType === 'rainbow') {
      const rainbow = ['#ff007f', '#00f0ff', '#fee440', '#00f5d4', '#7928ca'];
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 1.2,
        vy: Math.random() * 1.2 + 0.6,
        size: Math.random() * 5 + 3,
        color: rainbow[Math.floor(Math.random() * rainbow.length)],
        alpha: 0.9,
        decay: 0.045,
        type: 'circle'
      });
    } else if (trailType === 'bubbles') {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -(Math.random() * 1.2 + 0.2),
        size: Math.random() * 5 + 2,
        color: color,
        alpha: 0.85,
        decay: 0.04,
        type: 'bubble'
      });
    } else if (trailType === 'ghost') {
      this.particles.push({
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        size: radius,
        color: color,
        alpha: 0.6,
        decay: 0.08,
        type: 'ghost'
      });
    }
  }

  // Death Shatter Explosion (Shard Physics)
  createDeathShatter(x, y, color, allPaletteColors) {
    const shardCount = 75;
    for (let i = 0; i < shardCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 3;
      const c = Math.random() < 0.6 ? color : allPaletteColors[Math.floor(Math.random() * allPaletteColors.length)];

      this.shards.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 7 + 4,
        color: c,
        alpha: 1,
        decay: Math.random() * 0.025 + 0.015,
        gravity: 0.22,
        points: Math.floor(Math.random() * 2) + 3 // Triangles & Quads
      });
    }
    this.createShockwave(x, y, color, 140);
  }

  // Expanding Shockwave Ripple
  createShockwave(x, y, color, maxRadius = 100) {
    this.shockwaves.push({
      x: x,
      y: y,
      radius: 5,
      maxRadius: maxRadius,
      color: color,
      alpha: 1,
      speed: 7,
      thickness: 4
    });
  }

  // Star Collection Sparkle Burst
  createStarBurst(x, y, color = '#fee440') {
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color: color,
        alpha: 1,
        decay: 0.04,
        type: 'sparkle'
      });
    }
    this.createShockwave(x, y, color, 60);
  }

  // Update loop
  update(canvasWidth, canvasHeight, cameraY = 0) {
    // 1. Ambient Particles
    this.ambientParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.04;

      if (p.x < 0) p.x = canvasWidth;
      if (p.x > canvasWidth) p.x = 0;
      if (p.y < 0) p.y = canvasHeight;
      if (p.y > canvasHeight) p.y = 0;
    });

    // 2. Normal Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      p.size = Math.max(0.5, p.size * 0.97);

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 3. Death Shards
    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += s.gravity;
      s.vx *= 0.98;
      s.rotation += s.rotSpeed;
      s.alpha -= s.decay;

      if (s.alpha <= 0) {
        this.shards.splice(i, 1);
      }
    }

    // 4. Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed;
      sw.alpha = 1 - (sw.radius / sw.maxRadius);
      sw.thickness = Math.max(1, sw.thickness * 0.96);

      if (sw.radius >= sw.maxRadius || sw.alpha <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  // Render ambient background particles (screen space)
  drawAmbient(ctx) {
    this.ambientParticles.forEach(p => {
      ctx.save();
      const currentAlpha = p.alpha * (0.6 + Math.sin(p.pulse) * 0.4);
      ctx.globalAlpha = Math.max(0, currentAlpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // Render world particles (camera space)
  draw(ctx, cameraY) {
    ctx.save();

    // 1. Shockwaves
    this.shockwaves.forEach(sw => {
      const sy = sw.y - cameraY;
      ctx.save();
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = sw.thickness;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(sw.x, sy, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    // 2. Particles
    this.particles.forEach(p => {
      const sy = p.y - cameraY;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;

      if (p.type === 'bubble') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, sy, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, sy, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // 3. Shards (Polygonal glass pieces)
    this.shards.forEach(s => {
      const sy = s.y - cameraY;
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.alpha);
      ctx.translate(s.x, sy);
      ctx.rotate(s.rotation);
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 12;

      ctx.beginPath();
      if (s.points === 3) {
        ctx.moveTo(-s.size, -s.size);
        ctx.lineTo(s.size, -s.size / 2);
        ctx.lineTo(0, s.size);
      } else {
        ctx.moveTo(-s.size, -s.size / 2);
        ctx.lineTo(s.size / 2, -s.size);
        ctx.lineTo(s.size, s.size / 2);
        ctx.lineTo(-s.size / 2, s.size);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();
  }
}

const particleEngine = new ParticleEngine();
