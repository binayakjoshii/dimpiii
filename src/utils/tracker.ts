export interface VisitLog {
  id: string;
  visitorId: string;
  visitCount: number;
  timestamp: string;
  timeSinceLastVisit?: string;
  city: string;
  region: string;
  country: string;
  device: string;
  screenSize?: string;
  osVersion?: string;
  accuracyType?: 'GPS (Exact)' | 'IP (Approximate)';
  isp?: string;
  ip?: string;
  mapsUrl?: string;
}

const STORAGE_KEY = 'dimpi_birthday_visit_logs';
const REVISIT_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes (120,000 ms)

// Supabase Configuration
const SUPABASE_URL = 'https://ymwxsciicetjrpogzuic.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7QURST_sVdHOuB1PAs5r3A_T7KswCZH';
const SUPABASE_REST_ENDPOINT = `${SUPABASE_URL}/rest/v1/visit_logs`;

// Secondary KV Fallback
const BUCKET_ID = 'dimpi_bday_logs_965bf973';
const KV_ENDPOINT = `https://kvdb.io/${BUCKET_ID}/visit_logs`;

interface LocationData {
  city: string;
  region: string;
  country: string;
  accuracyType: 'GPS (Exact)' | 'IP (Approximate)';
  isp?: string;
}

export interface DeviceDetails {
  deviceSummary: string;
  screenSize: string;
  browserName: string;
  osVersion: string;
}

export function detectDetailedDevice(): DeviceDetails {
  const ua = navigator.userAgent;
  const width = window.screen.width || window.innerWidth;
  const height = window.screen.height || window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  const screenSize = `${width}x${height} px (@${dpr}x)`;

  // Detect App / Webview Context
  let appName = '';
  if (/WhatsApp/i.test(ua)) appName = ' (WhatsApp App)';
  else if (/Instagram/i.test(ua)) appName = ' (Instagram App)';
  else if (/FBAN|FBAV/i.test(ua)) appName = ' (Facebook App)';
  else if (/Snapchat/i.test(ua)) appName = ' (Snapchat App)';

  // Detect Browser
  let browserName = 'Browser';
  if (/CriOS|Chrome/i.test(ua) && !/Edge|OPR/i.test(ua)) browserName = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browserName = 'Safari';
  else if (/Firefox|FxiOS/i.test(ua)) browserName = 'Firefox';
  else if (/Edg/i.test(ua)) browserName = 'Edge';

  // Detect OS Version
  let osVersion = 'Unknown OS';
  const iosMatch = ua.match(/OS (\d+_\d+(_\d+)?)/i);
  if (iosMatch) {
    osVersion = `iOS ${iosMatch[1].replace(/_/g, '.')}`;
  } else {
    const androidMatch = ua.match(/Android (\d+(\.\d+)?)/i);
    if (androidMatch) {
      osVersion = `Android ${androidMatch[1]}`;
    } else if (/Macintosh/i.test(ua)) {
      osVersion = 'macOS';
    } else if (/Windows/i.test(ua)) {
      osVersion = 'Windows PC';
    }
  }

  // Detect Specific Mobile Model based on UA and Resolution
  let deviceSummary = 'Desktop PC';

  if (/iphone/i.test(ua)) {
    let model = 'iPhone';
    if ((width === 393 && height === 852) || (width === 852 && height === 393)) model = 'iPhone 16 / 15 Pro / 14 Pro';
    else if ((width === 430 && height === 932) || (width === 932 && height === 430)) model = 'iPhone 16 Plus / 15 Pro Max';
    else if ((width === 390 && height === 844) || (width === 844 && height === 390)) model = 'iPhone 14 / 13 / 12';
    else if ((width === 428 && height === 926) || (width === 926 && height === 428)) model = 'iPhone 14 Plus / 13 Pro Max';
    else if ((width === 375 && height === 812) || (width === 812 && height === 375)) model = 'iPhone 13 mini / 12 mini / X';
    else if ((width === 414 && height === 896) || (width === 896 && height === 414)) model = 'iPhone 11 / XR / XS Max';
    else if ((width === 375 && height === 667) || (width === 667 && height === 375)) model = 'iPhone SE / 8';

    deviceSummary = `${model}${appName || ` (${browserName})`}`;
  } else if (/ipad/i.test(ua)) {
    deviceSummary = `iPad Tablet${appName || ` (${browserName})`}`;
  } else if (/android/i.test(ua)) {
    let brand = 'Android Phone';
    if (/samsung/i.test(ua)) brand = 'Samsung Galaxy';
    else if (/oneplus/i.test(ua)) brand = 'OnePlus';
    else if (/pixel/i.test(ua)) brand = 'Google Pixel';
    else if (/xiaomi|mi|redmi|poco/i.test(ua)) brand = 'Xiaomi / Redmi';
    else if (/vivo/i.test(ua)) brand = 'Vivo';
    else if (/oppo/i.test(ua)) brand = 'Oppo';
    else if (/realme/i.test(ua)) brand = 'Realme';

    deviceSummary = `${brand}${appName || ` (${browserName})`}`;
  } else if (/mobile/i.test(ua)) {
    deviceSummary = `Mobile Browser${appName}`;
  }

  return {
    deviceSummary,
    screenSize,
    browserName: appName ? appName.trim().replace(/[()]/g, '') : browserName,
    osVersion,
  };
}

function getOrCreateVisitorId(): string {
  try {
    let vid = localStorage.getItem('dimpi_visitor_id');
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36).substring(4);
      localStorage.setItem('dimpi_visitor_id', vid);
    }
    return vid;
  } catch {
    return 'v_guest';
  }
}

/**
 * Gets location silently in the background using fast, permissionless HTTPS APIs.
 */
async function getSilentLocation(): Promise<LocationData> {
  // 1. Primary: ipwho.is (CORS enabled HTTPS IP Geolocation API)
  try {
    const res = await fetch('https://ipwho.is/', { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          city: data.city || 'Unknown City',
          region: data.region || 'Unknown Region',
          country: data.country || 'Unknown Country',
          accuracyType: 'IP (Approximate)',
          isp: data.connection?.isp || '',
        };
      }
    }
  } catch {
    // Fallback
  }

  // 2. Fallback 1: freeipapi.com
  try {
    const res = await fetch('https://freeipapi.com/api/json', { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      return {
        city: data.cityName || 'Unknown City',
        region: data.regionName || 'Unknown Region',
        country: data.countryName || 'Unknown Country',
        accuracyType: 'IP (Approximate)',
      };
    }
  } catch {
    // Fallback
  }

  // 3. Fallback 2: ipapi.co
  try {
    const res = await fetch('https://ipapi.co/json/', { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      return {
        city: data.city || 'Unknown City',
        region: data.region || 'Unknown Region',
        country: data.country_name || 'Unknown Country',
        accuracyType: 'IP (Approximate)',
        isp: data.org || '',
      };
    }
  } catch {
    // Final default
  }

  return {
    city: 'Unknown City',
    region: 'Unknown Region',
    country: 'Unknown Country',
    accuracyType: 'IP (Approximate)',
  };
}



async function postToSupabase(log: VisitLog): Promise<void> {
  try {
    const payload = {
      id: log.id,
      visitor_id: log.visitorId,
      visit_count: log.visitCount,
      timestamp: log.timestamp,
      time_since_last_visit: log.timeSinceLastVisit || 'First Visit',
      city: log.city,
      region: log.region,
      country: log.country,
      device: log.device,
      screen_size: log.screenSize || '',
      os_version: log.osVersion || '',
      accuracy_type: log.accuracyType || 'IP (Approximate)',
      isp: log.isp || '',
      maps_url: log.mapsUrl || '',
    };

    await fetch(SUPABASE_REST_ENDPOINT, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Silent catch
  }
}

async function fetchFromSupabase(): Promise<VisitLog[]> {
  try {
    const res = await fetch(`${SUPABASE_REST_ENDPOINT}?select=*`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          id: String(item.id),
          visitorId: item.visitor_id || item.visitorId || 'v_guest',
          visitCount: Number(item.visit_count || item.visitCount || 1),
          timestamp: item.timestamp || '',
          timeSinceLastVisit: item.time_since_last_visit || item.timeSinceLastVisit || '',
          city: item.city || 'Unknown City',
          region: item.region || 'Unknown Region',
          country: item.country || 'Unknown Country',
          device: item.device || 'Mobile',
          screenSize: item.screen_size || item.screenSize || '',
          osVersion: item.os_version || item.osVersion || '',
          accuracyType: item.accuracy_type || item.accuracyType || 'IP (Approximate)',
          isp: item.isp || '',
          mapsUrl: item.maps_url || item.mapsUrl || '',
        }));
      }
    }
  } catch {
    // Fallback
  }
  return [];
}

export async function logVisitSilent(force: boolean = false): Promise<void> {
  try {
    const now = Date.now();
    const lastVisitStr = localStorage.getItem('dimpi_last_visit_timestamp');
    const lastVisitTime = lastVisitStr ? parseInt(lastVisitStr, 10) : 0;

    // Check if 2 minutes have passed since last recorded log (unless forced)
    if (!force && lastVisitTime > 0 && now - lastVisitTime < REVISIT_COOLDOWN_MS) {
      return;
    }

    const visitorId = getOrCreateVisitorId();
    const prevCountStr = localStorage.getItem('dimpi_visit_count');
    const visitCount = (prevCountStr ? parseInt(prevCountStr, 10) : 0) + 1;

    // Calculate human-friendly time since last visit
    let timeSinceLastVisit = 'First Visit';
    if (lastVisitTime > 0) {
      const diffMs = now - lastVisitTime;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        timeSinceLastVisit = `${diffDays}d ${diffHours % 24}h later`;
      } else if (diffHours > 0) {
        timeSinceLastVisit = `${diffHours}h ${diffMins % 60}m later`;
      } else {
        timeSinceLastVisit = `${diffMins} min${diffMins !== 1 ? 's' : ''} later`;
      }
    }

    // Detect detailed device specs & mobile view
    const dev = detectDetailedDevice();

    // Fetch Location Data silently in background (No browser permission popups!)
    const loc = await getSilentLocation();

    const newLog: VisitLog = {
      id: now.toString(),
      visitorId,
      visitCount,
      timestamp: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      timeSinceLastVisit,
      city: loc.city,
      region: loc.region,
      country: loc.country,
      device: dev.deviceSummary,
      screenSize: dev.screenSize,
      osVersion: dev.osVersion,
      accuracyType: loc.accuracyType,
      isp: loc.isp,
    };

    // Update local timestamps and counters
    localStorage.setItem('dimpi_last_visit_timestamp', now.toString());
    localStorage.setItem('dimpi_visit_count', visitCount.toString());

    // 1. Save to local browser storage
    const localLogs = getLocalLogs();
    localLogs.unshift(newLog);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localLogs.slice(0, 100)));

    // 2. Save to Supabase Cloud Database (Guaranteed Mobile Sync!)
    await postToSupabase(newLog);

    // 3. Secondary KV backup
    try {
      const cloudLogs = await fetchCloudLogs();
      cloudLogs.unshift(newLog);
      await fetch(KV_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cloudLogs.slice(0, 100)),
      });
    } catch {
      // Network catch
    }
  } catch {
    // Silent catch
  }
}

function getLocalLogs(): VisitLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function fetchCloudLogs(): Promise<VisitLog[]> {
  try {
    const res = await fetch(KV_ENDPOINT, { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch {
    // Fallback
  }
  return [];
}

export async function getVisitLogs(): Promise<VisitLog[]> {
  const supabaseLogs = await fetchFromSupabase();
  const cloud = await fetchCloudLogs();
  const local = getLocalLogs();

  const map = new Map<string, VisitLog>();
  [...supabaseLogs, ...cloud, ...local].forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values()).sort((a, b) => Number(b.id) - Number(a.id));
}

export async function clearVisitLogs(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('dimpi_last_visit_timestamp');
  localStorage.removeItem('dimpi_visit_count');

  try {
    await fetch(`${SUPABASE_REST_ENDPOINT}?id=neq.0`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });
  } catch {
    // Ignore
  }

  try {
    await fetch(KV_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([]),
    });
  } catch {
    // Ignore
  }
}



