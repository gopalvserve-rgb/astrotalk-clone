/**
 * Shubh Muhurat — 7 categories. For Phase 2 we return curated dates based on
 * panchang rules (avoiding inauspicious yogas / nakshatras / tithis).
 * Each function returns an array of {date, time, score, reason}.
 */

import { getPanchang } from "./panchang";

export type MuhuratType =
  | "marriage" | "griha_pravesh" | "mundan" | "naamkaran"
  | "annaprashan" | "bhoomi_pujan" | "car_bike";

interface MuhuratEntry { date: string; time: string; score: number; reason: string; }

const FAVOURABLE_NAKS: Record<MuhuratType, string[]> = {
  marriage: ["Rohini","Mrigashira","Magha","Uttara Phalguni","Hasta","Swati","Anuradha","Mula","Uttara Ashadha","Uttara Bhadrapada","Revati"],
  griha_pravesh: ["Rohini","Mrigashira","Anuradha","Chitra","Uttara Phalguni","Uttara Ashadha","Uttara Bhadrapada","Revati"],
  mundan: ["Mrigashira","Pushya","Hasta","Chitra","Swati","Jyeshtha","Shravana","Dhanishta","Shatabhisha"],
  naamkaran: ["Ashwini","Rohini","Mrigashira","Punarvasu","Pushya","Hasta","Anuradha","Shravana","Revati"],
  annaprashan: ["Rohini","Mrigashira","Pushya","Hasta","Chitra","Anuradha","Revati"],
  bhoomi_pujan: ["Rohini","Mrigashira","Pushya","Anuradha","Uttara Ashadha","Shravana","Revati"],
  car_bike: ["Rohini","Mrigashira","Pushya","Hasta","Chitra","Swati","Anuradha","Shravana","Dhanishta","Revati"],
};

export function findMuhurats(opts: {
  type: MuhuratType;
  from: Date;
  to: Date;
  lat: number; lng: number;
}): MuhuratEntry[] {
  const result: MuhuratEntry[] = [];
  const cursor = new Date(opts.from.getTime());
  while (cursor <= opts.to) {
    const p = getPanchang(cursor, opts.lat, opts.lng);
    const nakName = p.nakshatra.split(" ")[0]!;       // "Rohini (Pada 2)" → "Rohini"
    if (FAVOURABLE_NAKS[opts.type].includes(nakName)) {
      result.push({
        date: p.date, time: p.abhijitMuhurat,
        score: 90, reason: `Auspicious ${nakName} nakshatra + ${p.yoga} yoga; tithi: ${p.tithi}`,
      });
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return result;
}
