export interface VisitLog {
  id: string;
  timestamp: string;
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

interface LocationData {
  city: string;
  region: string;
  country: string;
  accuracyType: 'GPS (Exact)' | 'IP (Approximate)';
  isp?: string;
}

/**
 * Gets exact GPS location if permission granted, otherwise falls back to reliable HTTPS IP location APIs.
 */
async function getAccurateLocation(): Promise<LocationData> {
  // 1. Try Browser GPS (High Accuracy for Mobile & Desktop)
  if ('geolocation' in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 4000,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude } = position.coords;
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );

      if (res.ok) {
        const data = await res.json();
        const locality = data.locality || data.city || data.localityInfo?.informative?.[0]?.name;
        const region = data.principalSubdivision || data.localityInfo?.administrative?.[1]?.name || 'Unknown Region';
        const country = data.countryName || 'Unknown Country';

        if (locality || region) {
          return {
            city: locality || 'Unknown City',
            region,
            country,
            accuracyType: 'GPS (Exact)',
          };
        }
      }
    } catch {
      // GPS denied, timed out, or unallowed - move to IP fallback
    }
  }

  // 2. Fallback 1: ipwho.is (CORS enabled HTTPS IP Geolocation API)
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
    // Retry fallback
  }

  // 3. Fallback 2: freeipapi.com
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
    // Retry fallback
  }

  // 4. Fallback 3: ipapi.co
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
    // Final default fallback
  }

  return {
    city: 'Unknown City',
    region: 'Unknown Region',
    country: 'Unknown Country',
    accuracyType: 'IP (Approximate)',
  };
}

export async function logVisitSilent(): Promise<void> {
  try {
    const sessionLogged = sessionStorage.getItem('dimpi_session_logged');
    if (sessionLogged) return;

    // Detect device type
    const ua = navigator.userAgent;
    let device = 'Desktop';
    if (/android/i.test(ua)) device = 'Android Mobile';
    else if (/iphone/i.test(ua)) device = 'iPhone';
    else if (/ipad/i.test(ua)) device = 'iPad Tablet';
    else if (/mobile/i.test(ua)) device = 'Mobile Browser';

    // Fetch Location Data (GPS first, then IP fallback)
    const loc = await getAccurateLocation();

    const newLog: VisitLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      city: loc.city,
      region: loc.region,
      country: loc.country,
      device,
      accuracyType: loc.accuracyType,
      isp: loc.isp,
    };

    // 1. Save to local browser storage
    const localLogs = getLocalLogs();
    localLogs.unshift(newLog);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localLogs.slice(0, 100)));
    sessionStorage.setItem('dimpi_session_logged', 'true');

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

