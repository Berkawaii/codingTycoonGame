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
        // 1. Kargo Kontrolü: Kargo haznesi dolmak üzereyse (%80+) en yakın DEPOYA git ve boşalt!
        int currentCargo = robot.GetCargo();
        int maxCargo = robot.GetMaxCargo();

        if (currentCargo >= maxCargo - 10)
        {
            BuildingInfo depot = robot.GetNearestBuilding("DEPOT");
            robot.GoTo(depot.X, depot.Y);
            return;
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
