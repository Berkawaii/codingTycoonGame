# Syntax Factory

Syntax Factory is a high-performance, real-time autonomous robotics and factory simulation game built with React 19, TypeScript, Vite, Cloud Firestore, and a custom WebAssembly C# Roslyn execution engine. Players program autonomous mining rovers, transporter drones, repair units, and thermal power plants using real C# code, competing on global leaderboards and sharing code in a community marketplace.

Developed by [Berkawaii](https://github.com/Berkawaii).

---

## Technical Architecture Overview

Syntax Factory decoupled simulation architecture runs client-side WebAssembly C# execution alongside a 2D canvas rendering loop at 10 Ticks Per Second (TPS). State persistence is managed through Zustand store with Cloud Firestore real-time synchronization.

```mermaid
graph TD
    Client[React 19 Frontend UI] --> Store[Zustand Central Game Store]
    Store --> Canvas[2D HTML5 Canvas Engine]
    Store --> WASM[C# WASM Execution Engine]
    Store --> Firebase[Firebase Auth & Cloud Firestore]
    WASM --> Evaluator[Dynamic Scope & Variable Evaluator]
    Evaluator --> API[IRobot & IPowerPlant APIs]
    Firebase --> DB[(Firestore Documents)]
```

---

## C# Script Execution Pipeline

Each simulation tick, the WebAssembly engine evaluates user C# scripts against local biome map state and object positions.

```mermaid
sequenceDiagram
    autonumber
    participant Store as Game Store
    participant Engine as WASM C# Engine
    participant Robot as IRobot Instance
    participant Map as Biome Grid Map

    Store->>Engine: Send C# Script Code & Robot State
    Engine->>Engine: Verify Syntax (class, Execute method)
    Engine->>Robot: Instantiate IRobot API Context
    Engine->>Map: Query Nearest Resources & Stations
    Engine->>Engine: Evaluate Dynamic Control Flow & Conditions
    Engine-->>Store: Return Action (MINE, REPAIR, GOTO, IDLE)
    Store->>Map: Update Grid Coordinates & Inventory
```

---

## Multi-Biome & Environmental Hazard System

Syntax Factory features four distinct planetary biomes, each presenting unique resource distributions and environmental hazards:

1. Mars Basin Desert: Standard terraforming environment with balanced Iron, Gold, Coal, and Obsidian veins.
2. Volcanic Magma Basin: High-temperature zone featuring lava rivers, Ruby gems, and Volcanic Ash Rain.
3. Quantum Crystal Cavern: Electromagnetic anomaly region containing Quantum Crystal veins and EMP Radiation Waves.
4. Glacial Permafrost Wastes: Sub-zero arctic terrain containing Frozen Ore veins and Polar Blizzards.

---

## Cloud Architecture & State Synchronization Flowchart

```mermaid
flowchart LR
    User[User Authentication] -->|Email / Anon| Auth[Firebase Auth]
    Auth -->|UID| Sync[Firestore Sync Engine]
    Sync -->|Read / Write| Save[users/{userId}/game_data/save_state]
    Sync -->|Check Callsign| Names[display_names/{name}]
    Sync -->|Publish / Download| Market[community_scripts/{scriptId}]
    Sync -->|Post Net-Worth| Ranks[leaderboards/{userId}]
```

---

## Development Roadmap & Milestones

The platform follows a multi-phase engineering trajectory:

```mermaid
graph LR
    P1[Phase 01: Core WASM Engine] --> P2[Phase 02: Swarm Mesh Network]
    P2 --> P3[Phase 03: Multi-Biome & Power Grid]
    P3 --> P4[Phase 04: Cloud Sync & Script Market]
    P4 --> P5[Phase 05: Guilds & PvP Warfare]
    P5 --> P6[Phase 06: Deep Space & AI Copilot]
```

### Phase Details

#### Phase 01: Core WASM Engine & C# Roslyn Runtime (Completed)
- Real-time dynamic C# expression parser and execution bridge.
- Monaco Code Editor integration with syntax highlighting and auto-completion.
- Built-in IRobot API bindings (GetCargo, GetEnergy, GetRadarInfo, GoTo, Mine, Move).
- Multi-threaded 2D canvas rendering engine (20x20 grid simulation at 10 TPS).

#### Phase 02: Swarm Robotics & Wireless Radio Mesh (Completed)
- Specialized Transporter heavy cargo haulers (200kg capacity, 2x movement speed).
- Automated Repair Drones equipped with targeting repair lasers (RepairRobot).
- Inter-robot radio broadcast system (SendRadioMessage, ReadRadioMessages).
- Autonomous swarm mining dispatch and cargo handoff protocols.

#### Phase 03: Multi-Biome Exploration & Power Grids (Completed)
- Thermal Power Plants with dynamic C# overclocking engine (0.5x to 2.0x efficiency).
- Multi-biome support: Mars Basin, Volcanic Magma, Quantum Cavern, Glacial Wastes.
- Environmental hazards: Dust Storms, Ash Rain, EMP Radiation, Polar Blizzards.
- Grid energy buffer storage and station emergency trickle-charging system.

#### Phase 04: Cloud Persistence & Global Script Marketplace (Completed)
- Firebase Auth & Cloud Firestore sync for save states, biomes, and C# scripts.
- Unique Engineer Callsign registry (display_names collection).
- Global Competitions Leaderboard with automated net-worth score calculation.
- Community C# Script Marketplace for sharing and downloading autonomous scripts.

#### Phase 05: Advanced Automation & Factory Warfare (In Progress)
- Cooperative Guild mega-factories and shared supply chain automation.
- PvP factory defense: Automated defensive turrets, code warfare, and raids.
- User-defined custom C# helper assemblies and dynamic class importing.
- Smelter & Refinery multi-tier crafting recipe automation pipelines.

#### Phase 06: Deep Space Station & AI Copilot System (Planned)
- AI-assisted C# code optimizer and automated bug resolution agent.
- Orbital Space Station biomes with zero-gravity logistics challenges.
- Interstellar resource trade networks and planetary defense satellites.
- Custom programmable drone visual logic editor and block-code bridge.

---

## Installation & Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
git clone https://github.com/Berkawaii/codingTycoonGame.git
cd codingTycoonGame
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

---

## License

MIT License. Designed and developed by [Berkawaii](https://github.com/Berkawaii).
