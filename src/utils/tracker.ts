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
  accuracyType?: 'GPS (Exact)' | 'IP (Approximate)';
  isp?: string;
  ip?: string;
}

const STORAGE_KEY = 'dimpi_birthday_visit_logs';
const BUCKET_ID = 'dimpi_bday_logs_965bf973';
const KV_ENDPOINT = `https://kvdb.io/${BUCKET_ID}/visit_logs`;
const REVISIT_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes (120,000 ms)

interface LocationData {
  city: string;
  region: string;
  country: string;
  accuracyType: 'GPS (Exact)' | 'IP (Approximate)';
  isp?: string;
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
 * Never prompts the user for browser location permissions.
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

    // Detect device type
    const ua = navigator.userAgent;
    let device = 'Desktop';
    if (/android/i.test(ua)) device = 'Android Mobile';
    else if (/iphone/i.test(ua)) device = 'iPhone';
    else if (/ipad/i.test(ua)) device = 'iPad Tablet';
    else if (/mobile/i.test(ua)) device = 'Mobile Browser';

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
      device,
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

    // 2. Save to shared cloud database (kvdb.io)
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
  const cloud = await fetchCloudLogs();
  const local = getLocalLogs();

  const map = new Map<string, VisitLog>();
  [...cloud, ...local].forEach((item) => {
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
    await fetch(KV_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([]),
    });
  } catch {
    // Ignore
  }
}


