/**
 * REALM OF VALIANT - Item Database, Equipment & Rarity System
 * Manages weapons, armor, accessories, potions, loot drops, and blacksmith upgrade.
 */

const RARITY_DATA = {
  common: { name: 'Biasa', color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.4)', mult: 1.0 },
  rare: { name: 'Langka', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)', mult: 1.4 },
  epic: { name: 'Epik', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)', mult: 2.0 },
  legendary: { name: 'Legendaris', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.7)', mult: 3.0 },
  mythic: { name: 'Mitos', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.85)', mult: 4.5 }
};

const ITEM_DATABASE = {
  weapons: [
    { id: 'sword_iron', name: 'Pedang Besi Tempa', slot: 'weapon', baseAtk: 18, critRate: 5, icon: '🗡️', desc: 'Pedang tajam andalan prajurit kerajaan.' },
    { id: 'sword_flame', name: 'Pedang Api Neraka', slot: 'weapon', baseAtk: 38, critRate: 12, icon: '🔥', desc: 'Bilah pedang menyala yang membakar daging musuh.' },
    { id: 'staff_apprentice', name: 'Tongkat Kayu Sihir', slot: 'weapon', baseAtk: 16, critRate: 8, icon: '🪄', desc: 'Tongkat pemula untuk menyalurkan energi mantera.' },
    { id: 'staff_archmage', name: 'Tongkat Kristal Surgawi', slot: 'weapon', baseAtk: 42, critRate: 15, icon: '🔮', desc: 'Memancarkan aura sihir kosmik berkekuatan dahsyat.' },
    { id: 'dagger_rogue', name: 'Belati Bayangan Kembar', slot: 'weapon', baseAtk: 15, critRate: 20, icon: '🗡️', desc: 'Belati super ringan untuk tebasan bertubi-tubi.' },
    { id: 'dagger_death', name: 'Belati Pembunuh Raja', slot: 'weapon', baseAtk: 35, critRate: 30, icon: '⚡', desc: 'Senjata legendaris para pembunuh bayaran terkejam.' }
  ],

  armors: [
    { id: 'armor_leather', name: 'Zirah Kulit Serigala', slot: 'armor', baseDef: 8, baseHp: 50, icon: '🛡️', desc: 'Ringan dan memberikan keleluasaan bergerak.' },
    { id: 'armor_plate', name: 'Zirah Ksatria Baja', slot: 'armor', baseDef: 22, baseHp: 180, icon: '🛡️', desc: 'Pelat baja tebal pelindung dari tebasan mematikan.' },
    { id: 'armor_robe', name: 'Jubah Tenun Mistik', slot: 'armor', baseDef: 12, baseHp: 90, icon: '🥻', desc: 'Jubah sutra yang meredam serangan magis musuh.' },
    { id: 'armor_dragon', name: 'Zirah Sisik Naga Purba', slot: 'armor', baseDef: 35, baseHp: 320, icon: '🐉', desc: 'Ditempa dari sisik naga legendaris yang tak tertembus.' }
  ],

  rings: [
    { id: 'ring_ruby', name: 'Cincin Ruby Berapi', slot: 'ring', baseAtk: 12, baseHp: 40, icon: '💍', desc: 'Meningkatkan kekuatan serangan dan daya tahan.' },
    { id: 'ring_sapphire', name: 'Cincin Safir Biru', slot: 'ring', baseMp: 60, critRate: 6, icon: '💎', desc: 'Meningkatkan kapasitas mana dan peluang kritikal.' },
    { id: 'ring_valiant', name: 'Cincin Keabadian Raja', slot: 'ring', baseAtk: 25, baseHp: 120, baseMp: 80, icon: '👑', desc: 'Cincin pusaka warisan para pahlawan terhebat.' }
  ],

  amulets: [
    { id: 'amulet_wolf', name: 'Jimat Taring Serigala', slot: 'amulet', speedBoost: 15, icon: '📿', desc: 'Meningkatkan kecepatan lari pahlawan.' },
    { id: 'amulet_phoenix', name: 'Jimat Bulu Phoenix', slot: 'amulet', baseHp: 150, baseMp: 50, speedBoost: 20, icon: '🦅', desc: 'Menganugerahkan energi vitalitas burung abadi.' }
  ],

  potions: [
    { id: 'pot_hp', name: 'Ramuan Darah (HP)', type: 'consumable', healHp: 180, icon: '🧪', desc: 'Memulihkan 180 HP seketika.', price: 25 },
    { id: 'pot_mp', name: 'Ramuan Mana (MP)', type: 'consumable', healMp: 120, icon: '💧', desc: 'Memulihkan 120 Mana seketika.', price: 20 }
  ]
};

// Item Entity on Dungeon Floor (Loot Drop)
class DroppedItem {
  constructor(x, y, itemData) {
    this.x = x;
    this.y = y;
    this.item = itemData; // Object item
    this.radius = 12;
    this.floatTimer = Math.random() * Math.PI * 2;
    this.pickedUp = false;
    this.rarity = itemData.rarity || 'common';
    this.color = RARITY_DATA[this.rarity].color;
  }

  update() {
    this.floatTimer += 0.08;
  }

  draw(ctx, camera) {
    const sx = this.x - camera.x;
    const sy = this.y - camera.y + Math.sin(this.floatTimer) * 5;

    ctx.save();
    // Vertical Light Beacon
    const grad = ctx.createLinearGradient(sx, sy - 60, sx, sy);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, this.color);
    ctx.fillStyle = grad;
    ctx.fillRect(sx - 4, sy - 60, 8, 60);

    // Glowing circle
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(sx, sy, 10, 0, Math.PI * 2);
    ctx.fill();

    // Item Icon
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.item.icon || '📦', sx, sy);

    ctx.restore();
  }
}

// Loot Generator Helper
function generateRandomLoot(x, y, floorLevel = 1, forceRarity = null) {
  // Determine Rarity
  let rarity = 'common';
  const roll = Math.random() * 100;

  if (forceRarity) {
    rarity = forceRarity;
  } else if (roll < 4 + floorLevel * 2) {
    rarity = 'mythic';
  } else if (roll < 14 + floorLevel * 4) {
    rarity = 'legendary';
  } else if (roll < 35 + floorLevel * 6) {
    rarity = 'epic';
  } else if (roll < 65) {
    rarity = 'rare';
  }

  // Pick category
  const categories = ['weapons', 'armors', 'rings', 'amulets'];
  const cat = categories[Math.floor(Math.random() * categories.length)];
  const pool = ITEM_DATABASE[cat];
  const template = pool[Math.floor(Math.random() * pool.length)];

  // Calculate scaled stats based on rarity and floor
  const mult = RARITY_DATA[rarity].mult * (1 + floorLevel * 0.15);
  const item = {
    ...template,
    uniqueId: 'item_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    rarity: rarity,
    upgradeLevel: 0,
    atk: template.baseAtk ? Math.round(template.baseAtk * mult) : 0,
    def: template.baseDef ? Math.round(template.baseDef * mult) : 0,
    hp: template.baseHp ? Math.round(template.baseHp * mult) : 0,
    mp: template.baseMp ? Math.round(template.baseMp * mult) : 0,
    critRate: template.critRate ? Math.round(template.critRate * (1 + (mult - 1) * 0.5)) : 0,
    speedBoost: template.speedBoost ? Math.round(template.speedBoost * mult) : 0
  };

  return new DroppedItem(x, y, item);
}
