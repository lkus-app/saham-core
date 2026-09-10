import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Google Sheets ID & Tab configuration specified by the user
export const SPREADSHEET_ID = '1uVVRVlZBFQAMPmMMvw4BcXPE3TbEHUERRqzkC7QY4x0';
export const USERS_SHEET = 'Users';
export const TRADE_IDEAS_SHEET = 'Trade_Ideas';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Provider with Google Sheets scope
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.setCustomParameters({ prompt: 'select_account' });

// In-memory token cache (never stored in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface SheetUser {
  email: string;
  name: string;
  role: 'admin' | 'member';
  password?: string;
  status: string;
  expired_at: string;
  rawRowIndex?: number;
}

export interface SheetStockpick {
  id: string;
  ticker: string;
  title: string;
  entry: string;
  tp: string;
  sl: string;
  status: string;
  ta_rationale: string;
  bandar_rationale: string;
  author: string;
  date: string;
  timestamp?: string;
}

/**
 * Initialize Auth State Listener
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token needs fresh sign in for Sheets scope access
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Sign in with Google Popup and obtain OAuth token for Google Sheets
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan access token Google Sheets dari autentikasi');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in Google error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Read the "Users" sheet from the user spreadsheet
 */
export const fetchUsersFromSheet = async (token?: string): Promise<SheetUser[]> => {
  const activeToken = token || cachedAccessToken;
  if (!activeToken) {
    throw new Error('Memerlukan login Google untuk membaca database Users dari Google Sheets.');
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(USERS_SHEET)}!A1:Z500`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${activeToken}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson?.error?.message || `Gagal membaca sheet "${USERS_SHEET}" (HTTP ${res.status})`);
  }

  const data = await res.json();
  const rows: string[][] = data.values || [];
  if (rows.length === 0) return [];

  // Parse header row
  const headers = rows[0].map(h => (h || '').toString().toLowerCase().trim());
  const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail') || h.includes('user'));
  const roleIdx = headers.findIndex(h => h.includes('role') || h.includes('tipe') || h.includes('level') || h.includes('peran'));
  const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('nama'));
  const passIdx = headers.findIndex(h => h.includes('password') || h.includes('pass') || h.includes('pin') || h.includes('sandi'));
  const statusIdx = headers.findIndex(h => h.includes('status') || h.includes('aktif') || h.includes('state'));
  const expIdx = headers.findIndex(h => h.includes('expired') || h.includes('exp') || h.includes('masa') || h.includes('valid'));

  const users: SheetUser[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const email = (emailIdx >= 0 ? row[emailIdx] : row[0] || '').trim();
    if (!email) continue;

    const rawRole = (roleIdx >= 0 ? row[roleIdx] : '').toLowerCase().trim();
    const role: 'admin' | 'member' = rawRole.includes('admin') || rawRole.includes('core') ? 'admin' : 'member';
    const name = (nameIdx >= 0 ? row[nameIdx] : '') || email.split('@')[0];
    const password = passIdx >= 0 ? row[passIdx] : undefined;
    const status = (statusIdx >= 0 ? row[statusIdx] : 'active').toLowerCase().trim() || 'active';
    const expired_at = (expIdx >= 0 ? row[expIdx] : 'UNLIMITED').trim() || 'UNLIMITED';

    users.push({
      email,
      name,
      role,
      password,
      status,
      expired_at,
      rawRowIndex: i + 1
    });
  }

  return users;
};

/**
 * Crosscheck a user by email against the sheet
 */
export const crosscheckUserInSheet = async (
  emailToVerify: string,
  token?: string
): Promise<{ allowed: boolean; user?: SheetUser; reason?: string }> => {
  const cleanEmail = emailToVerify.trim().toLowerCase();
  const users = await fetchUsersFromSheet(token);

  if (users.length === 0) {
    // If the sheet has no rows yet and the email is the applet owner
    if (cleanEmail === 'lkusdewanto@gmail.com') {
      return {
        allowed: true,
        user: {
          email: cleanEmail,
          name: 'Yustinus Lukito (Owner)',
          role: 'admin',
          status: 'active',
          expired_at: 'UNLIMITED'
        }
      };
    }
    return {
      allowed: false,
      reason: `Sheet "${USERS_SHEET}" masih kosong. Daftarkan akun Anda pada Google Sheet.`
    };
  }

  const matchedUser = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!matchedUser) {
    // Fallback: If it's the verified owner email
    if (cleanEmail === 'lkusdewanto@gmail.com') {
      return {
        allowed: true,
        user: {
          email: cleanEmail,
          name: 'Yustinus Lukito (Owner)',
          role: 'admin',
          status: 'active',
          expired_at: 'UNLIMITED'
        }
      };
    }
    return {
      allowed: false,
      reason: `Akses ditolak: Email "${cleanEmail}" tidak terdaftar di database sheet "${USERS_SHEET}".`
    };
  }

  // Check account status
  if (['inactive', 'nonaktif', 'suspend', 'suspended', 'block', 'blocked', 'banned'].includes(matchedUser.status)) {
    return {
      allowed: false,
      reason: `Akun "${cleanEmail}" berstatus ${matchedUser.status.toUpperCase()}. Akses dinonaktifkan oleh Admin.`
    };
  }

  // Check expiration if not UNLIMITED
  if (matchedUser.expired_at && matchedUser.expired_at.toUpperCase() !== 'UNLIMITED') {
    const expDate = new Date(matchedUser.expired_at);
    if (!isNaN(expDate.getTime()) && expDate.getTime() < Date.now()) {
      return {
        allowed: false,
        reason: `Masa aktif akun telah berakhir pada ${matchedUser.expired_at}. Hubungi Admin untuk perpanjangan.`
      };
    }
  }

  return { allowed: true, user: matchedUser };
};

/**
 * Append a stockpick row to "Trade_Ideas" sheet
 */
export const appendStockpickToSheet = async (
  sp: SheetStockpick,
  token?: string
): Promise<boolean> => {
  const activeToken = token || cachedAccessToken;
  if (!activeToken) {
    throw new Error('Memerlukan autentikasi Google Sheets untuk menyimpan ke sheet "Trade_Ideas".');
  }

  // First ensure header row exists
  const checkUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(TRADE_IDEAS_SHEET)}!A1:L1`;
  try {
    const checkRes = await fetch(checkUrl, {
      headers: { Authorization: `Bearer ${activeToken}` }
    });
    if (checkRes.ok) {
      const checkData = await checkRes.json();
      if (!checkData.values || checkData.values.length === 0) {
        // Initialize header
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(TRADE_IDEAS_SHEET)}!A1:L1?valueInputOption=USER_ENTERED`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${activeToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [
              ['ID', 'Ticker', 'Title', 'Entry', 'TP', 'SL', 'Status', 'Technical Rationale', 'Bandarmology Rationale', 'Author', 'Date', 'Created Timestamp']
            ]
          })
        });
      }
    }
  } catch (err) {
    console.warn('Gagal cek header Trade_Ideas:', err);
  }

  // Append new row
  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(TRADE_IDEAS_SHEET)}!A:L:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const rowData = [
    sp.id || `sp_${Date.now()}`,
    sp.ticker || '',
    sp.title || '',
    sp.entry || '',
    sp.tp || '',
    sp.sl || '',
    sp.status || 'ACTIVE',
    sp.ta_rationale || '',
    sp.bandar_rationale || '',
    sp.author || 'Admin Lapin IDX',
    sp.date || new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
    sp.timestamp || new Date().toISOString()
  ];

  const res = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${activeToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [rowData]
    })
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson?.error?.message || `Gagal menyimpan stockpick ke sheet "${TRADE_IDEAS_SHEET}" (HTTP ${res.status})`);
  }

  return true;
};

/**
 * Fetch all stockpicks from "Trade_Ideas" sheet
 */
export const fetchStockpicksFromSheet = async (token?: string): Promise<SheetStockpick[]> => {
  const activeToken = token || cachedAccessToken;
  if (!activeToken) {
    return [];
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(TRADE_IDEAS_SHEET)}!A2:L200`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${activeToken}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    console.warn(`Gagal membaca sheet ${TRADE_IDEAS_SHEET}: HTTP ${res.status}`);
    return [];
  }

  const data = await res.json();
  const rows: string[][] = data.values || [];
  const results: SheetStockpick[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 2 || !row[1]) continue;

    results.push({
      id: row[0] || `sp_sheet_${i}`,
      ticker: (row[1] || '').toUpperCase().trim(),
      title: row[2] || 'Rekomendasi Saham',
      entry: row[3] || '0',
      tp: row[4] || '0',
      sl: row[5] || '0',
      status: (row[6] || 'ACTIVE').toUpperCase().trim(),
      ta_rationale: row[7] || '',
      bandar_rationale: row[8] || '',
      author: row[9] || 'Tim Riset',
      date: row[10] || '',
      timestamp: row[11] || ''
    });
  }

  return results;
};

// Bind to window for vanilla JS in /public/app.js
if (typeof window !== 'undefined') {
  (window as any).GoogleSheets = {
    SPREADSHEET_ID,
    USERS_SHEET,
    TRADE_IDEAS_SHEET,
    initAuth,
    googleSignIn,
    getAccessToken,
    setAccessToken,
    logoutGoogle,
    fetchUsersFromSheet,
    crosscheckUserInSheet,
    appendStockpickToSheet,
    fetchStockpicksFromSheet
  };
}
