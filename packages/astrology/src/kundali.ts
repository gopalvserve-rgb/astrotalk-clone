import {
  julianDay, sunLongitude, moonLongitude, tropicalAscendant,
  tropicalToSidereal, signFromLongitude, nakshatraFromLongitude,
} from "./ephemeris";
import type { BirthDetails } from "@astrotalk/shared";
import { VIMSHOTTARI, VIMSHOTTARI_TOTAL_YEARS } from "./dasha";

export interface KundaliData {
  ascendant: { sign: string; degree: number };
  moon: { sign: string; nakshatra: string; pada: number; degree: number };
  sun:  { sign: string; degree: number; nakshatra: string };
  houses: Array<{ index: number; sign: string; planets: string[] }>;
  dasha: { mahaLord: string; antarLord: string; startsAt: string; endsAt: string; sequence: Array<{lord:string; from:string; to:string}> };
  yogas: string[];
  doshas: string[];
}

function buildUtcFromBirth(birth: BirthDetails): Date {
  // Treat birth.date + birth.time as local time in birth.timezone (default Asia/Kolkata = +5:30).
  const [hh, mm] = (birth.time || "00:00").split(":").map(Number);
  const local = new Date(`${birth.date}T${String(hh).padStart(2, "0")}:${String(mm ?? 0).padStart(2, "0")}:00`);
  const offsetMin = birth.timezone === "Asia/Kolkata" ? -330 : 0;   // simplified — production: use luxon
  return new Date(local.getTime() + offsetMin * 60 * 1000);
}

/** Compute sidereal kundali for given birth details. */
export function computeKundali(birth: BirthDetails): KundaliData {
  const utc = buildUtcFromBirth(birth);
  const jd  = julianDay(utc);

  // Tropical positions
  const tSun = sunLongitude(jd);
  const tMoon = moonLongitude(jd);
  const tAsc = tropicalAscendant(jd, birth.lat, birth.lng);

  // Sidereal (Lahiri)
  const sSun = tropicalToSidereal(tSun, jd);
  const sMoon = tropicalToSidereal(tMoon, jd);
  const sAsc = tropicalToSidereal(tAsc, jd);

  const ascSign = signFromLongitude(sAsc);
  const sunSign = signFromLongitude(sSun);
  const moonSign = signFromLongitude(sMoon);
  const moonNak = nakshatraFromLongitude(sMoon);
  const sunNak  = nakshatraFromLongitude(sSun);

  // 12 houses (whole-sign Vedic): house 1 = ascendant's sign, houses follow signs
  const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
  const houses = Array.from({ length: 12 }, (_, i) => ({
    index: i + 1,
    sign: SIGNS[(ascSign.signIndex + i) % 12]!,
    planets: [] as string[],
  }));
  // Drop Sun, Moon (we have these). Phase 2.x extends with all 9 grahas.
  const sunHouse = ((sunSign.signIndex - ascSign.signIndex + 12) % 12) + 1;
  const moonHouse = ((moonSign.signIndex - ascSign.signIndex + 12) % 12) + 1;
  houses[sunHouse - 1]!.planets.push("Sun");
  houses[moonHouse - 1]!.planets.push("Moon");

  // Vimshottari Dasha — Moon's nakshatra determines starting Maha-dasha lord
  const startIdx = moonNak.index % 9;
  const elapsedInNak = (sMoon - moonNak.index * (360/27)) / (360/27);   // 0–1
  const startLord = VIMSHOTTARI[startIdx]!;
  const yearsRemaining = startLord.years * (1 - elapsedInNak);

  const seq: Array<{ lord: string; from: string; to: string }> = [];
  let cursorYr = utc.getUTCFullYear() - Math.floor((startLord.years - yearsRemaining));
  let cursorMs = utc.getTime() - (startLord.years - yearsRemaining) * 365.25 * 86400000;
  for (let i = 0; i < VIMSHOTTARI.length; i++) {
    const lord = VIMSHOTTARI[(startIdx + i) % VIMSHOTTARI.length]!;
    const startD = new Date(cursorMs);
    const endMs = cursorMs + lord.years * 365.25 * 86400000;
    seq.push({ lord: lord.lord, from: startD.toISOString().slice(0,10), to: new Date(endMs).toISOString().slice(0,10) });
    cursorMs = endMs;
  }
  // Current maha = first whose interval includes now
  const now = Date.now();
  const current = seq.find((s) => Date.parse(s.from) <= now && now < Date.parse(s.to)) ?? seq[0]!;

  // Antar-dasha — current maha lord's interval / 120 * each sub-lord's years
  // (Approximation; production: full proportional table.)
  const antarLord = VIMSHOTTARI[(VIMSHOTTARI.findIndex(v => v.lord === current.lord) + 1) % VIMSHOTTARI.length]!.lord;

  const yogas: string[] = [];
  const doshas: string[] = [];

  // Gaj-Kesari (Moon ↔ Jupiter angular) — Phase 2.x once Jupiter pos is wired
  // Mangal Dosha — Phase 2.x (Mars in 1/2/4/7/8/12)
  // Kaal Sarp Dosha — Phase 2.x (Rahu-Ketu enclose all planets)

  return {
    ascendant: { sign: ascSign.sign, degree: ascSign.degree },
    moon: { sign: moonSign.sign, degree: moonSign.degree, nakshatra: moonNak.name, pada: moonNak.pada },
    sun:  { sign: sunSign.sign, degree: sunSign.degree, nakshatra: sunNak.name },
    houses,
    dasha: {
      mahaLord: current.lord,
      antarLord,
      startsAt: current.from,
      endsAt: current.to,
      sequence: seq,
    },
    yogas, doshas,
  };
}
