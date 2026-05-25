import {
  julianDay, sunLongitude, moonLongitude, lahiriAyanamsa,
  nakshatraFromLongitude, tropicalToSidereal,
} from "./ephemeris";

export interface PanchangData {
  date: string;
  tithi: string;
  paksha: "Shukla" | "Krishna";
  vara: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  rahuKaal: string;
  yamaganda: string;
  gulika: string;
  abhijitMuhurat: string;
}

const TITHIS = [
  "Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi",
  "Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi",
  "Trayodashi","Chaturdashi","Purnima",
  "Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi",
  "Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi",
  "Trayodashi","Chaturdashi","Amavasya",
];
const YOGAS = [
  "Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda",
  "Sukarman","Dhriti","Shoola","Ganda","Vriddhi","Dhruva",
  "Vyaghata","Harshana","Vajra","Siddhi","Vyatipata","Variyan",
  "Parigha","Shiva","Siddha","Sadhya","Shubha","Shukla",
  "Brahma","Indra","Vaidhriti",
];
const KARANAS = [
  "Bava","Balava","Kaulava","Taitila","Garaja","Vanija","Vishti",
  "Bava","Balava","Kaulava","Taitila","Garaja","Vanija","Vishti",
  // Phase 2.x: full Karana table including fixed karanas
];
const VARAS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

/** Approximate sunrise / sunset (NOAA formula). */
function sunriseSunset(date: Date, lat: number, lng: number): { sunrise: Date; sunset: Date } {
  const RAD = Math.PI / 180;
  const N = Math.floor((date.getTime() - Date.UTC(date.getUTCFullYear(),0,0)) / 86400000);
  const lngHour = lng / 15;
  function calc(rising: boolean) {
    const t = N + ((rising ? 6 : 18) - lngHour) / 24;
    const M = (0.9856 * t) - 3.289;
    let L = M + (1.916 * Math.sin(M * RAD)) + (0.020 * Math.sin(2 * M * RAD)) + 282.634;
    L = ((L % 360) + 360) % 360;
    let RA = Math.atan(0.91764 * Math.tan(L * RAD)) / RAD;
    RA = ((RA % 360) + 360) % 360;
    const Lq = Math.floor(L / 90) * 90;
    const RAq = Math.floor(RA / 90) * 90;
    RA = (RA + (Lq - RAq)) / 15;
    const sinDec = 0.39782 * Math.sin(L * RAD);
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH = (Math.cos(90.833 * RAD) - (sinDec * Math.sin(lat * RAD))) / (cosDec * Math.cos(lat * RAD));
    const H = (rising ? 360 - Math.acos(cosH) / RAD : Math.acos(cosH) / RAD) / 15;
    const T = H + RA - (0.06571 * t) - 6.622;
    let UT = ((T - lngHour) % 24 + 24) % 24;
    const d = new Date(date);
    d.setUTCHours(Math.floor(UT), Math.floor((UT % 1) * 60), 0, 0);
    return d;
  }
  return { sunrise: calc(true), sunset: calc(false) };
}

const fmt = (d: Date) => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });

function dayPortion(sunrise: Date, sunset: Date, n: number, totalParts: number): string {
  const dur = sunset.getTime() - sunrise.getTime();
  const a = new Date(sunrise.getTime() + (n - 1) * (dur / totalParts));
  const b = new Date(sunrise.getTime() + n * (dur / totalParts));
  return `${fmt(a)}–${fmt(b)}`;
}

const RAHU_KAAL_SEGMENT: Record<number, number> = { 0:8, 1:2, 2:7, 3:5, 4:6, 5:4, 6:3 };
const YAMAGANDA_SEGMENT: Record<number, number> = { 0:5, 1:4, 2:3, 3:2, 4:1, 5:7, 6:6 };
const GULIKA_SEGMENT: Record<number, number> = { 0:7, 1:6, 2:5, 3:4, 4:3, 5:2, 6:1 };

export function getPanchang(date: Date, lat: number, lng: number): PanchangData {
  const utc = new Date(date.toISOString().slice(0,10) + "T00:00:00Z");
  const jd = julianDay(utc);

  const tSun = sunLongitude(jd);
  const tMoon = moonLongitude(jd);

  // Tithi: difference (Moon - Sun) in degrees / 12
  let diff = tMoon - tSun;
  diff = ((diff % 360) + 360) % 360;
  const tithiNum = Math.floor(diff / 12);
  const paksha = tithiNum < 15 ? "Shukla" : "Krishna";

  // Nakshatra: sidereal moon
  const sMoon = tropicalToSidereal(tMoon, jd);
  const nak = nakshatraFromLongitude(sMoon);

  // Yoga: (Sun + Moon) / (360/27)
  const yogaIdx = Math.floor((((tSun + tMoon) % 360) + 360) % 360 / (360 / 27));
  // Karana: every 6° within a tithi (2 karanas per tithi)
  const karanaIdx = Math.floor(diff / 6) % KARANAS.length;

  const { sunrise, sunset } = sunriseSunset(date, lat, lng);
  const dow = date.getDay();
  const rahuSeg = RAHU_KAAL_SEGMENT[dow]!;
  const yamSeg = YAMAGANDA_SEGMENT[dow]!;
  const gulSeg = GULIKA_SEGMENT[dow]!;

  // Abhijit muhurat = midday ±24 minutes (~6th of 15 day muhurats)
  const middayMs = (sunrise.getTime() + sunset.getTime()) / 2;
  const abhA = new Date(middayMs - 24*60000);
  const abhB = new Date(middayMs + 24*60000);

  return {
    date: date.toISOString().slice(0,10),
    tithi: `${paksha} Paksha ${TITHIS[tithiNum]}`,
    paksha,
    vara: VARAS[dow]!,
    nakshatra: `${nak.name} (Pada ${nak.pada})`,
    yoga: YOGAS[yogaIdx]!,
    karana: KARANAS[karanaIdx]!,
    sunrise: fmt(sunrise),
    sunset: fmt(sunset),
    rahuKaal: dayPortion(sunrise, sunset, rahuSeg, 8),
    yamaganda: dayPortion(sunrise, sunset, yamSeg, 8),
    gulika: dayPortion(sunrise, sunset, gulSeg, 8),
    abhijitMuhurat: `${fmt(abhA)}–${fmt(abhB)}`,
  };
}
