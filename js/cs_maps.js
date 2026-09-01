/**
 * COLOR PULSE - Map Worlds & Color Palettes Database
 * 5 Unique visual themes with custom color palettes, background styling, and unlocking costs.
 */

const MAPS_DATABASE = [
  {
    id: 'cyber',
    name: 'Cyber Neon',
    icon: '🌌',
    desc: 'Dunia cyberpunk futuristik dengan kisi-kisi cahaya neon berenergi tinggi.',
    colors: ['#00f5d4', '#ff007f', '#fee440', '#7928ca'],
    bgColor: '#080c14',
    bgGradient: 'radial-gradient(circle at 50% 30%, #111a2e 0%, #080c14 100%)',
    gridColor: 'rgba(0, 245, 212, 0.04)',
    starPrice: 0,
    isUnlocked: true
  },
  {
    id: 'sunset',
    name: 'Sunset Vaporwave',
    icon: '🌅',
    desc: 'Nuansa synthwave hangat dengan gradasi langit senja merah jambu dan jingga.',
    colors: ['#ff7b00', '#ff007f', '#9d4edd', '#00f0ff'],
    bgColor: '#160924',
    bgGradient: 'radial-gradient(circle at 50% 20%, #2e1047 0%, #160924 100%)',
    gridColor: 'rgba(255, 0, 127, 0.05)',
    starPrice: 20,
    isUnlocked: false
  },
  {
    id: 'galaxy',
    name: 'Deep Galaxy',
    icon: '🪐',
    desc: 'Ruang angkasa kosmik luas dengan kilauan bintang dan nebula misterius.',
    colors: ['#38bdf8', '#f43f5e', '#facc15', '#4ade80'],
    bgColor: '#060a1a',
    bgGradient: 'radial-gradient(circle at 50% 40%, #101c40 0%, #060a1a 100%)',
    gridColor: 'rgba(56, 189, 248, 0.04)',
    starPrice: 35,
    isUnlocked: false
  },
  {
    id: 'lava',
    name: 'Lava Inferno',
    icon: '🌋',
    desc: 'Kawah gunung berapi membara dengan percikan partikel bara api merah panas.',
    colors: ['#f97316', '#ef4444', '#eab308', '#a855f7'],
    bgColor: '#18070b',
    bgGradient: 'radial-gradient(circle at 50% 50%, #380d14 0%, #18070b 100%)',
    gridColor: 'rgba(239, 68, 68, 0.05)',
    starPrice: 50,
    isUnlocked: false
  },
  {
    id: 'frost',
    name: 'Frost Glacier',
    icon: '❄️',
    desc: 'Gletser es kutub abadi dengan kristal salju beku yang berkilauan indah.',
    colors: ['#06b6d4', '#3b82f6', '#a855f7', '#f43f5e'],
    bgColor: '#061222',
    bgGradient: 'radial-gradient(circle at 50% 30%, #0d2747 0%, #061222 100%)',
    gridColor: 'rgba(6, 182, 212, 0.05)',
    starPrice: 65,
    isUnlocked: false
  }
];

class MapManager {
  constructor() {
    this.maps = MAPS_DATABASE;
    this.activeMapId = localStorage.getItem('cp_active_map') || 'cyber';
    this.loadUnlockedMaps();
  }

  loadUnlockedMaps() {
    const saved = localStorage.getItem('cp_unlocked_maps');
    if (saved) {
      try {
        const unlockedIds = JSON.parse(saved);
        this.maps.forEach(m => {
          if (unlockedIds.includes(m.id)) m.isUnlocked = true;
        });
      } catch (e) {}
    }
  }

  saveUnlockedMaps() {
    const unlockedIds = this.maps.filter(m => m.isUnlocked).map(m => m.id);
    localStorage.setItem('cp_unlocked_maps', JSON.stringify(unlockedIds));
  }

  getActiveMap() {
    return this.maps.find(m => m.id === this.activeMapId) || this.maps[0];
  }

  selectMap(mapId) {
    const map = this.maps.find(m => m.id === mapId);
    if (map && map.isUnlocked) {
      this.activeMapId = mapId;
      localStorage.setItem('cp_active_map', mapId);
      return true;
    }
    return false;
  }

  unlockMap(mapId, playerStars) {
    const map = this.maps.find(m => m.id === mapId);
    if (map && !map.isUnlocked && playerStars >= map.starPrice) {
      map.isUnlocked = true;
      this.saveUnlockedMaps();
      return true;
    }
    return false;
  }
}

const mapManager = new MapManager();
