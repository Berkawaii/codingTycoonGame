import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  updateDoc,
  increment,
} from 'firebase/firestore';

// Default Firebase Configuration for playsyntaxfactory
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBYiwXYTbi_WLPBprRSuROoo64kadO5STc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "playsyntaxfactory.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "playsyntaxfactory",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "playsyntaxfactory.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "486804386345",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:486804386345:web:6fa6c1264428fd72032238",
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export type UserRole = 'admin' | 'user';

// Firestore User & Leaderboard Sync
export const syncUserToFirestore = async (user: User, customDisplayName?: string): Promise<UserRole> => {
  if (!user) return 'user';
  const displayName = customDisplayName || user.displayName || user.email?.split('@')[0] || 'Mühendis Oyuncu';

  let role: UserRole = 'user';
  const userDocRef = doc(db, 'users', user.uid);

  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists() && snap.data().role) {
      role = snap.data().role as UserRole;
    } else {
      // Set admin role by default for initial project admin emails or admin keyword
      if (user.email && (user.email.includes('admin') || user.email === 'admin@syntaxfactory.com')) {
        role = 'admin';
      }
    }
  } catch (e) {
    console.warn('Error reading existing user doc for role:', e);
  }

  const userData = {
    uid: user.uid,
    displayName,
    email: user.email || '',
    emailVerified: user.emailVerified,
    role,
    photoURL: user.photoURL || '',
    updatedAt: new Date().toISOString(),
  };

  const leaderboardData = {
    id: user.uid,
    userId: user.uid,
    displayName,
    netWorth: 99999,
    robotCount: 0,
    energyKwh: 0,
    biomeUnlockedCount: 1,
    updatedAt: new Date().toISOString().split('T')[0],
  };

  try {
    await setDoc(userDocRef, userData, { merge: true });
    await setDoc(doc(db, 'leaderboards', user.uid), leaderboardData, { merge: true });
    console.log('[FIRESTORE SINK]: User & Leaderboard synced. Role:', role);
  } catch (e) {
    console.error('[FIRESTORE SINK ERROR]:', e);
  }

  return role;
};

// Auth Helpers
export const loginWithEmail = async (email: string, pass: string) => {
  const res = await signInWithEmailAndPassword(auth, email, pass);
  if (res.user) {
    await syncUserToFirestore(res.user);
  }
  return res;
};

export const registerWithEmail = async (email: string, pass: string, displayName: string) => {
  const res = await createUserWithEmailAndPassword(auth, email, pass);
  if (res.user) {
    if (displayName) {
      await updateProfile(res.user, { displayName });
    }
    // Send email verification link
    try {
      await sendEmailVerification(res.user);
    } catch (e) {
      console.warn('Email verification send error:', e);
    }
    await syncUserToFirestore(res.user, displayName);
  }
  return res;
};

export const sendResetPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const logoutUser = () => signOut(auth);

export const subscribeToAuth = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await syncUserToFirestore(user);
    }
    callback(user);
  });

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
    const q = query(collection(db, 'community_scripts'), orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CommunityScript));
    }
  } catch (e) {
    console.error('Firebase Firestore fetchCommunityScripts error:', e);
  }
  return [];
};

export const publishCommunityScript = async (
  title: string,
  description: string,
  category: CommunityScript['category'],
  code: string,
  authorName: string,
  authorId: string
): Promise<CommunityScript> => {
  const scriptId = `script-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const newScript: CommunityScript = {
    id: scriptId,
    title,
    authorName: authorName || 'Mühendis Oyuncu',
    authorId: auth.currentUser?.uid || authorId,
    description,
    category,
    code,
    likes: 1,
    downloads: 1,
    createdAt: new Date().toISOString().split('T')[0],
  };

  // Direct write to Cloud Firestore
  const docRef = doc(db, 'community_scripts', scriptId);
  await setDoc(docRef, newScript);
  console.log('[FIRESTORE SINK]: Script document published directly to Firestore:', scriptId);

  return newScript;
};

export const likeCommunityScript = async (scriptId: string): Promise<void> => {
  try {
    const scriptRef = doc(db, 'community_scripts', scriptId);
    await updateDoc(scriptRef, { likes: increment(1) });
  } catch (e) {
    console.error('Firebase Firestore likeCommunityScript error:', e);
  }
};
