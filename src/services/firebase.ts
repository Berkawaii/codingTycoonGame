import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, Auth } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, query, orderBy, Firestore } from 'firebase/firestore';

export interface FirebaseScriptDoc {
  id: string;
  name: string;
  code: string;
  robot_id?: string;
  updated_at: string;
}

const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || '',
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '',
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function initFirebase() {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    try {
      app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);

      // Silent anonymous sign in
      signInAnonymously(auth).catch(() => {});
    } catch (err) {
      console.warn('Firebase init warning:', err);
    }
  }
}

export async function saveScriptToFirebase(name: string, code: string, robotId?: string): Promise<FirebaseScriptDoc> {
  initFirebase();

  if (db && auth?.currentUser) {
    const userId = auth.currentUser.uid;
    const docRef = doc(db, 'users', userId, 'scripts', name);

    const docData: FirebaseScriptDoc = {
      id: name,
      name,
      code,
      robot_id: robotId || 'robot-1',
      updated_at: new Date().toISOString(),
    };

    await setDoc(docRef, docData, { merge: true });
    return docData;
  }

  // LocalStorage fallback
  const local = getLocalScripts();
  const existingIdx = local.findIndex((s) => s.name === name);
  const scriptItem: FirebaseScriptDoc = {
    id: existingIdx >= 0 ? local[existingIdx].id : `local-${Date.now()}`,
    name,
    code,
    robot_id: robotId,
    updated_at: new Date().toISOString(),
  };

  if (existingIdx >= 0) local[existingIdx] = scriptItem;
  else local.push(scriptItem);

  localStorage.setItem('tycoon_local_scripts', JSON.stringify(local));
  return scriptItem;
}

export async function fetchFirebaseScripts(): Promise<FirebaseScriptDoc[]> {
  initFirebase();

  if (db && auth?.currentUser) {
    try {
      const userId = auth.currentUser.uid;
      const q = query(collection(db, 'users', userId, 'scripts'), orderBy('updated_at', 'desc'));
      const snapshot = await getDocs(q);
      const docs: FirebaseScriptDoc[] = [];
      snapshot.forEach((d) => docs.push(d.data() as FirebaseScriptDoc));
      if (docs.length > 0) return docs;
    } catch (err) {
      console.warn('Firestore fetch fallback:', err);
    }
  }

  return getLocalScripts();
}

function getLocalScripts(): FirebaseScriptDoc[] {
  try {
    const raw = localStorage.getItem('tycoon_local_scripts');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
