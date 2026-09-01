/**
 * COLOR PULSE: SPACE ODYSSEY - Astronaut Character Builder System
 *
 * 3-slot character system: Helm + Body + Jetpack
 * Each slot has free/premium items. The astronaut is composed procedurally on canvas.
 */

// ─── HELM PARTS ────────────────────────────────────────────────────────────
const HELM_PARTS = [
  {
    id: 'visor_neo', name: 'Neo Visor', icon: '🪖', desc: 'Pelindung standar dengan kaca visor reflektif.',
    starPrice: 0, isUnlocked: true,
    draw(ctx, color) {
      // Helmet dome
      ctx.fillStyle = '#e2e8f0'; ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, -6, 18, Math.PI, 0, false); ctx.closePath(); ctx.fill(); ctx.stroke();
      // Visor glass
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.roundRect(-12, -14, 24, 13, 4); ctx.fill();
      // Visor shimmer
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.ellipse(-5, -10, 6, 2.5, Math.PI/5, 0, Math.PI*2); ctx.fill();
    }
  },
  {
    id: 'helm_combat', name: 'Combat Dome', icon: '⛑️', desc: 'Helm tempur militer dengan pelat baja berat.',
    starPrice: 10, isUnlocked: false,
    draw(ctx, color) {
      // Heavy helmet
      ctx.fillStyle = '#334155'; ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, -6, 18, Math.PI, 0, false); ctx.closePath(); ctx.fill(); ctx.stroke();
      // Visor slit
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.roundRect(-11, -12, 22, 7, 3); ctx.fill();
      // Ridge plate
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-18, -6); ctx.lineTo(18, -6); ctx.stroke();
    }
  },
  {
    id: 'helm_crystal', name: 'Crystal Orb', icon: '🔮', desc: 'Helm bulat transparan seperti bola kristal.',
    starPrice: 20, isUnlocked: false,
    draw(ctx, color) {
      // Glass orb
      ctx.fillStyle = 'rgba(180,240,255,0.2)'; ctx.strokeStyle = 'rgba(100,220,255,0.7)'; ctx.lineWidth = 2;
      ctx.shadowColor = color; ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.arc(0, -6, 20, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      // Face inside glow
      ctx.fillStyle = color; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.arc(0, -6, 10, 0, Math.PI*2); ctx.fill();
      // Orb highlight
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.ellipse(-6, -12, 5, 3, Math.PI/4, 0, Math.PI*2); ctx.fill();
    }
  },
  {
    id: 'helm_ninja', name: 'Ninja Mask', icon: '🥷', desc: 'Penutup wajah siluman galaksi berwarna gelap.',
    starPrice: 30, isUnlocked: false,
    draw(ctx, color) {
      // Dark wrap
      ctx.fillStyle = '#0f172a'; ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, -5, 18, Math.PI, 0, false); ctx.closePath(); ctx.fill(); ctx.stroke();
      // Visor slit — narrow and glowing
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.roundRect(-10, -10, 20, 5, 2); ctx.fill();
    }
  },
  {
    id: 'helm_crown', name: 'Royal Crown', icon: '👑', desc: 'Mahkota kerajaan kosmik bertatahkan berlian energi.',
    starPrice: 50, isUnlocked: false,
    draw(ctx, color) {
      ctx.fillStyle = '#e2e8f0'; ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, -6, 17, Math.PI, 0, false); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.roundRect(-12, -14, 24, 12, 4); ctx.fill();
      // Crown tips
      ctx.fillStyle = '#fbbf24'; ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 10;
      for (let i = 0; i < 3; i++) {
        const x = -8 + i*8;
        ctx.beginPath(); ctx.moveTo(x-4,-6); ctx.lineTo(x,-(14+8*(i===1?1:0))); ctx.lineTo(x+4,-6); ctx.closePath(); ctx.fill();
      }
    }
  },
  {
    id: 'helm_alien', name: 'Alien Crest', icon: '👾', desc: 'Cangkang kepala alien biomekanik berinsang energi.',
    starPrice: 70, isUnlocked: false,
    draw(ctx, color) {
      ctx.fillStyle = '#064e3b'; ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, -5, 18, Math.PI, 0, false); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.arc(0, -6, 10, 0, Math.PI*2); ctx.fill();
      // Antenna
      ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, -23); ctx.lineTo(0, -32); ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(0, -33, 3.5, 0, Math.PI*2); ctx.fill();
    }
  }
];

// ─── BODY PARTS ────────────────────────────────────────────────────────────
const BODY_PARTS = [
  {
    id: 'suit_white', name: 'White Space Suit', icon: '🧥', desc: 'Pakaian luar angkasa standar NASA warna putih klasik.',
    starPrice: 0, isUnlocked: true,
    draw(ctx, color) {
      ctx.fillStyle = '#f8fafc'; ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(0, 12, 14, 16, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      // Chest patch
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.roundRect(-6, 4, 12, 8, 3); ctx.fill();
    }
  },
  {
    id: 'suit_mecha', name: 'Mecha Armor', icon: '🤖', desc: 'Zirah robot berlapis titanium hitam dengan sendi energi.',
    starPrice: 15, isUnlocked: false,
    draw(ctx, color) {
      ctx.fillStyle = '#0f172a'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;
      ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.roundRect(-13, 0, 26, 28, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 12;
      ctx.fillRect(-8, 8, 16, 8);
      ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(0, 22, 4, 0, Math.PI*2); ctx.fill();
    }
  },
  {
    id: 'suit_solar', name: 'Solar Cloak', icon: '☀️', desc: 'Jubah plasma tahan panas berwarna oranye membara.',
    starPrice: 25, isUnlocked: false,
    draw(ctx, color) {
      ctx.fillStyle = '#78350f'; ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2;
      ctx.shadowColor = '#f97316'; ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(-16, 0); ctx.quadraticCurveTo(-20, 16, -12, 28);
      ctx.lineTo(12, 28); ctx.quadraticCurveTo(20, 16, 16, 0);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.roundRect(-7, 6, 14, 10, 3); ctx.fill();
    }
  },
  {
    id: 'suit_void', name: 'Void Robe', icon: '🌌', desc: 'Jubah kegelapan hampa dengan corak nebula berkilau.',
    starPrice: 40, isUnlocked: false,
    draw(ctx, color) {
      ctx.fillStyle = '#0f0728'; ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 2;
      ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(-14, 0); ctx.lineTo(-18, 28); ctx.lineTo(18, 28); ctx.lineTo(14, 0); ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Nebula dots
      ctx.fillStyle = '#ffffff'; ctx.shadowBlur = 0;
      [[-6,8],[5,14],[-3,21],[7,22]].forEach(([x,y]) => {
        ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2); ctx.fill();
      });
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(0, 14, 5, 0, Math.PI*2); ctx.fill();
    }
  },
  {
    id: 'suit_gold', name: 'Gold Commander', icon: '🎖️', desc: 'Zirah emas komandan armada galaksi bermedali.',
    starPrice: 60, isUnlocked: false,
    draw(ctx, color) {
      ctx.fillStyle = '#b45309'; ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.ellipse(0, 14, 14, 16, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.roundRect(-7, 5, 14, 10, 3); ctx.fill();
      // Medal
      ctx.fillStyle = '#fbbf24'; ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(-5, 20, 4, 0, Math.PI*2); ctx.fill();
    }
  },
  {
    id: 'suit_rocket', name: 'Rocket Shell', icon: '🚀', desc: 'Kapsul roket padat dengan hidung aerodinamis runcing.',
    starPrice: 80, isUnlocked: false,
    draw(ctx, color) {
      ctx.fillStyle = '#e2e8f0'; ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(14, 28); ctx.lineTo(-14, 28); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(0, 18, 5, 0, Math.PI*2); ctx.fill();
    }
  }
];

// ─── JETPACK PARTS ─────────────────────────────────────────────────────────
const JETPACK_PARTS = [
  {
    id: 'jet_plasma', name: 'Plasma Thruster', icon: '🚀', desc: 'Jetpack plasma biru standar dengan dorongan konstan.',
    starPrice: 0, isUnlocked: true,
    draw(ctx, color, vy) {
      ctx.fillStyle = '#1e293b'; ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(-22, 2, 9, 20, 3); ctx.fill(); ctx.stroke();
      if (vy < 0.5) {
        ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(-22, 22); ctx.lineTo(-13, 22);
        ctx.lineTo(-17.5, 30 + Math.random()*5); ctx.closePath();
        ctx.fill();
      }
    }
  },
  {
    id: 'jet_fire', name: 'Flame Booster', icon: '🔥', desc: 'Pendorong api oranye membara dengan ledakan kecil.',
    starPrice: 15, isUnlocked: false,
    draw(ctx, color, vy) {
      ctx.fillStyle = '#7c2d12'; ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2;
      ctx.shadowColor = '#f97316'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.roundRect(-23, 0, 10, 22, 4); ctx.fill(); ctx.stroke();
      if (vy < 0.5) {
        ctx.fillStyle = '#f97316'; ctx.shadowColor = '#f97316'; ctx.shadowBlur = 16;
        ctx.beginPath(); ctx.moveTo(-23,22); ctx.lineTo(-13,22); ctx.lineTo(-18, 32+Math.random()*6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fee440';
        ctx.beginPath(); ctx.moveTo(-22,22); ctx.lineTo(-14,22); ctx.lineTo(-18, 26); ctx.closePath(); ctx.fill();
      }
    }
  },
  {
    id: 'jet_rainbow', name: 'Rainbow Comet', icon: '🌈', desc: 'Jet pelangi yang meninggalkan jejak warna-warni spektakuler.',
    starPrice: 30, isUnlocked: false,
    draw(ctx, color, vy) {
      ctx.fillStyle = '#1e1b4b'; ctx.strokeStyle = '#818cf8'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(-22, 2, 9, 20, 3); ctx.fill(); ctx.stroke();
      if (vy < 0.5) {
        const rainbow = ['#ff007f','#ff7700','#fee440','#00f5d4','#7928ca'];
        rainbow.forEach((c, i) => {
          ctx.fillStyle = c; ctx.shadowColor = c; ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.arc(-17.5, 26+i*2, 2, 0, Math.PI*2); ctx.fill();
        });
      }
    }
  },
  {
    id: 'jet_bubble', name: 'Bubble Float', icon: '🫧', desc: 'Peluncur gelembung plasma mengambang tanpa gravitasi.',
    starPrice: 40, isUnlocked: false,
    draw(ctx, color, vy) {
      ctx.fillStyle = '#0c4a6e'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(-22, 2, 9, 20, 3); ctx.fill(); ctx.stroke();
      if (vy < 0.5) {
        for (let b = 0; b < 3; b++) {
          const bx = -17 + (Math.random()-0.5)*4;
          const by = 24 + b*5;
          ctx.fillStyle = 'rgba(56,189,248,0.4)'; ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(bx, by, 3+b, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        }
      }
    }
  },
  {
    id: 'jet_ghost', name: 'Ghost Drive', icon: '👻', desc: 'Pendorong bayangan senyap yang menembus dimensi.',
    starPrice: 55, isUnlocked: false,
    draw(ctx, color, vy) {
      ctx.fillStyle = 'rgba(30,10,60,0.7)'; ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(-22, 2, 9, 20, 3); ctx.fill(); ctx.stroke();
      if (vy < 0.5) {
        ctx.fillStyle = 'rgba(168,85,247,0.3)';
        ctx.beginPath(); ctx.arc(-17.5, 26, 7, 0, Math.PI*2); ctx.fill();
      }
    }
  }
];

// ─── ASTRONAUT RENDERER ─────────────────────────────────────────────────────
function drawAstronaut(ctx, x, y, radius, color, rot, vy, helmId, bodyId, jetpackId) {
  const helm   = HELM_PARTS.find(h => h.id === helmId)    || HELM_PARTS[0];
  const body   = BODY_PARTS.find(b => b.id === bodyId)    || BODY_PARTS[0];
  const jetpak = JETPACK_PARTS.find(j => j.id === jetpackId) || JETPACK_PARTS[0];

  const scale = radius / 18;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot * 0.15); // gentle sway
  ctx.scale(scale, scale);

  // Draw in Z-order: Jetpack → Body → Helm
  jetpak.draw(ctx, color, vy);
  body.draw(ctx, color);
  helm.draw(ctx, color);

  ctx.restore();
}

// ─── SKIN MANAGER (Character Builder) ───────────────────────────────────────
class SkinManager {
  constructor() {
    this.helmParts    = HELM_PARTS;
    this.bodyParts    = BODY_PARTS;
    this.jetpackParts = JETPACK_PARTS;

    this.activeHelm    = localStorage.getItem('cp_active_helm')    || 'visor_neo';
    this.activeBody    = localStorage.getItem('cp_active_body')    || 'suit_white';
    this.activeJetpack = localStorage.getItem('cp_active_jetpack') || 'jet_plasma';

    // Legacy trail support
    this.activeTrailId = localStorage.getItem('cp_active_trail') || 'plasma';

    this.loadUnlockedData();
  }

  loadUnlockedData() {
    const tryLoad = (key, arr) => {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      try { const ids = JSON.parse(raw); arr.forEach(p => { if (ids.includes(p.id)) p.isUnlocked = true; }); }
      catch (e) {}
    };
    tryLoad('cp_unlocked_helms',    this.helmParts);
    tryLoad('cp_unlocked_bodies',   this.bodyParts);
    tryLoad('cp_unlocked_jetpacks', this.jetpackParts);
  }

  saveUnlockedData() {
    const save = (key, arr) => localStorage.setItem(key, JSON.stringify(arr.filter(p=>p.isUnlocked).map(p=>p.id)));
    save('cp_unlocked_helms',    this.helmParts);
    save('cp_unlocked_bodies',   this.bodyParts);
    save('cp_unlocked_jetpacks', this.jetpackParts);
  }

  getActiveConfig() {
    return {
      helm:    this.activeHelm,
      body:    this.activeBody,
      jetpack: this.activeJetpack
    };
  }

  // Adapter: draw() called from game loop
  getActiveSkin() {
    const self = this;
    return {
      name: this.helmParts.find(h=>h.id===this.activeHelm)?.name || 'Astronaut',
      draw(ctx, x, y, r, color, rot, vy = 0) {
        drawAstronaut(ctx, x, y, r, color, rot, vy, self.activeHelm, self.activeBody, self.activeJetpack);
      }
    };
  }

  getActiveTrail() { return { id: this.activeTrailId }; }

  selectHelm(id, playerStars) {
    const p = this.helmParts.find(h=>h.id===id);
    if (!p) return false;
    if (!p.isUnlocked) {
      if (playerStars < p.starPrice) return false;
      p.isUnlocked = true;
      this.saveUnlockedData();
    }
    this.activeHelm = id;
    localStorage.setItem('cp_active_helm', id);
    return true;
  }

  selectBody(id, playerStars) {
    const p = this.bodyParts.find(b=>b.id===id);
    if (!p) return false;
    if (!p.isUnlocked) {
      if (playerStars < p.starPrice) return false;
      p.isUnlocked = true;
      this.saveUnlockedData();
    }
    this.activeBody = id;
    localStorage.setItem('cp_active_body', id);
    return true;
  }

  selectJetpack(id, playerStars) {
    const p = this.jetpackParts.find(j=>j.id===id);
    if (!p) return false;
    if (!p.isUnlocked) {
      if (playerStars < p.starPrice) return false;
      p.isUnlocked = true;
      this.saveUnlockedData();
    }
    this.activeJetpack = id;
    localStorage.setItem('cp_active_jetpack', id);
    return true;
  }

  selectTrail(id) { this.activeTrailId = id; localStorage.setItem('cp_active_trail', id); }
}

const skinManager = new SkinManager();
