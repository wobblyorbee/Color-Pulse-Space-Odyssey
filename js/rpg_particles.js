/**
 * REALM OF VALIANT - Particle System & Visual FX Engine
 * Manages combat particle physics, floating damage text, attack telegraphs, and screen shake.
 */

class ParticleFXEngine {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
    this.slashArcs = [];
    this.telegraphs = [];
    this.ghostTrails = [];
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeDecay = 0.9;
  }

  // Trigger camera screen shake
  shake(intensity = 8, duration = 12) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
  }

  getShakeOffset() {
    if (this.shakeDuration > 0 && this.shakeIntensity > 0.5) {
      this.shakeDuration--;
      this.shakeIntensity *= this.shakeDecay;
      return {
        x: (Math.random() - 0.5) * this.shakeIntensity * 2,
        y: (Math.random() - 0.5) * this.shakeIntensity * 2
      };
    }
    return { x: 0, y: 0 };
  }

  // Create blood or spark impact splatter
  createHitSparks(x, y, color = '#f59e0b', count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color: color,
        alpha: 1,
        decay: Math.random() * 0.05 + 0.03,
        gravity: 0.15,
        type: 'spark'
      });
    }
  }

  // Create Magic Spell Explosion
  createExplosion(x, y, radius = 60, type = 'fire') {
    const colors = type === 'fire' 
      ? ['#ef4444', '#f97316', '#f59e0b', '#fbbf24']
      : (type === 'ice' ? ['#38bdf8', '#7dd3fc', '#bae6fd', '#ffffff'] : ['#a855f7', '#c084fc', '#e9d5ff']);

    const count = Math.floor(radius / 2);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (radius * 0.8);
      const speed = Math.random() * 4 + 2;
      this.particles.push({
        x: x + Math.cos(angle) * (dist * 0.3),
        y: y + Math.sin(angle) * (dist * 0.3),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.04 + 0.02,
        gravity: type === 'fire' ? -0.05 : 0.05,
        type: 'smoke'
      });
    }
  }

  // Dash ghost motion trail
  createGhostTrail(x, y, radius, color = 'rgba(59, 130, 246, 0.5)', angle = 0) {
    this.ghostTrails.push({
      x: x,
      y: y,
      radius: radius,
      color: color,
      angle: angle,
      alpha: 0.6,
      decay: 0.08
    });
  }

  // Weapon Slash Arc
  createSlashArc(x, y, angle, radius = 45, arcSpan = Math.PI * 0.8, color = '#60a5fa') {
    this.slashArcs.push({
      x: x,
      y: y,
      angle: angle,
      radius: radius,
      arcSpan: arcSpan,
      color: color,
      alpha: 1,
      decay: 0.12,
      thickness: 6
    });
  }

  // Attack Telegraph Hazard Area (Red Circle or Cone)
  createTelegraph(x, y, radius, duration = 60, shape = 'circle', width = 0, height = 0, angle = 0) {
    const telegraph = {
      x: x,
      y: y,
      radius: radius,
      maxDuration: duration,
      duration: duration,
      shape: shape,
      width: width,
      height: height,
      angle: angle,
      progress: 0
    };
    this.telegraphs.push(telegraph);
    return telegraph;
  }

  // Floating Combat Damage / Heal Text
  addFloatingText(x, y, text, type = 'normal') {
    let color = '#ffffff';
    let size = 16;
    let isCrit = false;

    if (type === 'crit') {
      color = '#f59e0b';
      size = 22;
      isCrit = true;
      text = '⚡ ' + text + '!';
    } else if (type === 'heal') {
      color = '#10b981';
      size = 18;
      text = '+' + text;
    } else if (type === 'mana') {
      color = '#3b82f6';
      size = 16;
      text = '+' + text + ' MP';
    } else if (type === 'dodge') {
      color = '#94a3b8';
      size = 15;
      text = 'DODGE!';
    } else if (type === 'exp') {
      color = '#eab308';
      size = 14;
      text = '+' + text + ' EXP';
    }

    this.floatingTexts.push({
      x: x + (Math.random() - 0.5) * 16,
      y: y - 10,
      text: String(text),
      color: color,
      size: size,
      alpha: 1,
      vy: isCrit ? -2.8 : -1.6,
      vx: (Math.random() - 0.5) * 1.2,
      scale: isCrit ? 1.4 : 1.0,
      decay: isCrit ? 0.022 : 0.028,
      isCrit: isCrit
    });
  }

  // Update physics for all active elements
  update() {
    // 1. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity || 0;
      p.vx *= 0.96;
      p.alpha -= p.decay;
      p.size = Math.max(0.5, p.size * 0.98);

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 2. Update Ghost Trails
    for (let i = this.ghostTrails.length - 1; i >= 0; i--) {
      const g = this.ghostTrails[i];
      g.alpha -= g.decay;
      if (g.alpha <= 0) {
        this.ghostTrails.splice(i, 1);
      }
    }

    // 3. Update Slash Arcs
    for (let i = this.slashArcs.length - 1; i >= 0; i--) {
      const s = this.slashArcs[i];
      s.alpha -= s.decay;
      s.thickness = Math.max(1, s.thickness * 0.9);
      if (s.alpha <= 0) {
        this.slashArcs.splice(i, 1);
      }
    }

    // 4. Update Telegraphs
    for (let i = this.telegraphs.length - 1; i >= 0; i--) {
      const t = this.telegraphs[i];
      t.duration--;
      t.progress = 1 - (t.duration / t.maxDuration);
      if (t.duration <= 0) {
        this.telegraphs.splice(i, 1);
      }
    }

    // 5. Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.x += ft.vx;
      ft.y += ft.vy;
      ft.vy += 0.04; // Gentle gravity drop
      ft.alpha -= ft.decay;
      if (ft.isCrit && ft.scale > 1.0) {
        ft.scale -= 0.03;
      }
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  // Render on Canvas
  draw(ctx, camera) {
    ctx.save();

    // 1. Draw Telegraphs (Drawn underneath entities)
    this.telegraphs.forEach(t => {
      const sx = t.x - camera.x;
      const sy = t.y - camera.y;

      ctx.save();
      ctx.globalAlpha = 0.25 + t.progress * 0.35;

      if (t.shape === 'circle') {
        // Red telegraph circle fill
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(sx, sy, t.radius * t.progress, 0, Math.PI * 2);
        ctx.fill();

        // Outer border
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(sx, sy, t.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (t.shape === 'rect') {
        ctx.translate(sx, sy);
        ctx.rotate(t.angle);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(0, -t.height / 2, t.width * t.progress, t.height);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, -t.height / 2, t.width, t.height);
      }
      ctx.restore();
    });

    // 2. Draw Ghost Trails
    this.ghostTrails.forEach(g => {
      const sx = g.x - camera.x;
      const sy = g.y - camera.y;
      ctx.save();
      ctx.globalAlpha = g.alpha;
      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.arc(sx, sy, g.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 3. Draw Slash Arcs
    this.slashArcs.forEach(s => {
      const sx = s.x - camera.x;
      const sy = s.y - camera.y;
      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.thickness;
      ctx.lineCap = 'round';
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.arc(sx, sy, s.radius, s.angle - s.arcSpan / 2, s.angle + s.arcSpan / 2);
      ctx.stroke();
      ctx.restore();
    });

    // 4. Draw Particles
    this.particles.forEach(p => {
      const sx = p.x - camera.x;
      const sy = p.y - camera.y;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;

      ctx.beginPath();
      ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 5. Draw Floating Combat Text
    this.floatingTexts.forEach(ft => {
      const sx = ft.x - camera.x;
      const sy = ft.y - camera.y;
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = `800 ${Math.round(ft.size * ft.scale)}px 'Outfit', sans-serif`;
      ctx.fillStyle = ft.color;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.lineWidth = ft.isCrit ? 4 : 3;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (ft.isCrit) {
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
      }

      ctx.strokeText(ft.text, sx, sy);
      ctx.fillText(ft.text, sx, sy);
      ctx.restore();
    });

    ctx.restore();
  }
}

const particles = new ParticleFXEngine();
