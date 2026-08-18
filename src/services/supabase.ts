import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

export interface CloudScript {
  id: string;
  name: string;
  code: string;
  robot_id?: string;
  updated_at: string;
  created_at?: string;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseConfig(): { url: string; key: string } {
  const savedUrl = localStorage.getItem('tycoon_supabase_url');
  const savedKey = localStorage.getItem('tycoon_supabase_key');

  const metaEnv = (import.meta as any).env || {};
  const url = savedUrl || metaEnv.VITE_SUPABASE_URL || '';
  const key = savedKey || metaEnv.VITE_SUPABASE_ANON_KEY || '';

  return { url, key };
}

export function saveSupabaseConfig(url: string, key: string) {
  localStorage.setItem('tycoon_supabase_url', url);
  localStorage.setItem('tycoon_supabase_key', key);
  supabaseInstance = null; // reset client
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const { url, key } = getSupabaseConfig();
  if (url && key && url.startsWith('http')) {
    try {
      supabaseInstance = createClient(url, key);
      return supabaseInstance;
    } catch (err) {
      console.warn('Supabase client creation error:', err);
    }
  }
  return null;
}

// ----------------------------------------------------
// Authentication Service Helpers
// ----------------------------------------------------

export async function getCurrentUser(): Promise<User | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data.user;
}

export async function signUpWithEmail(email: string, pass: string) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase URL ve Anon Key henüz yapılandırılmadı.');
  const { data, error } = await client.auth.signUp({ email, password: pass });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, pass: string) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase URL ve Anon Key henüz yapılandırılmadı.');
  const { data, error } = await client.auth.signInWithPassword({ email, password: pass });
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  const client = getSupabaseClient();
  if (!client) return;
  await client.auth.signOut();
}

// ----------------------------------------------------
// Cloud Script Persistence Service Helpers
// ----------------------------------------------------

export async function saveScriptToCloud(name: string, code: string, robotId?: string): Promise<CloudScript> {
  const client = getSupabaseClient();

  if (client) {
    const user = await getCurrentUser();
    if (user) {
      const { data, error } = await client
        .from('user_scripts')
        .upsert(
          {
            user_id: user.id,
            name,
            code,
            robot_id: robotId || 'robot-1',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id, name' }
        )
        .select()
        .single();

      if (error) throw error;
      return data as CloudScript;
    }
  }

  // LocalStorage Fallback Backup
  const localScripts = getLocalScripts();
  const existingIdx = localScripts.findIndex((s) => s.name === name);
  const scriptItem: CloudScript = {
    id: existingIdx >= 0 ? localScripts[existingIdx].id : `local-${Date.now()}`,
    name,
    code,
    robot_id: robotId,
    updated_at: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    localScripts[existingIdx] = scriptItem;
  } else {
    localScripts.push(scriptItem);
  }

  localStorage.setItem('tycoon_local_scripts', JSON.stringify(localScripts));
  return scriptItem;
}

export async function fetchUserScripts(): Promise<CloudScript[]> {
  const client = getSupabaseClient();

  if (client) {
    const user = await getCurrentUser();
    if (user) {
      const { data, error } = await client
        .from('user_scripts')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && data) {
        return data as CloudScript[];
      }
    }
  }

  return getLocalScripts();
}

export async function deleteScriptFromCloud(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (client && !id.startsWith('local-')) {
    await client.from('user_scripts').delete().eq('id', id);
  }

  const local = getLocalScripts().filter((s) => s.id !== id);
  localStorage.setItem('tycoon_local_scripts', JSON.stringify(local));
}

function getLocalScripts(): CloudScript[] {
  try {
    const raw = localStorage.getItem('tycoon_local_scripts');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
