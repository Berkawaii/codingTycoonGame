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

    // Bottom Panels
    inventory: 'Envanter',
    market: 'Market',
    shop: 'Mağaza',
    api_ref: 'C# API',
    robots: 'Robotlar',
    logs: 'Konsol Logları',
    clear_logs: 'Temizle',
    total_val: 'Toplam Değer',

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

    // Bottom Panels
    inventory: 'Inventory',
    market: 'Market',
    shop: 'Shop',
    api_ref: 'C# API',
    robots: 'Robots',
    logs: 'Console Logs',
    clear_logs: 'Clear',
    total_val: 'Total Value',

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
