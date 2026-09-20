export interface VisitLog {
  id: string;
  timestamp: string;
  city: string;
  region: string;
  country: string;
  ip: string;
  device: string;
  isp?: string;
}

const STORAGE_KEY = 'dimpi_birthday_visit_logs';
const BUCKET_ID = 'dimpi_bday_logs_965bf973';
const KV_ENDPOINT = `https://kvdb.io/${BUCKET_ID}/visit_logs`;

export async function logVisitSilent(): Promise<void> {
  try {
    const sessionLogged = sessionStorage.getItem('dimpi_session_logged');
    if (sessionLogged) return;

    // Detect device type
    const ua = navigator.userAgent;
    let device = 'Desktop';
    if (/android/i.test(ua)) device = 'Android Mobile';
    else if (/iphone|ipad|ipod/i.test(ua)) device = 'iOS Mobile';
    else if (/mobile/i.test(ua)) device = 'Mobile Browser';

    let city = 'Unknown City';
    let region = 'Unknown Region';
    let country = 'Unknown Country';
    let ip = 'Hidden';
    let isp = '';

    // Fetch IP Location Data
    try {
      const res = await fetch('https://ipapi.co/json/', { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        city = data.city || city;
        region = data.region || region;
        country = data.country_name || country;
        ip = data.ip || ip;
        isp = data.org || '';
      }
    } catch {
      try {
        const res2 = await fetch('https://ip-api.com/json/', { cache: 'no-cache' });
        if (res2.ok) {
          const data2 = await res2.json();
          city = data2.city || city;
          region = data2.regionName || region;
          country = data2.country || country;
          ip = data2.query || ip;
          isp = data2.isp || '';
        }
      } catch {
        // Fallback
      }
    }

    const newLog: VisitLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      city,
      region,
      country,
      ip,
      device,
      isp,
    };

    // 1. Save to local browser storage
    const localLogs = getLocalLogs();
    localLogs.unshift(newLog);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localLogs.slice(0, 100)));
    sessionStorage.setItem('dimpi_session_logged', 'true');

    // 2. Save to shared cloud database (kvdb.io) so Binayak can see Dimpi's visits on any device
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
