/**
 * KATA.IN - Canvas Confetti & Particle Celebration Engine
 * High-performance 60fps canvas particle physics for victory animations.
 */

class ConfettiEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationFrame = null;
    this.colors = [
      '#10B981', '#34D399', '#6EE7B7', // Emeralds
      '#F59E0B', '#FBBF24', '#FCD34D', // Gold/Amber
      '#EC4899', '#F472B6', '#F43F5E', // Rose/Pink
      '#3B82F6', '#60A5FA', '#93C5FD', // Blue
      '#8B5CF6', '#A78BFA', '#C4B5FD'  // Purple
    ];
    this.emojis = ['🎉', '✨', '🌟', '🏆', '💎', '🔥', '👏'];
    this.initCanvas();
  }

  initCanvas() {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'confetti-canvas';
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100vw';
      this.canvas.style.height = '100vh';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '99999';
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }

  resize() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  createParticle(x, y, isEmoji = false) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 6;
    return {
      x: x || window.innerWidth / 2,
      y: y || window.innerHeight / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (Math.random() * 4 + 4),
      size: isEmoji ? Math.random() * 12 + 18 : Math.random() * 7 + 6,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      wobble: Math.random() * 10,
      wobbleSpeed: Math.random() * 0.1 + 0.05,
      opacity: 1,
      decay: Math.random() * 0.008 + 0.004,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
      isEmoji: isEmoji,
      emoji: this.emojis[Math.floor(Math.random() * this.emojis.length)]
    };
  }

  fire(count = 120) {
    this.initCanvas();
    const leftX = window.innerWidth * 0.2;
    const rightX = window.innerWidth * 0.8;
    const bottomY = window.innerHeight * 0.85;

    for (let i = 0; i < count / 2; i++) {
      const p1 = this.createParticle(leftX, bottomY, Math.random() < 0.15);
      p1.vx = Math.random() * 9 + 2;
      p1.vy = -(Math.random() * 12 + 8);
      this.particles.push(p1);

      const p2 = this.createParticle(rightX, bottomY, Math.random() < 0.15);
      p2.vx = -(Math.random() * 9 + 2);
      p2.vy = -(Math.random() * 12 + 8);
      this.particles.push(p2);
    }

    if (!this.animationFrame) {
      this.render();
    }
  }

  rain(durationMs = 2500) {
    this.initCanvas();
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - startTime > durationMs) {
        clearInterval(interval);
        return;
      }
      for (let i = 0; i < 6; i++) {
        const p = this.createParticle(Math.random() * window.innerWidth, -20, Math.random() < 0.1);
        p.vx = (Math.random() - 0.5) * 3;
        p.vy = Math.random() * 3 + 2;
        this.particles.push(p);
      }
      if (!this.animationFrame) {
        this.render();
      }
    }, 40);
  }

  render() {
    if (!this.ctx || this.particles.length === 0) {
      this.ctx && this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.animationFrame = null;
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.28; // Gravity
      p.vx *= 0.985; // Air resistance
      p.rotation += p.rotationSpeed;
      p.wobble += p.wobbleSpeed;
      p.opacity -= p.decay;

      if (p.opacity <= 0 || p.y > window.innerHeight + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);

      if (p.isEmoji) {
        this.ctx.font = `${p.size}px sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(p.emoji, 0, 0);
      } else {
        this.ctx.fillStyle = p.color;
        const scaleX = Math.cos(p.wobble);

        if (p.shape === 'circle') {
          this.ctx.beginPath();
          this.ctx.ellipse(0, 0, p.size / 2, (p.size / 2) * scaleX, 0, 0, Math.PI * 2);
          this.ctx.fill();
        } else {
          this.ctx.fillRect(-p.size / 2, (-p.size / 2) * scaleX, p.size, p.size * scaleX * 1.5);
        }
      }

      this.ctx.restore();
    }

    this.animationFrame = requestAnimationFrame(() => this.render());
  }

  stop() {
    this.particles = [];
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

const confetti = new ConfettiEngine();
