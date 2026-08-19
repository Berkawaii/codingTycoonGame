import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';

// Default Firebase Configuration (Fallback gracefully if env vars not provided)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForSyntaxFactory012345",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "syntax-factory.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "syntax-factory",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "syntax-factory.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Data Interfaces
export interface LeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  netWorth: number;
  robotCount: number;
  energyKwh: number;
  biomeUnlockedCount: number;
  updatedAt: string;
}

export interface CommunityScript {
  id: string;
  title: string;
  authorName: string;
  authorId: string;
  description: string;
  category: 'MINING' | 'REPAIR' | 'DEFENSE' | 'HAULER';
  code: string;
  likes: number;
  downloads: number;
  createdAt: string;
}

// Local Storage Fallback Keys
const LOCAL_LEADERBOARD_KEY = 'syntax_factory_leaderboard_mock';
const LOCAL_COMMUNITY_SCRIPTS_KEY = 'syntax_factory_scripts_mock';

// Seed Initial Mock Leaderboard if empty
const SEED_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', userId: 'u1', displayName: 'CyberMiner_X', netWorth: 450000, robotCount: 14, energyKwh: 3200, biomeUnlockedCount: 4, updatedAt: '2026-08-19' },
  { id: '2', userId: 'u2', displayName: 'ScriptGuru_99', netWorth: 380000, robotCount: 11, energyKwh: 2800, biomeUnlockedCount: 4, updatedAt: '2026-08-19' },
  { id: '3', userId: 'u3', displayName: 'NeonCoder', netWorth: 290000, robotCount: 9, energyKwh: 2100, biomeUnlockedCount: 3, updatedAt: '2026-08-18' },
  { id: '4', userId: 'u4', displayName: 'RoverCommander', netWorth: 210000, robotCount: 7, energyKwh: 1600, biomeUnlockedCount: 2, updatedAt: '2026-08-18' },
  { id: '5', userId: 'u5', displayName: 'QuantTycoon', netWorth: 175000, robotCount: 6, energyKwh: 1200, biomeUnlockedCount: 2, updatedAt: '2026-08-17' },
];

const SEED_SCRIPTS: CommunityScript[] = [
  {
    id: 'script-1',
    title: 'Otomatik Maden & Şarj Algoritması',
    authorName: 'CyberMiner_X',
    authorId: 'u1',
    description: 'Şarjı %25 altına inince otomatik şarj istasyonuna giden, kargosu dolunca depoya dönen gelişmiş otonom kod.',
    category: 'MINING',
    code: `using System;

public class SmartMinerScript
{
    public void Execute(IRobot robot)
    {
        if (robot.GetEnergy() < 25)
        {
            BuildingInfo station = robot.GetNearestBuilding("CHARGING_PAD");
            robot.GoTo(station.X, station.Y);
        }
        else if (robot.GetCargo() >= robot.GetMaxCargo())
        {
            BuildingInfo depot = robot.GetNearestBuilding("DEPOT");
            robot.GoTo(depot.X, depot.Y);
        }
        else
        {
            ResourceInfo res = robot.GetNearestResource();
            if (res != null) {
                robot.GoTo(res.X, res.Y);
                robot.Mine();
            }
        }
    }
}`,
    likes: 42,
    downloads: 128,
    createdAt: '2026-08-18',
  },
  {
    id: 'script-2',
    title: 'Tamir Drone Alan Devriye Betiği',
    authorName: 'ScriptGuru_99',
    authorId: 'u2',
    description: 'Haritadaki hasarlı robotları otomatik tespit edip tamir ışınıyla yanlarına giden otonom drone scripti.',
    category: 'REPAIR',
    code: `using System;

public class RepairDroneScript
{
    public void Execute(IRobot robot)
    {
        RobotInfo damaged = robot.GetNearestDamagedRobot();
        if (damaged != null)
        {
            int dx = Math.Abs(damaged.X - robot.GetX());
            int dy = Math.Abs(damaged.Y - robot.GetY());
            if (dx <= 1 && dy <= 1) {
                robot.RepairTarget(damaged.Id);
            } else {
                robot.GoTo(damaged.X, damaged.Y);
            }
        }
        else
        {
            robot.Move(Direction.Forward);
        }
    }
}`,
    likes: 38,
    downloads: 95,
    createdAt: '2026-08-18',
  },
];

export const getLocalLeaderboard = (): LeaderboardEntry[] => {
  const data = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(SEED_LEADERBOARD));
    return SEED_LEADERBOARD;
  }
  try {
    return JSON.parse(data);
  } catch {
    return SEED_LEADERBOARD;
  }
};

export const getLocalCommunityScripts = (): CommunityScript[] => {
  const data = localStorage.getItem(LOCAL_COMMUNITY_SCRIPTS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_COMMUNITY_SCRIPTS_KEY, JSON.stringify(SEED_SCRIPTS));
    return SEED_SCRIPTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return SEED_SCRIPTS;
  }
};

// --- LEADERBOARD SERVICES ---
export const fetchGlobalLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const q = query(collection(db, 'leaderboards'), orderBy('netWorth', 'desc'), limit(20));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as LeaderboardEntry));
    }
  } catch (e) {
    console.warn('Firebase Firestore Leaderboard offline/fallback mode active:', e);
  }
  return getLocalLeaderboard();
};

export const submitPlayerScore = async (
  userId: string,
  displayName: string,
  netWorth: number,
  robotCount: number,
  energyKwh: number,
  biomeUnlockedCount: number
): Promise<void> => {
  const entry: LeaderboardEntry = {
    id: userId,
    userId,
    displayName: displayName || 'Anonim Mühendis',
    netWorth,
    robotCount,
    energyKwh,
    biomeUnlockedCount,
    updatedAt: new Date().toISOString().split('T')[0],
  };

  // 1. Try Firebase Firestore
  try {
    const userDocRef = doc(db, 'leaderboards', userId);
    await setDoc(userDocRef, entry, { merge: true });
  } catch (e) {
    console.warn('Firebase Firestore score submit fallback:', e);
  }

  // 2. Always update local cache
  const local = getLocalLeaderboard().filter((e) => e.userId !== userId);
  local.push(entry);
  local.sort((a, b) => b.netWorth - a.netWorth);
  localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(local.slice(0, 50)));
};

// --- COMMUNITY SCRIPT MARKETPLACE SERVICES ---
export const fetchCommunityScripts = async (): Promise<CommunityScript[]> => {
  try {
    const q = query(collection(db, 'community_scripts'), orderBy('likes', 'desc'), limit(30));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CommunityScript));
    }
  } catch (e) {
    console.warn('Firebase Firestore Community Scripts fallback mode active:', e);
  }
  return getLocalCommunityScripts();
};

export const publishCommunityScript = async (
  title: string,
  description: string,
  category: CommunityScript['category'],
  code: string,
  authorName: string,
  authorId: string
): Promise<CommunityScript> => {
  const newScript: CommunityScript = {
    id: `script-${Date.now()}`,
    title,
    authorName: authorName || 'Mühendis',
    authorId,
    description,
    category,
    code,
    likes: 1,
    downloads: 1,
    createdAt: new Date().toISOString().split('T')[0],
  };

  try {
    const docRef = await addDoc(collection(db, 'community_scripts'), newScript);
    newScript.id = docRef.id;
  } catch (e) {
    console.warn('Firebase Firestore publish script fallback:', e);
  }

  const local = getLocalCommunityScripts();
  local.unshift(newScript);
  localStorage.setItem(LOCAL_COMMUNITY_SCRIPTS_KEY, JSON.stringify(local));
  return newScript;
};

export const likeCommunityScript = async (scriptId: string): Promise<void> => {
  try {
    const scriptRef = doc(db, 'community_scripts', scriptId);
    await updateDoc(scriptRef, { likes: increment(1) });
  } catch (e) {
    console.warn('Firebase Firestore like fallback:', e);
  }

  const local = getLocalCommunityScripts().map((s) =>
    s.id === scriptId ? { ...s, likes: s.likes + 1 } : s
  );
  localStorage.setItem(LOCAL_COMMUNITY_SCRIPTS_KEY, JSON.stringify(local));
};
