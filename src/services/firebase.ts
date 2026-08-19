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

async function ensureAuthUser(): Promise<string> {
  initFirebase();
  if (auth?.currentUser) {
    return auth.currentUser.uid;
  }
  if (auth) {
    try {
      const res = await signInAnonymously(auth);
      return res.user.uid;
    } catch (e) {
      console.warn('Anonymous sign-in error:', e);
    }
  }
  return localStorage.getItem('syntax_factory_user_id') || 'guest-user';
}

export async function saveScriptToFirebase(name: string, code: string, robotId?: string): Promise<FirebaseScriptDoc> {
  const userId = await ensureAuthUser();
  const cleanId = name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const docRef = doc(db!, 'users', userId, 'personal_scripts', cleanId);

  const docData: FirebaseScriptDoc = {
    id: cleanId,
    name,
    code,
    robot_id: robotId || 'robot-1',
    updated_at: new Date().toISOString(),
  };

  await setDoc(docRef, docData, { merge: true });
  return docData;
}

export async function fetchFirebaseScripts(): Promise<FirebaseScriptDoc[]> {
  const userId = await ensureAuthUser();

  if (db && userId) {
    try {
      const q = query(collection(db, 'users', userId, 'personal_scripts'), orderBy('updated_at', 'desc'));
      const snapshot = await getDocs(q);
      const docs: FirebaseScriptDoc[] = [];
      snapshot.forEach((d) => docs.push(d.data() as FirebaseScriptDoc));
      return docs;
    } catch (err) {
      console.warn('Firestore personal scripts fetch error:', err);
    }
  }

  return [];
}
