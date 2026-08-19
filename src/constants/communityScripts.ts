export interface CommunityScript {
  id: string;
  title: string;
  author: string;
  avatarColor: string;
  downloads: number;
  rating: number;
  reviewsCount: number;
  category: 'SWARM_LOGISTICS' | 'AUTO_MINING' | 'RARE_HUNTER' | 'POWER_PLANT' | 'INDUSTRIAL';
  tags: string[];
  description: string;
  targetType: 'ROBOT' | 'POWER_PLANT';
  code: string;
}

export const COMMUNITY_SCRIPTS_CATALOG: CommunityScript[] = [
  {
    id: 'script-community-1',
    title: '🚚 Sürü Lojistik Pro v2 (Transporter Carrier AI)',
    author: '@MarsLogisticsDev',
    avatarColor: '#f97316',
    downloads: 1420,
    rating: 4.9,
    reviewsCount: 184,
    category: 'SWARM_LOGISTICS',
    tags: ['TRANSPORTER', 'SWARM_RADIO', '2X_SPEED'],
    description: 'Transporter robotlar için tasarlanmış 2x hızlı otonom lojistik algoritması. Madencilerin radyo sinyalini dinler, kargoları depoya aktarır.',
    targetType: 'ROBOT',
    code: `using System;
using System.Collections.Generic;

public class TransporterScript
{
    public void Execute(IRobot robot)
    {
        // 1. Kargo Haznesi Dolduysa (%90+) En Yakın DEPOYA git ve boşalt
        if (robot.GetCargo() >= robot.GetMaxCargo() - 20)
        {
            BuildingInfo depot = robot.GetNearestBuilding("DEPOT");
            robot.GoTo(depot.X, depot.Y);
            return;
        }

        // 2. Batarya Düşükse (%25) Şarj İstasyonuna Dön
        if (robot.GetEnergy() <= 30)
        {
            BuildingInfo station = robot.GetNearestBuilding("CHARGING_PAD");
            robot.GoTo(station.X, station.Y);
            return;
        }

        // 3. Sürü Radyo Şebekesindeki "CARGO_FULL" Sinyallerini Dinle
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
}`,
  },
  {
    id: 'script-community-2',
    title: '⛏️ Akıllı Tam Otomatik Madenci v3',
    author: '@CyberMiner_01',
    avatarColor: '#00f2fe',
    downloads: 2850,
    rating: 5.0,
    reviewsCount: 312,
    category: 'AUTO_MINING',
    tags: ['MINER', 'AUTO_DEPOT', 'RADIO_SIGNAL'],
    description: 'Radar sensörleriyle en yakın madeni bulur, %80 kargoda Transporter\'ı radyo ile çağırır, bataryası %25\'e inince şarj istasyonuna dönerek tam tur atar.',
    targetType: 'ROBOT',
    code: `using System;
using System.Collections.Generic;

public class RobotScript
{
    public void Execute(IRobot robot)
    {
        int currentCargo = robot.GetCargo();
        int maxCargo = robot.GetMaxCargo();

        // 1. Kargo Kontrolü: Kargo dolunca Lojistik Transporter robotunu radyo ile çağır!
        if (currentCargo >= maxCargo - 10)
        {
            robot.SendRadioMessage("CARGO_FULL", robot.GetX(), robot.GetY(), robot.GetId());

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
            robot.GoTo(targetResource.X, targetResource.Y);
        }
        else
        {
            robot.Move(Direction.Forward);
        }
    }
}`,
  },
  {
    id: 'script-community-3',
    title: '💎 Nadir Altın & Kuantum Kristali Avcısı',
    author: '@QuantumEngineer',
    avatarColor: '#eab308',
    downloads: 940,
    rating: 4.8,
    reviewsCount: 95,
    category: 'RARE_HUNTER',
    tags: ['MINER', 'RADAR', 'RARE_RESOURCES'],
    description: 'Radar verisinden sıradan demirleri atlayıp sadece Altın (SKU-GOLD-01) ve Kuantum Kristallerine (SKU-CRYSTAL-01) kilitlenir.',
    targetType: 'ROBOT',
    code: `using System;
using System.Collections.Generic;

public class RareHunterScript
{
    public void Execute(IRobot robot)
    {
        // 1. Şarj ve Kargo Kontrolü
        if (robot.GetEnergy() <= 30)
        {
            BuildingInfo station = robot.GetNearestBuilding("CHARGING_PAD");
            robot.GoTo(station.X, station.Y);
            return;
        }

        if (robot.GetCargo() >= robot.GetMaxCargo() - 10)
        {
            robot.SendRadioMessage("CARGO_FULL", robot.GetX(), robot.GetY(), robot.GetId());
            return;
        }

        // 2. Radardan SADECE Nadir Altın veya Kuantum Kristallerini Tara
        List<RadarTileInfo> radarData = robot.GetRadarInfo();
        RadarTileInfo rareNode = null;

        foreach (var info in radarData)
        {
            if ((info.SKU == "SKU-GOLD-01" || info.SKU == "SKU-CRYSTAL-01") && info.Amount > 0)
            {
                rareNode = info;
                break;
            }
        }

        // 3. Nadir Madene Kilitlen ve Kaz
        Tile front = robot.GetTileInfo(Direction.Forward);
        if (front.HasResource && (front.SKU == "SKU-GOLD-01" || front.SKU == "SKU-CRYSTAL-01"))
        {
            robot.Mine();
        }
        else if (rareNode != null)
        {
            robot.GoTo(rareNode.X, rareNode.Y);
        }
        else
        {
            robot.Move(Direction.Forward);
        }
    }
}`,
  },
  {
    id: 'script-community-4',
    title: '⚡ Termal Santral Termokupl Soğutma AI',
    author: '@ThermalWizard',
    avatarColor: '#10b981',
    downloads: 1150,
    rating: 4.9,
    reviewsCount: 140,
    category: 'POWER_PLANT',
    tags: ['POWER_PLANT', 'OVERCLOCK', 'SAFETY_COOL'],
    description: 'Santral sıcaklığını 85°C altında tutar. Sıcaklık düşünce Overclock\'u 2.0x yapar, ısınınca 0.5x\'e çekip yakıt tasarrufu sağlar.',
    targetType: 'POWER_PLANT',
    code: `using System;

public class PowerPlantScript
{
    public void Execute(IPowerPlant plant)
    {
        double temp = plant.GetTemperature();
        double gridRatio = plant.GetGridEnergyRatio();

        // 1. Termal Güvenlik Kontrolü: Patlamayı engellemek için 85°C üstünde dondur/soğut
        if (temp > 85.0)
        {
            plant.SetOverclockRate(0.5); // Minimum saat hızına çekip soğut
            return;
        }

        // 2. Akıllı Güç Şebekesi Dengesi
        if (gridRatio < 0.50 && temp < 75.0)
        {
            plant.SetOverclockRate(2.0); // Şebeke zayıfsa 2x Overclock bas
        }
        else if (gridRatio > 0.90)
        {
            plant.SetOverclockRate(0.8); // Şebeke doluysa yakıt tasarrufu yap
        }
        else
        {
            plant.SetOverclockRate(1.0); // Standart saat hızı
        }
    }
}`,
  },
  {
    id: 'script-community-5',
    title: '⚙️ Dökümhane & Rafineri Otomatik Tedarikçi',
    author: '@FactoryAutomation',
    avatarColor: '#c084fc',
    downloads: 780,
    rating: 4.7,
    reviewsCount: 82,
    category: 'INDUSTRIAL',
    tags: ['INDUSTRIAL', 'SMELTER', 'REFINERY'],
    description: 'Madenlerden topladığı cevherleri dökümhaneye teslim eder, dökülmüş Külçe ve Çelikleri toplayıp depoya getirir.',
    targetType: 'ROBOT',
    code: `using System;

public class IndustrialSupplierScript
{
    public void Execute(IRobot robot)
    {
        // 1. Kargo Doluysa Depoya Boşalt
        if (robot.GetCargo() >= robot.GetMaxCargo() - 10)
        {
            BuildingInfo depot = robot.GetNearestBuilding("DEPOT");
            robot.GoTo(depot.X, depot.Y);
            return;
        }

        // 2. Üretim Tesisine Ham Madde Teslim Et
        BuildingInfo smelter = robot.GetNearestBuilding("SMELTER");
        if (smelter != null && robot.GetCargo() > 0)
        {
            robot.GoTo(smelter.X, smelter.Y);
            robot.DepositRawMaterial();
            return;
        }

        // 3. Maden Kazmaya Devam Et
        robot.Move(Direction.Forward);
    }
}`,
  },
];
