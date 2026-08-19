import { SKU } from '../types/game';

export const SKU_CATALOG: Record<string, SKU> = {
  'SKU-IRON-01': {
    sku: 'SKU-IRON-01',
    name: 'Demir Cevheri (Raw Iron)',
    type: 'IRON_ORE',
    unit: 'Kg',
    description: 'Temel sanayi metali. İnşaat ve makine üretiminde kullanılır.',
    color: '#3b82f6', // Glowing blue
    baseValue: 10,
    rarity: 'COMMON',
  },
  'COAL_ORE': {
    sku: 'COAL_ORE',
    name: 'Kömür Cevheri',
    type: 'IRON_ORE',
    unit: 'Kg',
    description: 'Santrallerde yakıt olarak yakılan yüksek kalorili termal kömür.',
    color: '#475569',
    baseValue: 20,
    rarity: 'COMMON',
  },
  'FE_ORE': {
    sku: 'FE_ORE',
    name: 'Demir Cevheri',
    type: 'IRON_ORE',
    unit: 'Kg',
    description: 'Binalar ve robot gövdeleri için işlenen temel sanayi demiri.',
    color: '#e2e8f0',
    baseValue: 15,
    rarity: 'COMMON',
  },
  'SKU-COPPER-01': {
    sku: 'SKU-COPPER-01',
    name: 'Bakır Cevheri (Raw Copper)',
    type: 'COPPER_ORE',
    unit: 'Kg',
    description: 'Yüksek iletkenliğe sahip metal. Elektrik devreleri için şarttır.',
    color: '#f97316', // Glowing orange
    baseValue: 25,
    rarity: 'UNCOMMON',
  },
  'SKU-GOLD-01': {
    sku: 'SKU-GOLD-01',
    name: 'Altın Cevheri (Raw Gold)',
    type: 'GOLD_ORE',
    unit: 'Gram',
    description: 'Değerli nadir metal. Mikroçip ve lüks otomasyon sistemlerinde kullanılır.',
    color: '#eab308', // Glowing gold
    baseValue: 100,
    rarity: 'RARE',
  },
  'AU_ORE': {
    sku: 'AU_ORE',
    name: 'Altın Külçesi',
    type: 'GOLD_ORE',
    unit: 'Gram',
    description: 'Yüksek değerli iletken devrelerde kullanılan saf altın.',
    color: '#facc15',
    baseValue: 50,
    rarity: 'RARE',
  },
  'RUBY_GEM': {
    sku: 'RUBY_GEM',
    name: 'Magma Yakutu',
    type: 'CRYSTAL',
    unit: 'Karat',
    description: 'Volkanik haritada bulunan değerli kızıl magma yakutu.',
    color: '#ef4444',
    baseValue: 220,
    rarity: 'RARE',
  },
  'OBSIDIAN_ORE': {
    sku: 'OBSIDIAN_ORE',
    name: 'Obsidyen Kayacı',
    type: 'COPPER_ORE',
    unit: 'Kg',
    description: 'Ultra sert volkanik obsidyen kayacı.',
    color: '#a855f7',
    baseValue: 95,
    rarity: 'UNCOMMON',
  },
  'QUANTUM_CRYSTAL': {
    sku: 'QUANTUM_CRYSTAL',
    name: 'Kuantum Çekirdeği',
    type: 'CRYSTAL',
    unit: 'Çekirdek',
    description: 'Sonsuz enerji hücreleri üreten kuantum kristali.',
    color: '#e879f9',
    baseValue: 550,
    rarity: 'LEGENDARY',
  },
  'PLASMA_ORE': {
    sku: 'PLASMA_ORE',
    name: 'Plazma Cevheri',
    type: 'GOLD_ORE',
    unit: 'Litre',
    description: 'İyonik reaktörleri besleyen iyonize plazma.',
    color: '#06b6d4',
    baseValue: 180,
    rarity: 'RARE',
  },
  'DIAMOND_ICE': {
    sku: 'DIAMOND_ICE',
    name: 'Buzul Elması',
    type: 'CRYSTAL',
    unit: 'Karat',
    description: 'Buzul Permafrost biyomundan çıkarılan nadide elmas buz kristali.',
    color: '#bae6fd',
    baseValue: 850,
    rarity: 'LEGENDARY',
  },
  // Phase 6 Refined & Processed Factory Products (10x Value)
  'STEEL_INGOT': {
    sku: 'STEEL_INGOT',
    name: 'Döküm Çelik Külçesi',
    type: 'IRON_ORE',
    unit: 'Adet',
    description: 'Dökümhanede 2x Demir Cevherinden işlenmiş yüksek mukavemetli çelik.',
    color: '#94a3b8',
    baseValue: 450,
    rarity: 'UNCOMMON',
  },
  'REINFORCED_ALLOY': {
    sku: 'REINFORCED_ALLOY',
    name: 'Pekiştirilmiş Obsidyen Alaşımı',
    type: 'CRYSTAL',
    unit: 'Adet',
    description: 'Dökümhanede 2x Obsidyen Cevherinden işlenmiş ultra zırh alaşımı.',
    color: '#a855f7',
    baseValue: 1200,
    rarity: 'RARE',
  },
  'QUANTUM_CHIP': {
    sku: 'QUANTUM_CHIP',
    name: 'Kuantum Mikroçip',
    type: 'GOLD_ORE',
    unit: 'Adet',
    description: 'Rafineride 2x Altından hassas dökümle üretilmiş süper-iletken çip.',
    color: '#38bdf8',
    baseValue: 2500,
    rarity: 'RARE',
  },
  'PLASMA_CORE': {
    sku: 'PLASMA_CORE',
    name: 'Plazma Enerji Çekirdeği',
    type: 'CRYSTAL',
    unit: 'Adet',
    description: 'Rafineride 2x Kuantum Kristalinden saflaştırılmış muazzam enerji kaynağı.',
    color: '#ec4899',
    baseValue: 4800,
    rarity: 'LEGENDARY',
  },
  'SKU-CRYSTAL-01': {
    sku: 'SKU-CRYSTAL-01',
    name: 'Kuantum Kristali (Quantum Crystal)',
    type: 'CRYSTAL',
    unit: 'Karat',
    description: 'Yüksek enerjili kristal. Gelişmiş WASM çekirdeklerini besler.',
    color: '#a855f7',
    baseValue: 500,
    rarity: 'LEGENDARY',
  },
};

export function getLocalizedSkuName(skuItem: SKU, lang: 'tr' | 'en'): string {
  if (lang === 'tr') return skuItem.name;
  switch (skuItem.sku) {
    case 'SKU-IRON-01': return 'Raw Iron Ore';
    case 'COAL_ORE': return 'Coal Ore';
    case 'FE_ORE': return 'Iron Ore';
    case 'SKU-COPPER-01': return 'Raw Copper Ore';
    case 'SKU-GOLD-01': return 'Raw Gold Ore';
    case 'AU_ORE': return 'Gold Bar';
    case 'RUBY_GEM': return 'Magma Ruby';
    case 'OBSIDIAN_ORE': return 'Obsidian Ore';
    case 'QUANTUM_CRYSTAL': return 'Quantum Crystal Core';
    case 'PLASMA_ORE': return 'Plasma Ore';
    case 'DIAMOND_ICE': return 'Glacial Ice Diamond';
    case 'STEEL_INGOT': return 'Smelted Steel Ingot';
    case 'REINFORCED_ALLOY': return 'Reinforced Obsidian Alloy';
    case 'QUANTUM_CHIP': return 'Quantum Microchip';
    case 'PLASMA_CORE': return 'Plasma Power Core';
    case 'SKU-CRYSTAL-01': return 'Quantum Crystal';
    default: return skuItem.name;
  }
}

export function getLocalizedSkuDesc(skuItem: SKU, lang: 'tr' | 'en'): string {
  if (lang === 'tr') return skuItem.description;
  switch (skuItem.sku) {
    case 'SKU-IRON-01': return 'Essential industrial metal. Used for construction and robotics.';
    case 'COAL_ORE': return 'High thermal coal burned in power plants for energy.';
    case 'FE_ORE': return 'Essential iron mined for structures and robot chassis.';
    case 'SKU-COPPER-01': return 'High conductivity metal required for electrical circuits.';
    case 'SKU-GOLD-01': return 'Precious rare metal for microchips and automation.';
    case 'AU_ORE': return 'Pure gold ingot used in high-value conductive circuits.';
    case 'RUBY_GEM': return 'Valuable magma ruby used in high-energy lasers.';
    case 'OBSIDIAN_ORE': return 'Ultra-hard volcanic obsidian rock.';
    case 'QUANTUM_CRYSTAL': return 'Quantum crystal generating infinite energy cells.';
    case 'PLASMA_ORE': return 'Ionized plasma fueling ion reactors.';
    case 'DIAMOND_ICE': return 'Rare diamond ice crystal extracted from permafrost.';
    case 'STEEL_INGOT': return 'High-strength steel smelted from 2x iron ore.';
    case 'REINFORCED_ALLOY': return 'Ultra armor alloy smelted from 2x obsidian ore.';
    case 'QUANTUM_CHIP': return 'Superconducting microchip refined from 2x gold.';
    case 'PLASMA_CORE': return 'Massive power core refined from 2x quantum crystals.';
    case 'SKU-CRYSTAL-01': return 'High energy crystal feeding advanced WASM cores.';
    default: return skuItem.description;
  }
}

export function getLocalizedSkuUnit(unit: string, lang: 'tr' | 'en'): string {
  if (lang === 'tr') return unit;
  switch (unit.toLowerCase()) {
    case 'kg': return 'kg';
    case 'gram': return 'Grams';
    case 'karat': return 'Carats';
    case 'çekirdek': return 'Cores';
    case 'litre': return 'Liters';
    case 'adet': return 'Units';
    default: return unit;
  }
}

export const DEFAULT_C_SHARP_SCRIPT = `using System;
using System.Collections.Generic;

public class RobotScript
{
    public void Execute(IRobot robot)
    {    }
}`;

export const DEFAULT_POWER_PLANT_C_SHARP_SCRIPT = `using System;
using System.Collections.Generic;

public class PowerPlantScript
{
    public void Execute(IPowerPlant plant)
    {    }
}`;

export const DEFAULT_TRANSPORTER_C_SHARP_SCRIPT = `using System;
using System.Collections.Generic;

public class TransporterScript
{
    public void Execute(IRobot robot)
    {    }
}`;

export const DEFAULT_REPAIR_DRONE_C_SHARP_SCRIPT = `using System;
using System.Collections.Generic;

public class RepairDroneScript
{
    public void Execute(IRobot robot)
    {    }
}`;
