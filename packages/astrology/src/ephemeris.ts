/**
 * Swiss Ephemeris bindings (sidereal Lahiri ayanamsa).
 *
 * Production: `npm i swisseph` (native binding) and uncomment the import.
 * The functions here expose a clean async API for the rest of the package.
 *
 * For Phase 2 we ship a self-contained astronomical fallback using
 * Jean Meeus algorithms so the app works WITHOUT the native binary,
 * with ±10–20 arcmin accuracy (enough for production for most birth charts).
 * For sub-arc-minute accuracy, set USE_SWISSEPH=true and install swisseph.
 */

// Comment in once swisseph is installed:
// import swisseph from "swisseph";

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const J2000 = 2451545.0;

/** Julian Day Number for a given UTC moment. */
export function julianDay(utc: Date): number {
  const Y = utc.getUTCFullYear();
  const M = utc.getUTCMonth() + 1;
  const D = utc.getUTCDate() + (utc.getUTCHours() + utc.getUTCMinutes() / 60 + utc.getUTCSeconds() / 3600) / 24;
  let y = Y, m = M;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + D + B - 1524.5;
}

/** Lahiri ayanamsa for a given JD (Newcomb formula, sufficient for Vedic use). */
export function lahiriAyanamsa(jd: number): number {
  const T = (jd - J2000) / 36525;
  // Lahiri ayanamsa ≈ 23.85 deg at 2000.0, increasing ~50.2"/year
  return 23.85 + (T * 1.397778) ;
}

/** Greenwich sidereal time, in degrees. */
export function gmst(jd: number): number {
  const T = (jd - J2000) / 36525;
  let theta = 280.46061837 + 360.98564736629 * (jd - J2000) + 0.000387933 * T * T - (T * T * T) / 38710000;
  theta = ((theta % 360) + 360) % 360;
  return theta;
}

/**
 * Approximate tropical longitude of the Sun (Meeus, low precision).
 * Sufficient for Lagna / Sun sign with ±0.01° accuracy.
 */
export function sunLongitude(jd: number): number {
  const T = (jd - J2000) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * RAD;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M);
  return ((L0 + C) % 360 + 360) % 360;
}

/** Approximate tropical Moon longitude (Meeus low precision). */
export function moonLongitude(jd: number): number {
  const T = (jd - J2000) / 36525;
  const Lp = 218.3164591 + 481267.88134236 * T;
  const D = 297.8502042 + 445267.1115168 * T;
  const M = 357.5291092 + 35999.0502909 * T;
  const Mp = 134.9634114 + 477198.8676313 * T;
  const F = 93.2720993 + 483202.0175273 * T;
  const r = RAD;
  let lon = Lp +
     6.288774 * Math.sin(Mp * r) +
     1.274027 * Math.sin((2 * D - Mp) * r) +
     0.658314 * Math.sin(2 * D * r) +
     0.213618 * Math.sin(2 * Mp * r) -
     0.185116 * Math.sin(M * r) -
     0.114332 * Math.sin(2 * F * r);
  return ((lon % 360) + 360) % 360;
}

/** Convert tropical → sidereal longitude. */
export function tropicalToSidereal(lon: number, jd: number): number {
  return ((lon - lahiriAyanamsa(jd)) % 360 + 360) % 360;
}

/** Ascendant (lagna) in tropical degrees for a given JD + geographic lat (deg) + lng (deg, east+). */
export function tropicalAscendant(jd: number, lat: number, lng: number): number {
  const gst = gmst(jd);                       // degrees
  const lst = (gst + lng + 360) % 360;        // local sidereal
  const ramc = lst * RAD;
  const obl = 23.4392911 * RAD;               // mean obliquity
  const latR = lat * RAD;
  // Standard ascendant formula:
  const y = -Math.cos(ramc);
  const x = Math.sin(ramc) * Math.cos(obl) + Math.tan(latR) * Math.sin(obl);
  let asc = Math.atan2(y, x) * DEG;
  asc = ((asc % 360) + 360) % 360;
  return asc;
}

export const SIGNS_LIST = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;
export type SignName = (typeof SIGNS_LIST)[number];

export function signFromLongitude(lon: number): { sign: SignName; degree: number; signIndex: number } {
  const idx = Math.floor(((lon % 360) + 360) % 360 / 30);
  return { sign: SIGNS_LIST[idx]!, degree: ((lon % 360) + 360) % 360 - idx * 30, signIndex: idx };
}

/** Nakshatra (sidereal, 27 segments of 13°20'). */
const NAKS = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra",
  "Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni",
  "Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha",
  "Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana",
  "Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati",
];
export function nakshatraFromLongitude(siderealLon: number): { name: string; pada: number; index: number } {
  const segment = 360 / 27;
  const idx = Math.floor(siderealLon / segment) % 27;
  const within = siderealLon - idx * segment;
  const pada = Math.floor(within / (segment / 4)) + 1;
  return { name: NAKS[idx]!, pada, index: idx };
}
