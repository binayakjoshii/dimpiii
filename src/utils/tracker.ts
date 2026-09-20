export interface VisitLog {
  id: string;
  timestamp: string;
  city: string;
  region: string;
  country: string;
  ip: string;
  device: string;
}

const STORAGE_KEY = 'dimpi_birthday_visit_logs';

export async function logVisitSilent(): Promise<void> {
  try {
    // Only log once per session to prevent duplicate logs on refresh
    const sessionLogged = sessionStorage.getItem('dimpi_session_logged');
    if (sessionLogged) return;

    // Detect device type
    const ua = navigator.userAgent;
    let device = 'Desktop';
    if (/android/i.test(ua)) device = 'Android Mobile';
    else if (/iphone|ipad|ipod/i.test(ua)) device = 'iOS Mobile';
    else if (/mobile/i.test(ua)) device = 'Mobile Browser';

    // Fetch IP-based location (Free & silent client-side lookup)
    let city = 'Unknown City';
    let region = 'Unknown Region';
    let country = 'Unknown Country';
    let ip = 'Hidden';

    try {
      const res = await fetch('https://ipapi.co/json/', { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        city = data.city || city;
        region = data.region || region;
        country = data.country_name || country;
        ip = data.ip || ip;
      }
    } catch {
      // Fallback API if primary rate-limited
      try {
        const res2 = await fetch('https://ip-api.com/json/', { cache: 'no-cache' });
        if (res2.ok) {
          const data2 = await res2.json();
          city = data2.city || city;
          region = data2.regionName || region;
          country = data2.country || country;
          ip = data2.query || ip;
        }
      } catch {
        // Silent fallback
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
    };

    // Save to Local Storage & Session Storage
    const existingLogsRaw = localStorage.getItem(STORAGE_KEY);
    const existingLogs: VisitLog[] = existingLogsRaw ? JSON.parse(existingLogsRaw) : [];
    existingLogs.unshift(newLog);

    // Keep last 100 logs max
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingLogs.slice(0, 100)));
    sessionStorage.setItem('dimpi_session_logged', 'true');
  } catch {
    // Silent catch - does not disrupt website UI
  }
}

export function getVisitLogs(): VisitLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearVisitLogs(): void {
  localStorage.removeItem(STORAGE_KEY);
}
