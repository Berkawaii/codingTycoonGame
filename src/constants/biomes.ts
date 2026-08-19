import { BiomeType, HazardType, RarityType } from '../types/game';

export interface BiomeResourceTemplate {
  sku: string;
  name: string;
  type: 'IRON_ORE' | 'COPPER_ORE' | 'GOLD_ORE' | 'CRYSTAL';
  baseValue: number;
  rarity: RarityType;
  color: string;
  description: string;
}

export interface BiomeDefinition {
  id: BiomeType;
  name: string;
  subtitle: string;
  description: string;
  unlockPrice: number; // 0 = default unlocked
  hazardType: HazardType;
  hazardDamage: number;
  hazardName: string;
  bgColor: string;
  gridLineColor: string;
  primaryAccentColor: string;
  exclusiveResources: BiomeResourceTemplate[];
}

export function getBiomeName(biomeId: BiomeType, lang: 'tr' | 'en' = 'tr'): string {
  if (lang === 'en') {
    switch (biomeId) {
      case 'MARS_BASIN': return 'Mars Basin Desert';
      case 'VOLCANIC': return 'Volcanic Magma Basin';
      case 'QUANTUM_CAVERN': return 'Quantum Crystal Cavern';
      case 'GLACIER': return 'Glacial Permafrost Wastes';
      default: return 'Mars Basin Desert';
    }
  }
  return BIOME_CATALOG[biomeId]?.name || 'Mars Çöl Havzası';
}

export function getBiomeSubtitle(biomeId: BiomeType, lang: 'tr' | 'en' = 'tr'): string {
  if (lang === 'en') {
    switch (biomeId) {
      case 'MARS_BASIN': return 'Default Base Mining Grounds';
      case 'VOLCANIC': return 'Molten Lava Rivers & Ruby Crystals';
      case 'QUANTUM_CAVERN': return 'Nuclear Radiation & Quantum Particles';
      case 'GLACIER': return 'Slippery Ice Layer & Diamond Crystals';
      default: return 'Default Base Mining Grounds';
    }
  }
  return BIOME_CATALOG[biomeId]?.subtitle || 'Varsayılan Temel Maden Sahası';
}

export const BIOME_CATALOG: Record<BiomeType, BiomeDefinition> = {
  MARS_BASIN: {
    id: 'MARS_BASIN',
    name: 'Mars Çöl Havzası',
    subtitle: 'Varsayılan Temel Maden Sahası',
    description: 'Dengeli demir ve altın madeni damarları içeren standart keşif bölgesi.',
    unlockPrice: 0,
    hazardType: 'NONE',
    hazardDamage: 0,
    hazardName: 'Tehlike Yok',
    bgColor: '#090e17',
    gridLineColor: '#1e293b',
    primaryAccentColor: '#00f2fe',
    exclusiveResources: [
      {
        sku: 'COAL_ORE',
        name: 'Kömür Yatağı',
        type: 'IRON_ORE',
        baseValue: 20,
        rarity: 'COMMON',
        color: '#64748b',
        description: 'Santrallerde yakılabilen yüksek kalorili termal kömür cevheri.',
      },
      {
        sku: 'FE_ORE',
        name: 'Demir Cevheri',
        type: 'IRON_ORE',
        baseValue: 15,
        rarity: 'COMMON',
        color: '#e2e8f0',
        description: 'Binalar ve robot gövdeleri için işlenen temel sanayi demiri.',
      },
      {
        sku: 'AU_ORE',
        name: 'Altın Külçesi',
        type: 'GOLD_ORE',
        baseValue: 50,
        rarity: 'RARE',
        color: '#facc15',
        description: 'Yüksek değerli iletken devrelerde kullanılan saf altın.',
      },
    ],
  },
  VOLCANIC: {
    id: 'VOLCANIC',
    name: 'Volkanik Magma Havzası',
    subtitle: 'Erimiş Lav Nehirleri ve Yakut Kristaller',
    description: 'Yüksek ısıya sahip lav nehirleri (-15 Enerji Hasarı). Değerli Kızıl Yakut damarları barındırır.',
    unlockPrice: 2500,
    hazardType: 'LAVA',
    hazardDamage: 15,
    hazardName: 'Erimiş Lav Karosu (-15 ⚡/tick)',
    bgColor: '#0c0a09',
    gridLineColor: '#27272a',
    primaryAccentColor: '#ef4444',
    exclusiveResources: [
      {
        sku: 'RUBY_GEM',
        name: 'Magma Yakutu',
        type: 'CRYSTAL',
        baseValue: 220,
        rarity: 'RARE',
        color: '#ef4444',
        description: 'Yüksek enerji lazerlerinde kullanılan değerli kızıl magma yakutu.',
      },
      {
        sku: 'OBSIDIAN_ORE',
        name: 'Obsidyen Kayacı',
        type: 'COPPER_ORE',
        baseValue: 95,
        rarity: 'UNCOMMON',
        color: '#a855f7',
        description: 'Ultra sert cam zırhlar için işlenen volkanik obsidyen.',
      },
    ],
  },
  QUANTUM_CAVERN: {
    id: 'QUANTUM_CAVERN',
    name: 'Kuantum Kristal Mağarası',
    subtitle: 'Nükleer Radyasyon ve Kuantum Parçacıkları',
    description: 'Radyasyon patlamaları (-20 Enerji Hasarı). En kıymetli Kuantum Kristali burada çıkar.',
    unlockPrice: 7500,
    hazardType: 'RADIATION',
    hazardDamage: 20,
    hazardName: 'Kuantum Radyasyon Alanı (-20 ⚡/tick)',
    bgColor: '#0f0e17',
    gridLineColor: '#2e1065',
    primaryAccentColor: '#d946ef',
    exclusiveResources: [
      {
        sku: 'QUANTUM_CRYSTAL',
        name: 'Kuantum Çekirdeği',
        type: 'CRYSTAL',
        baseValue: 550,
        rarity: 'LEGENDARY',
        color: '#e879f9',
        description: 'Sonsuz enerji hücreleri üreten efsanevi kuantum kristali.',
      },
      {
        sku: 'PLASMA_ORE',
        name: 'Plazma Cevheri',
        type: 'GOLD_ORE',
        baseValue: 180,
        rarity: 'RARE',
        color: '#06b6d4',
        description: 'İyonik reaktörleri besleyen iyonize plazma maddesi.',
      },
    ],
  },
  GLACIER: {
    id: 'GLACIER',
    name: 'Buzul Permafrost Çölü',
    subtitle: 'Kaygan Buz Tabakası ve Elmas Kristalleri',
    description: 'Sıfırın altında kaygan buz tabakası. Aşırı sert Elmas Buz damarları içerir.',
    unlockPrice: 15000,
    hazardType: 'ICE',
    hazardDamage: 5,
    hazardName: 'Kaygan Buz Tabakası (İleri Kayma)',
    bgColor: '#082f49',
    gridLineColor: '#164e63',
    primaryAccentColor: '#38bdf8',
    exclusiveResources: [
      {
        sku: 'DIAMOND_ICE',
        name: 'Buzul Elması',
        type: 'CRYSTAL',
        baseValue: 850,
        rarity: 'LEGENDARY',
        color: '#bae6fd',
        description: 'Galaktik pazarda servet değerinde olan saf kutup buzul elması.',
      },
    ],
  },
};
