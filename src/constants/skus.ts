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
    color: '#a855f7', // Glowing purple
    baseValue: 500,
    rarity: 'LEGENDARY',
  },
};

export const DEFAULT_C_SHARP_SCRIPT = `using System;
using System.Collections.Generic;

public class RobotScript
{
    // Her Oyun Tick'inde çağrılan tam otonom C# algoritması
    public void Execute(IRobot robot)
    {
        // 1. Kargo Kontrolü: Kargo dolunca Kargocu Transporter robotunu radyo ile çağır!
        int currentCargo = robot.GetCargo();
        int maxCargo = robot.GetMaxCargo();

        if (currentCargo >= maxCargo - 10)
        {
            // Sürü Şebekesine radyo sinyali at (Lojistik Transporter robotu yanımıza gelecek!)
            robot.SendRadioMessage("CARGO_FULL", robot.GetX(), robot.GetY(), robot.GetId());

            // Kargo tamamen dolduysa (100%) güvenlik için Depoya adımla
            if (currentCargo >= maxCargo)
            {
                BuildingInfo depot = robot.GetNearestBuilding("DEPOT");
                robot.GoTo(depot.X, depot.Y);
                return;
            }
        }

        // 2. Batarya Kontrolü: Enerji kritik seviyedeyse en yakın ŞARJ İSTASYONUNA dön!
        int currentEnergy = robot.GetEnergy();
        int energyNeeded = robot.GetEnergyToNearestStation();

        if (currentEnergy <= 25 || currentEnergy <= energyNeeded + 2)
        {
            BuildingInfo station = robot.GetNearestBuilding("CHARGING_PAD");
            robot.GoTo(station.X, station.Y);
            return;
        }

        // 3. Radar Sensörü ile Çevredeki Madenleri Tara
        List<RadarTileInfo> radarData = robot.GetRadarInfo();

        RadarTileInfo targetResource = null;
        foreach (var info in radarData)
        {
            if (info.TileType == "RESOURCE" && info.Amount > 0)
            {
                targetResource = info;
                break;
            }
        }

        // 4. Önümüzdeki Karoda Maden Varsa Kaz, Yoksa Otonom İlerle
        Tile frontTile = robot.GetTileInfo(Direction.Forward);

        if (frontTile.HasResource && frontTile.Amount > 0)
        {
            robot.Mine();
        }
        else if (targetResource != null)
        {
            // Target madenin koordinatına adımla
            robot.GoTo(targetResource.X, targetResource.Y);
        }
        else
        {
            robot.Move(Direction.Forward);
        }
    }
}`;

export const DEFAULT_POWER_PLANT_C_SHARP_SCRIPT = `using System;

public class PowerPlantScript
{
    public void Execute(IPowerPlant plant)
    {
        double temp = plant.GetTemperature();
        double gridRatio = plant.GetGridEnergyRatio();

        // 1. Termal Güvenlik Kontrolü: Patlamayı engellemek için 85°C üstünde dondur/soğut
        if (temp > 85.0)
        {
            plant.SetOverclockRate(0.5); // Soğutma Modu
            return;
        }

        // 2. Enerji İhtiyacına Göre Yakıt & Overclock Ayarı
        if (gridRatio < 0.3 && temp < 65.0)
        {
            // Şebeke boş ve santral soğuksa yüksek hızda yakıt yak
            plant.SetOverclockRate(1.6);
            plant.BurnFuel("COAL_ORE");
        }
        else if (gridRatio < 0.7)
        {
            plant.SetOverclockRate(1.0);
            plant.BurnFuel("COAL_ORE");
        }
        else
        {
            // Şebeke doluysa yakıt tasarrufu sağla
            plant.SetOverclockRate(0.7);
        }
    }
}`;

export const DEFAULT_TRANSPORTER_C_SHARP_SCRIPT = `using System;
using System.Collections.Generic;

public class TransporterScript
{
    public void Execute(IRobot robot)
    {
        // 1. Kargo Haznesi Dolduysa En Yakın DEPOYA git ve boşalt
        if (robot.GetCargo() >= robot.GetMaxCargo() - 20)
        {
            BuildingInfo depot = robot.GetNearestBuilding("DEPOT");
            robot.GoTo(depot.X, depot.Y);
            return;
        }

        // 2. Batarya Düşükse Şarj İstasyonuna Dön
        if (robot.GetEnergy() <= 30)
        {
            BuildingInfo station = robot.GetNearestBuilding("CHARGING_PAD");
            robot.GoTo(station.X, station.Y);
            return;
        }

        // 3. Sürü Radyo Şebekesindeki "CARGO_FULL" Yardım Mesajlarını Dinle
        List<RadioMessage> radioMsgs = robot.ReadRadioMessages();
        foreach (var msg in radioMsgs)
        {
            if (msg.MessageType == "CARGO_FULL")
            {
                // Madencinin konumuna hızlıca adımla (2x Hız)
                robot.GoTo(msg.X, msg.Y);

                // Madencinin yanındaysa kargoyu devral!
                if (Math.Abs(msg.X - robot.GetX()) <= 1 && Math.Abs(msg.Y - robot.GetY()) <= 1)
                {
                    robot.CollectCargoFromRobot(msg.SenderId);
                }
                return;
            }
        }

        // 4. Çağrı Yoksa Haritada Otonom Devriye Gez
        robot.Move(Direction.Forward);
    }
}`;

export const DEFAULT_REPAIR_DRONE_C_SHARP_SCRIPT = `using System;
using System.Collections.Generic;

public class RepairDroneScript
{
    public void Execute(IRobot robot)
    {
        // 1. Batarya Düşükse Şarj İstasyonuna Dön
        if (robot.GetEnergy() <= 25)
        {
            BuildingInfo station = robot.GetNearestBuilding("CHARGING_PAD");
            robot.GoTo(station.X, station.Y);
            return;
        }

        // 2. Hasar Görmüş Robotları Tara ve Otonom Tamir Et (Lazer Tamir Işını)
        List<RobotInfo> damagedRobots = robot.GetDamagedRobots();
        if (damagedRobots.Count > 0)
        {
            RobotInfo target = damagedRobots[0];
            int dist = Math.Abs(target.X - robot.GetX()) + Math.Abs(target.Y - robot.GetY());
            
            // 1 Karo yakınındaysa dur ve Lazer Tamir Işını ile onar (Üstüne tırmanma!)
            if (dist <= 1)
            {
                robot.RepairRobot(target.Id);
            }
            else
            {
                robot.GoTo(target.X, target.Y);
            }
            return;
        }

        // 3. Çağrı Yoksa Sahada Otonom Devriye Gez
        robot.Move(Direction.Forward);
    }
}`;
