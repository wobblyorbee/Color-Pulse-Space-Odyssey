/**
 * COLOR PULSE: SPACE ODYSSEY
 * Game Engine — PC Widescreen, Story Missions, Character Builder,
 * Themed Obstacles, and Full UI/UX Controller.
 */

// ═══════════════════════════════════════════════════════════
// MISSION DATA (15 levels, each with unique brief)
// ═══════════════════════════════════════════════════════════
const MISSIONS = [
  { id: 1,  name: 'Peluncuran Pertama',    sector: 'Stasiun Orbital Kelas-A',   icon: '🚀', desc: 'Astronot baru! Lewati rintangan pertamamu di orbit rendah bumi.', objectives: ['Selesaikan 3 rintangan','Kumpulkan 1 bintang'], reward: 10 },
  { id: 2,  name: 'Badai Neon',            sector: 'Sabuk Asteroid Kelas-B',    icon: '⚡', desc: 'Badai elektromagnetik kosmik mengacaukan jalurmu!',            objectives: ['Selesaikan 5 rintangan','Tanpa salah warna'],   reward: 15 },
  { id: 3,  name: 'Gerbang Siber',         sector: 'Kota Cyber-Orbit',          icon: '🌌', desc: 'Masuklah ke kota neon melayang di angkasa melalui gerbang pelindung.', objectives: ['Lewati cross-shield','Kumpulkan 2 bintang'], reward: 20 },
  { id: 4,  name: 'Angin Vaporwave',       sector: 'Nebula Retro-Wave',         icon: '🌅', desc: 'Ombak plasma synthwave mendorong pesawatmu ke segala arah.',   objectives: ['Selesaikan 8 rintangan','Gunakan color switch 2×'], reward: 25 },
  { id: 5,  name: 'Orbit Sang Raksasa',    sector: 'Planet Gas Zenith',         icon: '🪐', desc: 'Navigasi cincin orbital planet raksasa yang berputar cepat.',  objectives: ['Lewati double ring','Kumpulkan 3 bintang'],     reward: 30 },
  { id: 6,  name: 'Kawah Aktif',           sector: 'Surtur — Planet Lava',      icon: '🌋', desc: 'Panas ekstrem! Lewati gear bergerigi lava yang memutar ganas.', objectives: ['Selesaikan 10 rintangan','Hindari bar lava 5×'],  reward: 35 },
  { id: 7,  name: 'Gletser Kosmik',        sector: 'Kutub Es Cryon-9',          icon: '❄️', desc: 'Kristal es raksasa memblokir jalur menuju portal beku.',      objectives: ['Lewati snowflake spinner','Kumpulkan 4 bintang'],  reward: 40 },
  { id: 8,  name: 'Labirin Sirkuit',       sector: 'Core Data Nexus',           icon: '🔷', desc: 'Sistem keamanan AI mengaktifkan perisai heksagonal berlapis.', objectives: ['Selesaikan 12 rintangan','Tanpa salah 3 berturut'], reward: 50 },
  { id: 9,  name: 'Tarian Bintang',        sector: 'Gugus Bintang Orion-X',     icon: '✨', desc: 'Bintang-bintang menari dalam formasi rintangan kompleks.',     objectives: ['Kumpulkan 5 bintang','Selesaikan 14 rintangan'],  reward: 60 },
  { id: 10, name: 'Inti Galaksi',          sector: 'Pusat Galaksi Andromeda',   icon: '🌀', desc: 'Gravitasi ekstrem mendistorsi ruang dan waktu di sekitarmu.', objectives: ['Lewati double ring 3×','Gunakan color switch 5×'], reward: 70 },
  { id: 11, name: 'Batas Supernova',       sector: 'Zona Ledakan Nova-Alpha',   icon: '💥', desc: 'Supernova kuno melepaskan gelombang energi yang masif.',      objectives: ['Selesaikan 16 rintangan','Kumpulkan 6 bintang'],   reward: 80 },
  { id: 12, name: 'Portal Dimensi',        sector: 'Persimpangan Multiverse',   icon: '🔮', desc: 'Antarkan dirimu melalui portal yang menghubungkan dimensi.',  objectives: ['Lewati semua jenis rintangan','Tanpa jatuh'],       reward: 90 },
  { id: 13, name: 'Armada Gelap',          sector: 'Wilayah Void-Nebula',       icon: '👾', desc: 'Armada alien menghadang jalurmu dengan formasi tempur.',      objectives: ['Selesaikan 18 rintangan','Kumpulkan 8 bintang'],   reward: 100 },
  { id: 14, name: 'Puncak Kosmik',         sector: 'Puncak Tertinggi Galaksi',  icon: '🏔️', desc: 'Hampir sampai! Rintangan terakhir sebelum tujuan akhir.',    objectives: ['Selesaikan 20 rintangan','Gunakan semua switch'],   reward: 120 },
  { id: 15, name: 'Sang Penjelajah Abadi', sector: 'Batas Alam Semesta',        icon: '🌟', desc: 'Kamu adalah Penjelajah Kosmik Terhebat sepanjang masa!',      objectives: ['Capai portal terakhir','Sempurnakan misi'],         reward: 150 },
];

// ═══════════════════════════════════════════════════════════
// MAIN GAME ENGINE
// ═══════════════════════════════════════════════════════════
class ColorSwitchGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx    = this.canvas.getContext('2d');

    // Virtual widescreen coords (height-fixed at 540, width responsive)
    this.virtualWidth  = 960;
    this.virtualHeight = 540;
    this.centerX       = 480;
    this.canvasScale   = 1;
    this.setupCanvasDPI();
    window.addEventListener('resize', () => this.setupCanvasDPI());

    // State
    this.state       = 'MENU';
    this.mode        = 'levels';   // default: Story Missions
    this.currentLevel = 1;
    this.isFrozen    = true;
    this.frostPulse  = 0;

    // Progress
    this.score           = 0;
    this.bestScore       = parseInt(localStorage.getItem('cp_best_score') || '0', 10);
    this.playerStars     = parseInt(localStorage.getItem('cp_player_stars') || '0', 10);
    this.starsEarnedRun  = 0;
    this.unlockedLevels  = JSON.parse(localStorage.getItem('cp_unlocked_levels') || '[1]');
    this.levelStars      = JSON.parse(localStorage.getItem('cp_level_stars') || '{}');

    // Physics — short precise hops
    this.gravity        = 0.26;
    this.jumpForce      = -4.8;
    this.maxVy          = 5.8;
    this.speedMultiplier = 1.0;

    // Camera & World
    this.cameraY = 0;
    this.initialY = 440;
    this.ball = { x: 480, y: 440, radius: 14, vy: 0, color: '#00f5d4', rot: 0, squashX: 1, squashY: 1 };
    this.obstacles   = [];
    this.collectibles = [];
    this.nextSpawnY  = 220;
    this.levelStartY = 440;
    this.levelFinishY = 0;

    // DOM refs
    this.hudScore    = document.getElementById('hud-score-val');
    this.hudEl       = document.getElementById('hud-overlay');
    this.screenHome  = document.getElementById('screen-home');
    this.screenResult = document.getElementById('screen-result');
    this.lvlWrap     = document.getElementById('level-progress-wrap');
    this.lvlBar      = document.getElementById('level-progress-bar');

    // Preview canvas for character builder
    this.previewCanvas = document.getElementById('preview-canvas');
    this.previewCtx    = this.previewCanvas?.getContext('2d');

    this.init();
  }

  setupCanvasDPI() {
    const w = window.innerWidth, h = window.innerHeight, dpr = window.devicePixelRatio || 1;
    this.canvas.width  = w * dpr;
    this.canvas.height = h * dpr;
    this.canvasScale   = (h * dpr) / 540;
    this.virtualWidth  = (w * dpr) / this.canvasScale;
    this.virtualHeight = 540;
    this.centerX       = this.virtualWidth / 2;
    this.ctx.setTransform(this.canvasScale, 0, 0, this.canvasScale, 0, 0);
    if (this.state === 'MENU') this.ball.x = this.centerX;
  }

  init() {
    this.updateStats();
    this.renderMissionBrief('levels', 1);   // Show default mission brief
    this.selectModeBtn('levels');
    this.renderLevels();
    this.renderHangar();
    this.renderMaps();
    this.setupEventListeners();
    particleEngine.initAmbient(mapManager.getActiveMap().id, this.virtualWidth, this.virtualHeight);
    requestAnimationFrame(() => this.gameLoop());
  }

  updateStats() {
    document.getElementById('player-stars-val').textContent = this.playerStars;
    document.getElementById('stat-stars').textContent       = this.playerStars;
    const maxUnlocked = Math.max(...this.unlockedLevels);
    document.getElementById('stat-levels').textContent      = `${maxUnlocked}/15`;
    document.getElementById('lobby-best-score').textContent = this.bestScore;
    document.getElementById('sidebar-map-chip').textContent = `${mapManager.getActiveMap().icon} ${mapManager.getActiveMap().name}`;
    document.getElementById('sidebar-astro-chip').textContent = `👨‍🚀 ${skinManager.helmParts.find(h=>h.id===skinManager.activeHelm)?.name||'Astronaut'}`;
  }

  // ─── MODE SELECTION ────────────────────────────────────────
  selectModeBtn(mode) {
    this.mode = mode;
    document.querySelectorAll('.mode-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });
    const playLabel = document.getElementById('play-btn-label');
    if (mode === 'levels')  playLabel.textContent = 'LUNCURKAN MISI';
    else if (mode === 'endless') playLabel.textContent = 'MULAI ENDLESS';
    else if (mode === 'rush')    playLabel.textContent = 'RUSH 2× START';
    else if (mode === 'reverse') playLabel.textContent = 'MIRROR MODE GO';
    this.renderMissionBrief(mode, this.currentLevel);
  }

  renderMissionBrief(mode, level) {
    const wrap = document.getElementById('mission-brief-wrap');
    if (mode === 'levels') {
      const m = MISSIONS[Math.min(level, 15) - 1];
      const starsEarned = this.levelStars[level] || 0;
      const objs = m.objectives.map((o, i) => {
        const done = starsEarned > 0;
        return `<div class="obj-item ${done ? 'done' : ''}">
          <span class="check">${done ? '✓' : '◆'}</span>
          <span>${o}</span>
        </div>`;
      }).join('');
      wrap.innerHTML = `
        <div class="mission-card">
          <div class="mission-header">
            <div class="mission-icon">${m.icon}</div>
            <div class="mission-title-group">
              <div class="mission-tag">MISI ${m.id} / 15</div>
              <div class="mission-title">${m.name}</div>
              <div class="mission-sector">📍 ${m.sector}</div>
            </div>
          </div>
          <p style="font-size:0.9rem;color:var(--muted-lt);line-height:1.6;">${m.desc}</p>
          <div class="mission-objectives">
            <div class="obj-label">Objektif Misi</div>
            ${objs}
          </div>
          <div class="mission-rewards">
            <div class="reward-chip">⭐ +${m.reward} bintang</div>
            <div class="reward-chip">🏆 ${starsEarned > 0 ? '3 ⭐ Selesai' : 'Belum selesai'}</div>
          </div>
        </div>`;
    } else {
      const info = {
        endless: { icon: '🏆', title: 'Endless Run', desc: 'Tidak ada batas — lompat setinggi mungkin melewati rintangan tanpa henti! Skor bertambah setiap rintangan berhasil dilewati. Seberapa jauh kamu bisa bertahan?', badge: `🏆 Best: ${this.bestScore}` },
        rush:    { icon: '⚡', title: 'Speed Rush 2×', desc: 'Mode kecepatan ganda! Semua rintangan berputar dan bergerak 2× lebih cepat dari normal. Dibutuhkan refleks super untuk bertahan!', badge: '⚡ Butuh refleks cepat!' },
        reverse: { icon: '🔄', title: 'Mirror Mode', desc: 'Gravitasi dibalik! Astronotmu sekarang jatuh ke atas, bukan ke bawah. Tombol jump membuat astronot turun. Adaptasikan insting terbangmu!', badge: '🔄 Gravitasi terbalik' },
      }[mode];
      wrap.innerHTML = `
        <div class="mode-overview-card">
          <div class="mode-ov-icon">${info.icon}</div>
          <div class="mode-ov-title">${info.title}</div>
          <p class="mode-ov-desc">${info.desc}</p>
          <div class="best-badge">${info.badge}</div>
        </div>`;
    }
    wrap.querySelector('.mission-card, .mode-overview-card')?.animate(
      [{opacity: 0, transform: 'translateY(8px)'}, {opacity: 1, transform: 'translateY(0)'}],
      { duration: 220, easing: 'ease-out', fill: 'forwards' }
    );
  }

  // ─── GAME LIFECYCLE ────────────────────────────────────────
  startGame(mode = this.mode, level = this.currentLevel) {
    this.mode = mode; this.currentLevel = level;
    this.state = 'PLAYING'; this.isFrozen = true; this.frostPulse = 0;
    this.score = 0; this.starsEarnedRun = 0;
    this.speedMultiplier = mode === 'rush' ? 1.4 : 1.0;

    this.screenHome.classList.add('hidden');
    this.screenResult.classList.add('hidden');
    this.hudEl.classList.remove('hud-hidden');
    this.lvlWrap.style.display = mode === 'levels' ? 'flex' : 'none';
    document.getElementById('lp-mission-label').textContent = `MISI ${level}`;

    this.ball.x = this.centerX; this.ball.y = this.initialY;
    this.ball.vy = 0; this.ball.rot = 0; this.ball.squashX = 1; this.ball.squashY = 1;
    this.cameraY = 0;
    this.obstacles = []; this.collectibles = []; this.nextSpawnY = 220;

    const map = mapManager.getActiveMap();
    this.ball.color = map.colors[Math.floor(Math.random() * map.colors.length)];

    if (mode === 'levels') this.buildLevelLayout(level, map.colors);
    else { this.spawnEndlessObstacle(map.colors, 0); this.spawnEndlessObstacle(map.colors, 1); this.spawnEndlessObstacle(map.colors, 2); }
    this.hudScore.textContent = '0';
  }

  buildLevelLayout(levelNum, colors) {
    this.levelStartY = this.initialY;
    let cy = 220; const cx = this.centerX; const sw = this.virtualWidth;
    const count = 3 + Math.min(levelNum, 8);
    const mapId = mapManager.getActiveMap().id;
    const types = ['circle', 'cross', 'double_circle', 'square', 'sliding_bars'];
    for (let i = 0; i < count; i++) {
      const type  = types[(i + levelNum - 1) % types.length];
      const speed = (0.018 + levelNum * 0.0025) * (i % 2 === 0 ? 1 : -1);
      this.obstacles.push(this._makeObstacle(type, cy, speed, colors, cx, sw, mapId));
      this.collectibles.push(new StarItem(cy, cx));
      if (i < count - 1) this.collectibles.push(new ColorSwitchOrb(cy - 150, cx, colors, mapId));
      cy -= 310;
    }
    this.levelFinishY = cy - 40;
    this.collectibles.push(new FinishGate(this.levelFinishY, cx));
  }

  spawnEndlessObstacle(colors, diff = this.score) {
    const cx = this.centerX, sw = this.virtualWidth;
    const mapId = mapManager.getActiveMap().id;
    let type, speed, gap;
    if      (diff <= 2)  { type = 'circle'; speed = 0.018 * (Math.random()>.5?1:-1); gap = 360; }
    else if (diff <= 5)  { type = Math.random()>.5 ? 'circle' : 'square'; speed = 0.022 * (Math.random()>.5?1:-1); gap = 330; }
    else if (diff <= 9)  { type = ['circle','square','cross','sliding_bars'][Math.floor(Math.random()*4)]; speed = 0.025 * (Math.random()>.5?1:-1); gap = 305; }
    else                 { type = ['circle','double_circle','cross','square','sliding_bars'][Math.floor(Math.random()*5)]; speed = (0.026 + Math.min(diff*.001,.015)) * (Math.random()>.5?1:-1); gap = 290; }
    this.obstacles.push(this._makeObstacle(type, this.nextSpawnY, speed, colors, cx, sw, mapId));
    this.collectibles.push(new StarItem(this.nextSpawnY, cx));
    this.collectibles.push(new ColorSwitchOrb(this.nextSpawnY - gap * .48, cx, colors, mapId));
    this.nextSpawnY -= gap;
  }

  _makeObstacle(type, y, speed, colors, cx, sw, mapId) {
    switch (type) {
      case 'circle':        return new CircleObstacle(y, 100, 14, speed, colors, cx, mapId);
      case 'double_circle': return new DoubleCircleObstacle(y, 118, 74, 13, speed, colors, cx, mapId);
      case 'cross':         return new CrossObstacle(y, 85, 15, speed, colors, cx, mapId);
      case 'square':        return new SquareObstacle(y, 155, 14, speed, colors, cx, mapId);
      case 'sliding_bars':  return new SlidingBarsObstacle(y, colors, 2.4, cx, sw, mapId);
    }
  }

  // ─── INPUT ─────────────────────────────────────────────────
  handleJump() {
    if (this.state === 'MENU') { this.startGame(); return; }
    if (this.state !== 'PLAYING') return;
    if (this.isFrozen) {
      this.isFrozen = false;
      particleEngine.createStarBurst(this.ball.x, this.ball.y, '#bae6fd');
      particleEngine.createShockwave(this.ball.x, this.ball.y, '#38bdf8', 100);
      audio.playJump();
      this.ball.vy = this.mode === 'reverse' ? -this.jumpForce : this.jumpForce;
      this.ball.squashX = 0.84; this.ball.squashY = 1.18;
      return;
    }
    audio.playJump();
    this.ball.vy = this.mode === 'reverse' ? -this.jumpForce : this.jumpForce;
    this.ball.squashX = 0.86; this.ball.squashY = 1.16;
    const trail = skinManager.getActiveTrail();
    for (let i = 0; i < 6; i++) particleEngine.addBallTrail(this.ball.x-8, this.ball.y+10, this.ball.radius, this.ball.color, trail.id);
  }

  // ─── UPDATE ────────────────────────────────────────────────
  update() {
    particleEngine.update(this.virtualWidth, this.virtualHeight, this.cameraY);
    if (this.state !== 'PLAYING') return;

    if (this.isFrozen) { this.frostPulse += 0.05; this.ball.y = this.initialY; this.ball.vy = 0; return; }

    const grav = this.mode === 'reverse' ? -this.gravity : this.gravity;
    this.ball.vy = Math.min(this.maxVy, Math.max(-this.maxVy, this.ball.vy + grav));
    this.ball.y += this.ball.vy; this.ball.rot += 0.03;
    this.ball.squashX += (1 - this.ball.squashX) * 0.15;
    this.ball.squashY += (1 - this.ball.squashY) * 0.15;

    const trail = skinManager.getActiveTrail();
    if (this.ball.vy < 0 && Math.random() < 0.8)
      particleEngine.addBallTrail(this.ball.x - 8, this.ball.y + 12, this.ball.radius, this.ball.color, trail.id);

    // Camera
    const tY = this.ball.y - 320;
    if (tY < this.cameraY) this.cameraY += (tY - this.cameraY) * 0.12;

    // Death
    if (this.ball.y - this.cameraY > this.virtualHeight + 30) { this.triggerGameOver(); return; }

    // Obstacles
    this.obstacles.forEach(obs => {
      obs.update(this.speedMultiplier);
      if (!obs.passed && this.ball.y < obs.y - 30) { obs.passed = true; this.score++; this.hudScore.textContent = this.score; }
      if (obs.checkCollision(this.ball).hit) this.triggerGameOver();
    });

    // Spawn & recycle (endless)
    if (this.mode !== 'levels') {
      if (this.ball.y - 650 < this.nextSpawnY) this.spawnEndlessObstacle(mapManager.getActiveMap().colors, this.score);
      this.obstacles    = this.obstacles.filter(o => o.y - this.cameraY < 1200);
      this.collectibles = this.collectibles.filter(c => c.y - this.cameraY < 1200);
    } else {
      const td = this.levelStartY - this.levelFinishY;
      const cd = Math.max(0, this.levelStartY - this.ball.y);
      this.lvlBar.style.width = Math.min(100, Math.round(cd / td * 100)) + '%';
    }

    // Collectibles
    const activeMap = mapManager.getActiveMap();
    this.collectibles.forEach(item => {
      item.update();
      if (item.checkCollision(this.ball)) {
        if (item instanceof StarItem) {
          audio.playStarPickup();
          particleEngine.createStarBurst(item.x, item.y, '#fee440');
          this.playerStars++; this.starsEarnedRun++;
          document.getElementById('player-stars-val').textContent = this.playerStars;
          this.saveProgress();
        } else if (item instanceof ColorSwitchOrb) {
          audio.playColorSwitch();
          particleEngine.createShockwave(item.x, item.y, this.ball.color, 80);
          const others = activeMap.colors.filter(c => c !== this.ball.color);
          this.ball.color = others[Math.floor(Math.random() * others.length)];
        } else if (item instanceof FinishGate) {
          this.triggerLevelVictory();
        }
      }
    });
  }

  // ─── GAME OVER / VICTORY ───────────────────────────────────
  triggerGameOver() {
    this.state = 'GAME_OVER'; audio.playExplosion();
    particleEngine.createDeathShatter(this.ball.x, this.ball.y, this.ball.color, mapManager.getActiveMap().colors);
    if (this.score > this.bestScore) { this.bestScore = this.score; this.saveProgress(); }
    setTimeout(() => this.showResult(false), 600);
  }

  triggerLevelVictory() {
    this.state = 'VICTORY'; audio.playLevelComplete();
    particleEngine.createShockwave(this.ball.x, this.ball.y, '#00f5d4', 160);
    if (!this.unlockedLevels.includes(this.currentLevel + 1) && this.currentLevel < 15)
      this.unlockedLevels.push(this.currentLevel + 1);
    this.levelStars[this.currentLevel] = 3;
    // Award stars
    const mission = MISSIONS[this.currentLevel - 1];
    this.playerStars += mission.reward;
    this.starsEarnedRun += mission.reward;
    this.saveProgress(); this.renderLevels();
    setTimeout(() => this.showResult(true), 800);
  }

  showResult(isVictory) {
    this.hudEl.classList.add('hud-hidden');
    document.getElementById('result-emoji').textContent  = isVictory ? '🏆' : '💥';
    document.getElementById('result-header').textContent = isVictory ? `MISI ${this.currentLevel} BERHASIL!` : 'MISI GAGAL';
    document.getElementById('result-score-number').textContent = isVictory ? '⭐ ⭐ ⭐' : this.score;
    document.getElementById('result-best-number').textContent  = isVictory ? 'Misi berikutnya terbuka!' : `🏆 Rekor: ${this.bestScore}`;
    document.getElementById('result-stars-earned').textContent = `+${this.starsEarnedRun} bintang kosmik!`;
    document.getElementById('btn-retry-text').textContent      = isVictory && this.currentLevel < 15 ? 'MISI BERIKUTNYA ▶' : 'COBA LAGI';
    this.screenResult.classList.remove('hidden');
  }

  saveProgress() {
    localStorage.setItem('cp_best_score',       this.bestScore);
    localStorage.setItem('cp_player_stars',     this.playerStars);
    localStorage.setItem('cp_unlocked_levels',  JSON.stringify(this.unlockedLevels));
    localStorage.setItem('cp_level_stars',      JSON.stringify(this.levelStars));
    this.updateStats();
  }

  // ─── DRAW ──────────────────────────────────────────────────
  draw() {
    const ctx = this.ctx, map = mapManager.getActiveMap();
    const vw = this.virtualWidth, vh = this.virtualHeight, cx = this.centerX;
    ctx.save();
    // Background
    ctx.fillStyle = map.bgColor; ctx.fillRect(0, 0, vw, vh);
    // Nebula glow
    const ng = ctx.createRadialGradient(cx, vh/2, 80, cx, vh/2, 500);
    ng.addColorStop(0, 'rgba(56,189,248,0.07)'); ng.addColorStop(.5, 'rgba(168,85,247,0.04)'); ng.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ng; ctx.fillRect(0, 0, vw, vh);
    // Grid
    ctx.strokeStyle = map.gridColor; ctx.lineWidth = 1;
    const gs = 50, goy = -this.cameraY % gs;
    for (let x = 0; x <= vw; x += gs) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,vh); ctx.stroke(); }
    for (let y = goy; y <= vh; y += gs) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(vw,y); ctx.stroke(); }
    // Side guides
    ctx.strokeStyle = 'rgba(0,245,212,0.08)'; ctx.lineWidth = 2;
    ctx.shadowColor = '#00f5d4'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(cx-280,0); ctx.lineTo(cx-280,vh); ctx.moveTo(cx+280,0); ctx.lineTo(cx+280,vh); ctx.stroke();

    particleEngine.drawAmbient(ctx);
    particleEngine.draw(ctx, this.cameraY);

    this.obstacles.forEach(o => o.draw(ctx, this.cameraY));
    this.collectibles.forEach(c => c.draw(ctx, this.cameraY));

    // Frozen astronaut on launch pad
    if (this.state === 'PLAYING' && this.isFrozen) {
      const px = this.ball.x, py = this.ball.y - this.cameraY;
      // Launch pad glow
      ctx.save();
      ctx.strokeStyle = 'rgba(0,245,212,0.65)'; ctx.shadowColor = '#00f5d4'; ctx.shadowBlur = 16; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(px, py+28, 42, 13, 0, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = 'rgba(0,245,212,0.12)'; ctx.fill(); ctx.restore();
      // Ice stasis shield
      ctx.save();
      const fr = this.ball.radius + 9 + Math.sin(this.frostPulse)*2;
      ctx.strokeStyle = '#bae6fd'; ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 18; ctx.lineWidth = 2.2;
      ctx.setLineDash([7,4]);
      ctx.beginPath(); ctx.arc(px, py, fr, 0, Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 6; i++) {
        const a = i*Math.PI/3 + this.frostPulse*.4;
        ctx.beginPath(); ctx.arc(px+Math.cos(a)*(fr+3), py+Math.sin(a)*(fr+3), 2.5, 0, Math.PI*2); ctx.fill();
      }
      ctx.restore();
      // Tooltip guide
      ctx.save();
      const gy = py - 54 + Math.sin(this.frostPulse*1.5)*4;
      const txt = 'Tekan SPASI / Klik untuk Meluncur';
      ctx.font = '800 14px "Outfit", sans-serif';
      const pw = ctx.measureText(txt).width + 28, ph = 34;
      ctx.fillStyle = 'rgba(13,20,36,0.94)'; ctx.strokeStyle = '#00f5d4'; ctx.lineWidth = 1.8;
      ctx.shadowColor = '#00f5d4'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.roundRect(px-pw/2, gy-ph/2, pw, ph, 17); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowBlur = 0; ctx.fillText(txt, px, gy);
      ctx.font = '16px sans-serif'; ctx.fillText('👇', px, py-20);
      ctx.restore();
    }

    // Draw astronaut
    if (this.state === 'PLAYING' || this.state === 'MENU') {
      const skin = skinManager.getActiveSkin();
      ctx.save(); ctx.translate(this.ball.x, this.ball.y - this.cameraY);
      ctx.scale(this.ball.squashX, this.ball.squashY);
      skin.draw(ctx, 0, 0, this.ball.radius, this.ball.color, this.ball.rot, this.ball.vy);
      ctx.restore();
    }
    ctx.restore();
  }

  gameLoop() { this.update(); this.draw(); requestAnimationFrame(() => this.gameLoop()); }

  // ─── HANGAR RENDER ─────────────────────────────────────────
  renderHangar() {
    const self = this;
    const buildGrid = (containerId, parts, activeFn, selectFn) => {
      const el = document.getElementById(containerId);
      el.innerHTML = '';
      parts.forEach(p => {
        const isActive = activeFn() === p.id;
        const card = document.createElement('div');
        card.className = `shop-card ${isActive ? 'active' : ''}`;
        card.innerHTML = `
          <div class="shop-card-icon">${p.icon}</div>
          <div class="shop-card-title">${p.name}</div>
          <div class="shop-card-desc">${p.desc}</div>
          <button class="shop-card-btn ${isActive ? 'btn-equipped' : (p.isUnlocked ? 'btn-use' : 'btn-buy')}">
            ${isActive ? '✓ AKTIF' : (p.isUnlocked ? 'PAKAI' : `⭐ ${p.starPrice}`)}
          </button>`;
        card.onclick = () => {
          audio.playClick && audio.playClick();
          if (p.isUnlocked || p.starPrice === 0) {
            selectFn(p.id, self.playerStars);
            if (!p.isUnlocked) { self.playerStars -= p.starPrice; self.saveProgress(); }
          } else {
            if (self.playerStars >= p.starPrice) {
              selectFn(p.id, self.playerStars);
              self.playerStars -= p.starPrice;
              self.saveProgress();
            } else { alert(`Butuh ${p.starPrice} ⭐. Kamu punya ${self.playerStars}.`); return; }
          }
          this.renderHangar(); this.updateStats(); this.drawPreview();
        };
        el.appendChild(card);
      });
    };
    buildGrid('htab-helm',    skinManager.helmParts,    () => skinManager.activeHelm,    (id,s) => skinManager.selectHelm(id,s));
    buildGrid('htab-body',    skinManager.bodyParts,    () => skinManager.activeBody,    (id,s) => skinManager.selectBody(id,s));
    buildGrid('htab-jetpack', skinManager.jetpackParts, () => skinManager.activeJetpack, (id,s) => skinManager.selectJetpack(id,s));
    this.drawPreview();
  }

  drawPreview() {
    const ctx = this.previewCtx;
    if (!ctx) return;
    ctx.clearRect(0, 0, 200, 200);
    // Dark space BG
    ctx.fillStyle = '#080c14'; ctx.fillRect(0, 0, 200, 200);
    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    for (let i = 0; i < 30; i++) {
      ctx.beginPath(); ctx.arc(Math.random()*200, Math.random()*200, Math.random()*1.2, 0, Math.PI*2); ctx.fill();
    }
    const skin = skinManager.getActiveSkin();
    skin.draw(ctx, 100, 110, 28, mapManager.getActiveMap().colors[0], 0, 0);

    // Info
    const h = skinManager.helmParts.find(p=>p.id===skinManager.activeHelm);
    const b = skinManager.bodyParts.find(p=>p.id===skinManager.activeBody);
    const j = skinManager.jetpackParts.find(p=>p.id===skinManager.activeJetpack);
    document.getElementById('preview-helm-name').textContent   = `🪖 ${h?.name||'—'}`;
    document.getElementById('preview-body-name').textContent   = `🧥 ${b?.name||'—'}`;
    document.getElementById('preview-jet-name').textContent    = `🚀 ${j?.name||'—'}`;
  }

  // ─── LEVEL GRID ────────────────────────────────────────────
  renderLevels() {
    const c = document.getElementById('levels-container'); c.innerHTML = '';
    for (let i = 1; i <= 15; i++) {
      const unlocked = this.unlockedLevels.includes(i);
      const stars = this.levelStars[i] || 0;
      const m = MISSIONS[i-1];
      const card = document.createElement('div');
      card.className = `level-card ${unlocked ? '' : 'locked'}`;
      card.innerHTML = `
        <div style="font-size:1.4rem;">${m.icon}</div>
        <div class="level-num">${i}</div>
        <div class="level-stars">${unlocked ? (stars > 0 ? '⭐'.repeat(stars) : '☆☆☆') : '🔒'}</div>`;
      if (unlocked) card.onclick = () => {
        audio.playClick && audio.playClick();
        this.currentLevel = i;
        this.renderMissionBrief('levels', i);
        document.getElementById('modal-levels-select').classList.remove('active');
      };
      c.appendChild(card);
    }
  }

  // ─── MAPS ──────────────────────────────────────────────────
  renderMaps() {
    const c = document.getElementById('maps-container'); c.innerHTML = '';
    mapManager.maps.forEach(map => {
      const isActive = mapManager.activeMapId === map.id;
      const card = document.createElement('div');
      card.className = `map-card-wide ${isActive ? 'active' : ''}`;
      const swatches = map.colors.map(c => `<div class="map-swatch-dot" style="background:${c}"></div>`).join('');
      card.innerHTML = `
        <div style="font-size:2rem;">${map.icon}</div>
        <div style="flex:1">
          <div style="font-weight:800;font-size:1rem;">${map.name}</div>
          <div style="font-size:0.76rem;color:var(--muted-lt);">${map.desc}</div>
          <div class="map-swatches-row">${swatches}</div>
        </div>
        <button class="shop-card-btn ${isActive?'btn-equipped':(map.isUnlocked?'btn-use':'btn-buy')}" style="width:96px;">
          ${isActive?'✓ AKTIF':(map.isUnlocked?'PILIH':`⭐${map.starPrice}`)}
        </button>`;
      card.onclick = () => {
        if (map.isUnlocked) {
          mapManager.selectMap(map.id);
          particleEngine.initAmbient(map.id, this.virtualWidth, this.virtualHeight);
        } else if (this.playerStars >= map.starPrice) {
          this.playerStars -= map.starPrice;
          mapManager.unlockMap(map.id, map.starPrice);
          mapManager.selectMap(map.id);
          this.saveProgress();
        } else { alert(`Butuh ⭐${map.starPrice}`); return; }
        this.renderMaps(); this.updateStats(); this.drawPreview();
      };
      c.appendChild(card);
    });
  }

  // ─── EVENT LISTENERS ──────────────────────────────────────
  setupEventListeners() {
    // Jump
    window.addEventListener('keydown', e => {
      if (['Space','ArrowUp'].includes(e.code) || ['w','W'].includes(e.key)) { e.preventDefault(); this.handleJump(); }
      if (e.key === 'Escape') document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      if (e.key === 'f' || e.key === 'F') this.toggleFullscreen();
    });
    this.canvas.addEventListener('pointerdown', e => { e.preventDefault(); this.handleJump(); });

    // Sidebar mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.onclick = () => { audio.playClick && audio.playClick(); this.selectModeBtn(btn.dataset.mode); };
    });

    // Play button
    document.getElementById('btn-play-game').onclick = () => {
      audio.playClick && audio.playClick();
      if (this.mode === 'levels') this.startGame('levels', this.currentLevel);
      else this.startGame(this.mode);
    };

    // Right panel buttons
    document.getElementById('btn-open-hangar').onclick    = () => { audio.playClick && audio.playClick(); this.renderHangar(); document.getElementById('modal-hangar').classList.add('active'); };
    document.getElementById('btn-open-levels-select').onclick = () => { audio.playClick && audio.playClick(); document.getElementById('modal-levels-select').classList.add('active'); };
    document.getElementById('btn-open-maps').onclick      = () => { audio.playClick && audio.playClick(); this.renderMaps(); document.getElementById('modal-maps').classList.add('active'); };

    // Close buttons
    document.getElementById('btn-close-hangar').onclick = () => document.getElementById('modal-hangar').classList.remove('active');
    document.getElementById('btn-close-levels').onclick = () => document.getElementById('modal-levels-select').classList.remove('active');
    document.getElementById('btn-close-maps').onclick   = () => document.getElementById('modal-maps').classList.remove('active');

    // Hangar tabs
    document.querySelectorAll('[data-htab]').forEach(tab => {
      tab.onclick = () => {
        document.querySelectorAll('[data-htab]').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        ['htab-helm','htab-body','htab-jetpack'].forEach(id => {
          document.getElementById(id).classList.toggle('hidden', id !== tab.dataset.htab);
        });
      };
    });

    // Result screen
    document.getElementById('btn-retry-game').onclick = () => {
      audio.playClick && audio.playClick();
      this.screenResult.classList.add('hidden');
      if (this.state === 'VICTORY' && this.currentLevel < 15) this.startGame('levels', this.currentLevel + 1);
      else this.startGame();
    };
    document.getElementById('btn-result-menu').onclick = () => {
      audio.playClick && audio.playClick();
      this.screenResult.classList.add('hidden');
      this.screenHome.classList.remove('hidden');
      this.hudEl.classList.add('hud-hidden');
      this.state = 'MENU'; this.cameraY = 0; this.ball.y = this.initialY;
    };
    document.getElementById('btn-result-hangar').onclick = () => {
      audio.playClick && audio.playClick();
      this.screenResult.classList.add('hidden');
      this.screenHome.classList.remove('hidden');
      this.hudEl.classList.add('hud-hidden');
      this.state = 'MENU'; this.cameraY = 0; this.ball.y = this.initialY;
      this.renderHangar(); document.getElementById('modal-hangar').classList.add('active');
    };

    // HUD buttons
    document.getElementById('btn-hud-pause').onclick = () => {
      this.screenResult.classList.add('hidden');
      this.screenHome.classList.remove('hidden');
      this.hudEl.classList.add('hud-hidden');
      this.state = 'MENU'; this.cameraY = 0; this.ball.y = this.initialY;
      this.renderMissionBrief(this.mode, this.currentLevel);
    };
    document.getElementById('btn-sound-toggle').onclick = () => {
      const muted = audio.toggleMute();
      document.getElementById('btn-sound-toggle').textContent = muted ? '🔇' : '🔊';
    };
    document.getElementById('btn-fullscreen-toggle').onclick = () => this.toggleFullscreen();
  }

  toggleFullscreen() {
    !document.fullscreenElement
      ? document.documentElement.requestFullscreen().catch(() => {})
      : document.exitFullscreen().catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', () => { window.game = new ColorSwitchGame(); });
