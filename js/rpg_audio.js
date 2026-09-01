/**
 * REALM OF VALIANT - Web Audio API Sound Synthesizer
 * Procedural SFX for combat, spells, ambient dungeon sounds, and fanfares.
 */

class RPGSoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('rpg_muted') === 'true';
    this.bgmPlaying = false;
    this.bgmOscs = [];
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('rpg_muted', this.isMuted);
    if (this.isMuted) {
      this.stopBGM();
    }
    return this.isMuted;
  }

  // Melee weapon slash whoosh
  playSlash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.linearRampToValueAtTime(400, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  // Heavy Impact / Critical Hit
  playHitImpact(isCrit = false) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isCrit ? 'square' : 'triangle';
    const startFreq = isCrit ? 220 : 160;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + (isCrit ? 0.25 : 0.12));

    gain.gain.setValueAtTime(isCrit ? 0.35 : 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isCrit ? 0.25 : 0.12));

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + (isCrit ? 0.25 : 0.12));

    if (isCrit) {
      // Add metallic clang
      const clang = this.ctx.createOscillator();
      const clangGain = this.ctx.createGain();
      clang.type = 'sine';
      clang.frequency.setValueAtTime(880, t);
      clang.frequency.exponentialRampToValueAtTime(440, t + 0.18);
      clangGain.gain.setValueAtTime(0.25, t);
      clangGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      clang.connect(clangGain);
      clangGain.connect(this.ctx.destination);
      clang.start(t);
      clang.stop(t + 0.18);
    }
  }

  // Dash / Dodge Roll Whoosh
  playDash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(250, t + 0.18);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  // Fireball cast & explosion
  playFireball() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(540, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.3);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  // Frost Nova / Ice spell
  playIceSpell() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987, t); // B5
    osc.frequency.exponentialRampToValueAtTime(1318, t + 0.08); // E6
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.22); // A6

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  // Lightning / Thunder Shock
  playThunder() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.22);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  // Potion Drink / Healing
  playHeal() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const t = this.ctx.currentTime + i * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.12);
    });
  }

  // Loot Pickup Chime
  playLootPickup(rarity = 'common') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    let freqs = [659.25, 783.99]; // Normal
    if (rarity === 'legendary' || rarity === 'mythic') {
      freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    } else if (rarity === 'epic') {
      freqs = [587.33, 783.99, 1174.66];
    }

    freqs.forEach((f, i) => {
      const t = this.ctx.currentTime + i * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  // Level Up Fanfare
  playLevelUp() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const chords = [
      { f: 523.25, d: 0.12, off: 0.0 }, // C5
      { f: 659.25, d: 0.12, off: 0.09 }, // E5
      { f: 783.99, d: 0.12, off: 0.18 }, // G5
      { f: 1046.50, d: 0.35, off: 0.27 }, // C6
      { f: 1318.51, d: 0.5, off: 0.45 }  // E6
    ];

    chords.forEach(c => {
      const t = this.ctx.currentTime + c.off;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(c.f, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + c.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + c.d);
    });
  }

  // Boss Roar Warning
  playBossRoar() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.linearRampToValueAtTime(140, t + 0.3);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.9);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.9);
  }

  // Ambient Dungeon Low Drone
  startAmbientBGM() {
    if (this.isMuted || this.bgmPlaying) return;
    this.init();
    if (!this.ctx) return;

    try {
      this.bgmPlaying = true;
      const t = this.ctx.currentTime;

      // Low tonic drone
      const drone = this.ctx.createOscillator();
      const droneGain = this.ctx.createGain();
      drone.type = 'sine';
      drone.frequency.setValueAtTime(65.41, t); // C2

      droneGain.gain.setValueAtTime(0.04, t);
      drone.connect(droneGain);
      droneGain.connect(this.ctx.destination);
      drone.start(t);

      this.bgmOscs = [drone];
    } catch (e) {}
  }

  stopBGM() {
    this.bgmPlaying = false;
    this.bgmOscs.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {}
    });
    this.bgmOscs = [];
  }
}

const rpgAudio = new RPGSoundEngine();
