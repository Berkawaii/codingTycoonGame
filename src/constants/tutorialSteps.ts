export interface TutorialStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  taskText: string;
  conceptsText: string;
  starterCode: string;
  targetObjectiveText: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    title: 'Bölüm 1: İlk Adım (Robot Hareketi)',
    subtitle: 'Robotu otonom hareket ettirmeyi öğrenin.',
    description: 'Robotlar harita üzerinde adımlayabilmek için Move komutuna ihtiyaç duyar.',
    taskText: "Robotu ileri doğru adımlatmak için 'robot.Move(Direction.Forward);' komutunu editöre yükleyip Çalıştır'a basın.",
    conceptsText: 'robot.Move(), Direction.Forward',
    targetObjectiveText: 'Canlı Hedef: Robotun simülatörde en az 3 adım hareket etmesini sağlayın.',
    starterCode: `using System;

public class RobotScript
{
    public void Execute(IRobot robot)
    {
        // 1. Robotu İleri Hareket Ettir
        robot.Move(Direction.Forward);
    }
}`,
  },
  {
    id: 2,
    title: 'Bölüm 2: Maden Algılama ve Kazı',
    subtitle: 'Önünüzdeki maden damarını algılayıp kazın.',
    description: 'Robotlar önlerindeki hücreyi GetTileInfo() ile tarayabilir ve maden varsa robot.Mine() ile kazabilir.',
    taskText: 'Önünüzdeki karede maden olup olmadığını kontrol edin ve maden varsa kazı yapın.',
    conceptsText: 'robot.GetTileInfo(), tile.HasResource, robot.Mine()',
    targetObjectiveText: 'Canlı Hedef: Simülatörde en az 1 birim maden kazısı gerçekleştirin.',
    starterCode: `using System;

public class RobotScript
{
    public void Execute(IRobot robot)
    {
        // 1. Önümüzdeki Karoyu Tara
        Tile frontTile = robot.GetTileInfo(Direction.Forward);

        // 2. Maden Varsa Kaz, Yoksa İlerle
        if (frontTile.HasResource && frontTile.Amount > 0)
        {
            robot.Mine();
        }
        else
        {
            robot.Move(Direction.Forward);
        }
    }
}`,
  },
  {
    id: 3,
    title: 'Bölüm 3: Batarya ve Otomatik Şarj',
    subtitle: 'Şarj azaldığında en yakın Şarj İstasyonuna dönün.',
    description: 'Robotların enerjisi biterse çalışmayı durdurur. GetEnergy() ile bataryayı izleyip Şarj İstasyonuna gidebilirsiniz.',
    taskText: "Enerji düştüğünde en yakın CHARGING_PAD binasının koordinatına GoTo() ile yönelin.",
    conceptsText: 'robot.GetEnergy(), robot.GetNearestBuilding("CHARGING_PAD"), robot.GoTo(x, y)',
    targetObjectiveText: 'Canlı Hedef: Robotun bir Şarj İstasyonuna ulaşıp şarj olmasını sağlayın.',
    starterCode: `using System;

public class RobotScript
{
    public void Execute(IRobot robot)
    {
        // 1. Batarya Seviyesi Düşükse Şarj İstasyonuna Git
        if (robot.GetEnergy() <= 35)
        {
            BuildingInfo station = robot.GetNearestBuilding("CHARGING_PAD");
            robot.GoTo(station.X, station.Y);
            return;
        }

        // 2. Aksi Taktirde İlerle
        robot.Move(Direction.Forward);
    }
}`,
  },
  {
    id: 4,
    title: 'Bölüm 4: Kargo Haznesi ve Lojistik Depo',
    subtitle: 'Kargo dolduğunda madenleri Lojistik Depoya boşaltın.',
    description: 'Robotun kargo kapasitesi dolduğunda depoya gitmezse kazdığı madenleri taşıyamaz ve pazarda satamazsınız.',
    taskText: "Kargo dolmak üzereyse (%80+) en yakın DEPOT binasına gidip kargonuzu boşaltın.",
    conceptsText: 'robot.GetCargo(), robot.GetMaxCargo(), robot.GetNearestBuilding("DEPOT")',
    targetObjectiveText: 'Canlı Hedef: Robotun kargosunu Lojistik Depo karesinde boşaltmasını sağlayın.',
    starterCode: `using System;

public class RobotScript
{
    public void Execute(IRobot robot)
    {
        // 1. Kargo Dolmak Üzereyse Depoya Git
        if (robot.GetCargo() >= robot.GetMaxCargo() - 10)
        {
            BuildingInfo depot = robot.GetNearestBuilding("DEPOT");
            robot.GoTo(depot.X, depot.Y);
            return;
        }

        // 2. Normal Harekete Devam Et
        robot.Move(Direction.Forward);
    }
}`,
  },
  {
    id: 5,
    title: 'Bölüm 5: Radar Sensörü ile Otonom Arama',
    subtitle: 'Radar taraması ile haritadaki madenleri otomatik tespit edin.',
    description: 'Radar sensörü menzildeki tüm madenlerin (X,Y) koordinatlarını listeler.',
    taskText: 'GetRadarInfo() ile çevredeki madenleri tarayın ve tespit edilen madenin koordinatına GoTo() ile ilerleyin.',
    conceptsText: 'robot.GetRadarInfo(), RadarTileInfo, targetResource.X, targetResource.Y',
    targetObjectiveText: 'Canlı Hedef: Radar tespiti ile uzak bir madene ulaşıp kazı yapın.',
    starterCode: `using System;
using System.Collections.Generic;

public class RobotScript
{
    public void Execute(IRobot robot)
    {
        // 1. Radarı Tara
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

        // 2. Maden Bulunduysa Otonom Git
        if (targetResource != null)
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
    id: 6,
    title: 'Bölüm 6: Tam Otonom Master Tycoon Algoritması',
    subtitle: 'Tüm sistemleri birleştiren profesyonel fabrika algoritması!',
    description: 'Tebrikler! Kargo yönetimi, batarya koruması, radar taraması ve kazı mantığını tek bir otonom C# algoritmasında birleştirin.',
    taskText: 'Tüm sistemleri içeren Master algoritmayı çalıştırarak Tycoon Sertifikasını ($1,000 Bonus) kazanın!',
    conceptsText: 'Tam Otonom Algoritma Entegrasyonu',
    targetObjectiveText: 'Canlı Hedef: Tam otonom döngüyü çalıştırarak $1,000 Tycoon Sertifika Bonusunu kazanın.',
    starterCode: `using System;
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
}`,
  },
  {
    id: 7,
    title: 'Bölüm 7: Kuantum Enerji Santrali & C# Yakıt Yönetimi',
    subtitle: 'Depodaki cevherleri otomatik yakarak şebekeyi besleyin!',
    description: 'Santraller SADECE Şarj İstasyonu bitişiğine kurulur. Deponuzdaki cevherleri (Kömür, Demir, Plazma) yakarak şebeke deposunu doldurur.',
    taskText: 'Santral C# kodunda BurnFuel() ile yakıt türünü ("COAL_ORE" veya "FE_ORE") belirleyin ve SetOverclockRate() ile sıcaklığı kontrol edin.',
    conceptsText: 'plant.BurnFuel("COAL_ORE"), plant.SetOverclockRate(1.6), plant.GetTemperature(), plant.GetGridEnergyRatio()',
    targetObjectiveText: 'Canlı Hedef: Santral scripti ile deponuzdan yakıt yakarak şebekeye enerji pompalayın.',
    starterCode: `using System;

public class PowerPlantScript
{
    public void Execute(IPowerPlant plant)
    {
        double temp = plant.GetTemperature();
        double gridRatio = plant.GetGridEnergyRatio();

        // 1. Isınma Kontrolü (85°C Üstünde Soğutma Moduna Geç)
        if (temp > 85.0)
        {
            plant.SetOverclockRate(0.5); // Soğutma Modu
            return;
        }

        // 2. Yakıt Seçimi ve Enerji Üretimi
        // Kullanılabilir Yakıt Kodları: "COAL_ORE" (+50 kWh), "FE_ORE" (+30 kWh), "RUBY_GEM" (+200 kWh), "PLASMA_CORE" (+1500 kWh)
        if (gridRatio < 0.4 && temp < 65.0)
        {
            plant.SetOverclockRate(1.6); // %160 Hızlı Yakım
            plant.BurnFuel("COAL_ORE");  // Kömür Cevheri Yak
        }
        else
        {
            plant.SetOverclockRate(1.0);
            plant.BurnFuel("FE_ORE");    // Demir Cevheri Yak
        }
    }
}`,
  },
  {
    id: 8,
    title: 'Bölüm 8: Lojistik Transporter & Sürü Radyo Şebekesi',
    subtitle: 'Madenciler sahada kesintisiz kazar, Kargocu robotlar radyo ile kargoları toplayıp depoya taşır!',
    description: 'Madenci robot kargosu dolunca SendRadioMessage("CARGO_FULL", x, y, id) yayını yapar. Lojistik Transporter robotu (200kg kargo, 2x hız) radyo sinyalini okur, madencinin yanına gidip CollectCargoFromRobot(id) ile kargoyu devralır!',
    taskText: 'Sürü mantığı yazın: Madenciniz depoya yürümeden radyo yayınlasın, Transporter robotu kargoyu sahadan toplasın!',
    conceptsText: 'robot.SendRadioMessage(), robot.ReadRadioMessages(), robot.CollectCargoFromRobot()',
    targetObjectiveText: 'Canlı Hedef: Madenci kargosunu sahada Lojistik Transporter robota devredin.',
    starterCode: `using System;
using System.Collections.Generic;

public class TransporterScript
{
    public void Execute(IRobot robot)
    {
        // 1. Kargocu Depoya Dolu Kargoyu Boşaltır
        if (robot.GetCargo() >= robot.GetMaxCargo() - 20)
        {
            BuildingInfo depot = robot.GetNearestBuilding("DEPOT");
            robot.GoTo(depot.X, depot.Y);
            return;
        }

        // 2. Sürü Şebekesindeki "CARGO_FULL" Çağrılarını Dinle
        List<RadioMessage> radioMsgs = robot.ReadRadioMessages();
        foreach (var msg in radioMsgs)
        {
            if (msg.MessageType == "CARGO_FULL")
            {
                robot.GoTo(msg.X, msg.Y);

                if (Math.Abs(msg.X - robot.GetX()) <= 1 && Math.Abs(msg.Y - robot.GetY()) <= 1)
                {
                    robot.CollectCargoFromRobot(msg.SenderId);
                }
                return;
            }
        }

        robot.Move(Direction.Forward);
    }
}`,
  },
  {
    id: 9,
    title: 'Bölüm 9: Korsan Baskınları, Çevre Tehlikeleri & Savunma Otomasyonu',
    subtitle: 'Korsan robotlara, kum fırtınalarına karşı otonom savunma ve tamir ağını kurun.',
    description: 'Mars kum fırtınalarında robotlar aşınır ve korsan robotlar depolardan maden çalmaya çalışır. BANDIT_SPOTTED radyo sinyali yayarak kuleleri ve tamir dronelarını otonom devreye sokabilirsiniz.',
    taskText: "Robot radarda Korsan görünce 'BANDIT_SPOTTED' radyo alarmı yaysın ve Tamir Drone robotu hasarlı birimleri otonom onarsın.",
    conceptsText: 'BANDIT_SPOTTED, robot.GetDamagedRobots(), robot.RepairRobot()',
    targetObjectiveText: 'Canlı Hedef: Korsan robotlara karşı radyo alarmı yayınlayın veya Tamir Drone ile hasarlı bir birimi onarın.',
    starterCode: `using System;
using System.Collections.Generic;

public class DefenseAndRepairScript
{
    public void Execute(IRobot robot)
    {
        // 1. Batarya Düşükse Şarj Ol
        if (robot.GetEnergy() <= 25)
        {
            BuildingInfo station = robot.GetNearestBuilding("CHARGING_PAD");
            robot.GoTo(station.X, station.Y);
            return;
        }

        // 2. Hasarlı Robotları Tara ve Otonom Lazer Işını ile Onar
        List<RobotInfo> damaged = robot.GetDamagedRobots();
        if (damaged.Count > 0)
        {
            RobotInfo target = damaged[0];
            robot.GoTo(target.X, target.Y);
            if (Math.Abs(target.X - robot.GetX()) <= 1 && Math.Abs(target.Y - robot.GetY()) <= 1)
            {
                robot.RepairRobot(target.Id);
            }
            return;
        }

        // 3. Sahada Korsan Belirdiyse Radyo Şebekesine Alarm Yay (BANDIT_SPOTTED)
        robot.SendRadioMessage("BANDIT_SPOTTED", robot.GetX(), robot.GetY(), robot.GetId());
    }
}`,
  },
];
