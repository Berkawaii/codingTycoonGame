export type Language = 'tr' | 'en';

export const translations = {
  tr: {
    // Brand & Header
    brand_subtitle: 'OTOMASYON MOTORU AKTİF',
    balance: 'Bakiye',
    grid_power: 'Şebeke Gücü',
    no_power_plant: 'Santral Yok',
    map: 'Harita',
    seed_prompt: 'Harita Seed (Tohum) kodu girin:',
    leaderboard: 'Liderlik',
    scripts: 'Scriptler',
    login: 'Giriş Yap',
    logout: 'Çıkış Yap',
    admin_panel: 'ADMIN PANEL',
    user_role: 'USER ROLE',
    reset_factory: 'Fabrikayı Sıfırla',

    // Controls
    speed: 'Hız',
    play: 'Başlat',
    pause: 'Duraklat',
    step: 'Adım',

    // Canvas Grid
    canvas_title: 'SAHA SİMÜLATÖRÜ & IZGARA',
    location: 'Konum',
    quick_build_info: 'Bu kareye tek tıkla tesis inşa et:',
    charge_station: 'Şarj İstasyonu',
    depot: 'Lojistik Deposu',
    free: 'BEDAVA',
    ore: 'Maden',
    weather_clear: 'HAVA DURUMU: AÇIK',
    weather_storm: 'UYARI: ELEKTROMANYETİK FIRTINA',

    // Editor & Tabs
    robot_code: 'ROBOT KODU',
    power_plant_code: 'SANTRAL KODU',
    academy: 'Akademi',
    my_scripts: 'Scriptlerim',
    run_code: 'C# Kodunu Çalıştır',
    code_ready: '{name} için script hazır',

    // Bottom Panels & Details
    inventory: 'Envanter',
    market: 'Market',
    shop: 'Mağaza',
    api_ref: 'C# API',
    robots: 'Robotlar',
    logs: 'Konsol Logları',
    clear_logs: 'Temizle',
    total_val: 'Toplam Değer',

    // Market Panel
    current_balance: 'Mevcut Bakiye',
    sell_all_depot: 'Depodaki Tüm Madenleri Sat',
    live_ore_market: 'CANLI MADEN PAZARI (FABRİKA DEPOSU SATIŞ LİSTESİ)',
    field_cargo_note: '* Henüz depoya gitmemiş kargolar burada görünmez',
    empty_depot_title: 'Depoda Teslim Edilmiş Satılabilir Stok Bulunmuyor',
    empty_depot_desc: 'Robotların kazdığı madenler henüz kendi kargo haznesindedir. Robotlar madenleri Lojistik Depoya (DEPOT) bırakıp boşalttıkça pazarda otomatik satışa açılır.',
    unit_price: 'Birim',
    sell_10: 'Sat (10)',
    sell_all: 'Hepsini Sat',

    // Shop Panel
    robot_shop_title: 'ROBOT MAĞAZASI (FİLO BÜYÜDÜKÇE FİYAT ARTAR)',
    buy: 'Satın Al',
    buy_transporter: 'Lojistik Satın Al',
    buy_repair_drone: 'Tamir Drone Satın Al',
    industrial_buildings_title: 'SANAYİ BİNALARI & FABRİKA OTOMASYONU (2X2 ALTYAPI)',
    build_station_title: 'Şarj İstasyonu İnşa Et',
    build_station_desc: 'Robotların yolda kalmaması için (X, Y) konumuna yeni istasyon kurar.',
    build_depot_title: 'Lojistik Deposu İnşa Et',
    build_depot_desc: 'Robotların maden kargolarını otomatik boşaltması için (X, Y) konumuna depo kurar.',
    smelter_title: 'Dökümhane (2x2)',
    smelter_desc: 'Ham cevherleri (Demir, Obsidyen) 10x değerli Çelik Külçe ve Alaşıma dönüştürür.',
    refinery_title: 'Rafineri (2x2)',
    refinery_desc: 'Değerli madenleri (Altın, Kristal) Kuantum Çiplerine ($2,500) ve Plazma Çekirdeklerine ($4,800) işler.',
    powerplant_title: 'Enerji Santrali',
    powerplant_desc: 'SADECE Şarj İstasyonu bitişiğine kurulabilir. Depodaki cevherleri yakarak şebekeyi besler.',
    turret_title: 'Lazer Savunma Kulesi (2x2)',
    turret_desc: 'Korsan robotlara ve BANDIT_SPOTTED radyo çağrılarına otonom kilitlenip kızıl lazer ateşi açar.',
    free_tag: '[ÜCRETSİZ]',
    build_btn: 'İnşa Et',
    build_2x2: '2x2 Kur',
    build_adj: 'Bitişiğe Kur',
    build_turret: 'Kule İnşa Et',
    map_discovery_title: 'HARİTA KEŞFİ & BİYOM SATIN ALMA (NADİR MADENLER & TEHLİKELER)',
    expand_grid: 'Haritayı Genişlet [{from} -> {to}] [${price}]',

    // API Reference Panel
    all_methods: 'Tüm Metodlar',
    action_methods: 'Aksiyonlar (Mine, Move)',
    query_methods: 'Sorgular (GetRadarInfo, GetTileInfo)',
    insert_code: 'Editöre Ekle',
    inserted: 'Eklendi!',

    // Console Logs
    console_logs_title: 'ROSLYN & SİMÜLASYON KONSOL GÜNLÜKLERİ',

    // Welcome Modal
    welcome_title: 'SYNTAX FACTORY',
    welcome_desc: 'Otonom C# robot filosu yönetimi, madencilik lojistiği, güç şebekeleri ve çetin gezegen atmosfer simülasyonu.',
    start_game: 'OYUNA BAŞLA (SANDBOX SIMULATOR)',
    login_or_register: 'Giriş Yap / Kaydol',
    cloud_sync_active: 'Cloud Sync Aktif',
    guest_engineer: 'Misafir Mühendis',

    // Leaderboard Modal
    leaderboard_title: 'GLOBAL LİDERLİK TABLOSU',
    leaderboard_subtitle: 'Dünya genelindeki en başarılı C# otomasyon mühendisleri',
    net_worth: 'Servet ($)',
    robot_count: 'Robot Sayısı',
    energy_kwh: 'Şebeke Gücü (kWh)',
    sync_my_score: 'Skorumu Gönder & Güncelle',

    // Script Marketplace Modal
    marketplace_title: 'TOPLULUK C# SCRIPT PAZARI',
    marketplace_subtitle: 'Oyuncuların yazdığı otonom C# betiklerini keşfedin veya kendi kodunuzu toplulukla paylaşın',
    all: 'Tümü',
    mining: 'Madencilik',
    repair: 'Tamir',
    defense: 'Savunma',
    share_script: 'Kendi Betiğini Paylaş',
    apply_to_robot: 'Seçili Robota Uygula',
    applied: 'Uygulandı',
    author: 'Yazar',
    script_title: 'Betik Başlığı',
    script_desc: 'Açıklama',
    script_category: 'Kategori',
    publish_now: 'Yayınla',
    cancel: 'İptal',

    // Auth Modal
    login_tab: 'GİRİŞ YAP',
    register_tab: 'KAYIT OL',
    reset_tab: 'ŞİFREMİ UNUTTUM',
    email_label: 'E-Posta Adresi',
    password_label: 'Şifre',
    display_name_label: 'Mühendis Adı (Çağrı Kodu)',
    login_btn: 'GİRİŞ YAP',
    register_btn: 'HESAP OLUŞTUR',
    reset_btn: 'SIFIRLAMA BAĞLANTISI GÖNDER',
    close: 'Kapat',
  },
  en: {
    // Brand & Header
    brand_subtitle: 'AUTOMATION ENGINE ONLINE',
    balance: 'Balance',
    grid_power: 'Grid Power',
    no_power_plant: 'No Power Plant',
    map: 'Map',
    seed_prompt: 'Enter Map Seed Code:',
    leaderboard: 'Leaderboard',
    scripts: 'Marketplace',
    login: 'Sign In',
    logout: 'Sign Out',
    admin_panel: 'ADMIN PANEL',
    user_role: 'USER ROLE',
    reset_factory: 'Reset Factory',

    // Controls
    speed: 'Speed',
    play: 'Play',
    pause: 'Pause',
    step: 'Step',

    // Canvas Grid
    canvas_title: 'FIELD SIMULATOR & GRID',
    location: 'Position',
    quick_build_info: 'Single-click build facility on this tile:',
    charge_station: 'Charging Station',
    depot: 'Logistics Depot',
    free: 'FREE',
    ore: 'Ore',
    weather_clear: 'WEATHER: CLEAR',
    weather_storm: 'WARNING: ELECTROMAGNETIC STORM',

    // Editor & Tabs
    robot_code: 'ROBOT CODE',
    power_plant_code: 'POWER PLANT CODE',
    academy: 'Academy',
    my_scripts: 'My Scripts',
    run_code: 'Run C# Code',
    code_ready: 'Script ready for {name}',

    // Bottom Panels & Details
    inventory: 'Inventory',
    market: 'Market',
    shop: 'Shop',
    api_ref: 'C# API',
    robots: 'Robots',
    logs: 'Console Logs',
    clear_logs: 'Clear',
    total_val: 'Total Value',

    // Market Panel
    current_balance: 'Current Balance',
    sell_all_depot: 'Sell All Ores in Depot',
    live_ore_market: 'LIVE ORE MARKETPLACE (FACTORY DEPOT SALES)',
    field_cargo_note: '* Field cargo not yet unloaded to depot does not appear here',
    empty_depot_title: 'No Delivered Sellable Stock in Depot',
    empty_depot_desc: 'Mined ores are currently stored inside robot cargo holds. Once robots deposit cargo into a Logistics Depot (DEPOT), items automatically unlock for sale here.',
    unit_price: 'Unit',
    sell_10: 'Sell (10)',
    sell_all: 'Sell All',

    // Shop Panel
    robot_shop_title: 'ROBOT SHOP (PRICE SCALES WITH FLEET SIZE)',
    buy: 'Buy',
    buy_transporter: 'Buy Transporter',
    buy_repair_drone: 'Buy Repair Drone',
    industrial_buildings_title: 'INDUSTRIAL BUILDINGS & AUTOMATION (2x2 INFRASTRUCTURE)',
    build_station_title: 'Build Charging Station',
    build_station_desc: 'Builds a new charging pad at (X, Y) to keep your robotics fleet fully powered.',
    build_depot_title: 'Build Logistics Depot',
    build_depot_desc: 'Builds a depot at (X, Y) for automated cargo deposits from field miners.',
    smelter_title: 'Smelter (2x2)',
    smelter_desc: 'Smelts raw ores (Iron, Obsidian) into 10x valuable Steel Ingots and Alloys.',
    refinery_title: 'Refinery (2x2)',
    refinery_desc: 'Refines precious ores (Gold, Crystal) into Quantum Microchips ($2,500) and Plasma Cores ($4,800).',
    powerplant_title: 'Thermal Power Plant',
    powerplant_desc: 'MUST be built adjacent to a Charging Station. Burns depot coal to feed grid power buffer.',
    turret_title: 'Laser Defense Turret (2x2)',
    turret_desc: 'Auto-targets bandit thief robots and BANDIT_SPOTTED radio alerts with red laser beam fire.',
    free_tag: '[FREE]',
    build_btn: 'Build',
    build_2x2: 'Build 2x2',
    build_adj: 'Build Adjacent',
    build_turret: 'Build Turret',
    map_discovery_title: 'MAP DISCOVERY & BIOME UNLOCKS (RARE ORES & HAZARDS)',
    expand_grid: 'Expand Map [{from} -> {to}] [${price}]',

    // API Reference Panel
    all_methods: 'All Methods',
    action_methods: 'Actions (Mine, Move)',
    query_methods: 'Queries (GetRadarInfo, GetTileInfo)',
    insert_code: 'Insert to Editor',
    inserted: 'Inserted!',

    // Console Logs
    console_logs_title: 'ROSLYN & SIMULATION CONSOLE LOGS',

    // Welcome Modal
    welcome_title: 'SYNTAX FACTORY',
    welcome_desc: 'Autonomous C# robotics fleet management, mining logistics, power grids, and harsh planetary atmosphere simulation.',
    start_game: 'START SIMULATOR (SANDBOX)',
    login_or_register: 'Sign In / Register',
    cloud_sync_active: 'Cloud Sync Active',
    guest_engineer: 'Guest Engineer',

    // Leaderboard Modal
    leaderboard_title: 'GLOBAL LEADERBOARD',
    leaderboard_subtitle: 'Top C# automation engineers worldwide',
    net_worth: 'Net Worth ($)',
    robot_count: 'Robot Count',
    energy_kwh: 'Grid Power (kWh)',
    sync_my_score: 'Submit & Sync My Score',

    // Script Marketplace Modal
    marketplace_title: 'COMMUNITY C# SCRIPT MARKETPLACE',
    marketplace_subtitle: 'Discover autonomous C# scripts created by players or share your code with the community',
    all: 'All',
    mining: 'Mining',
    repair: 'Repair',
    defense: 'Defense',
    share_script: 'Share Your Script',
    apply_to_robot: 'Apply to Selected Robot',
    applied: 'Applied',
    author: 'Author',
    script_title: 'Script Title',
    script_desc: 'Description',
    script_category: 'Category',
    publish_now: 'Publish',
    cancel: 'Cancel',

    // Auth Modal
    login_tab: 'SIGN IN',
    register_tab: 'REGISTER',
    reset_tab: 'FORGOT PASSWORD',
    email_label: 'Email Address',
    password_label: 'Password',
    display_name_label: 'Engineer Name (Callsign)',
    login_btn: 'SIGN IN',
    register_btn: 'CREATE ACCOUNT',
    reset_btn: 'SEND RESET LINK',
    close: 'Close',
  },
} as const;

export type TranslationKey = keyof typeof translations.tr;
