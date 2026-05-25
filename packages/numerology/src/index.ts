// =====================================================================
//  Numerology engine — Pythagorean + Chaldean
// =====================================================================

const PYTHAGOREAN: Record<string, number> = {
  a: 1, j: 1, s: 1, b: 2, k: 2, t: 2, c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4, e: 5, n: 5, w: 5, f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7, h: 8, q: 8, z: 8, i: 9, r: 9,
};

const CHALDEAN: Record<string, number> = {
  a: 1, i: 1, j: 1, q: 1, y: 1,
  b: 2, k: 2, r: 2,
  c: 3, g: 3, l: 3, s: 3,
  d: 4, m: 4, t: 4,
  e: 5, h: 5, n: 5, x: 5,
  u: 6, v: 6, w: 6,
  o: 7, z: 7,
  f: 8, p: 8,
  // Note: Chaldean system has no 9 for letters
};

function reduce(n: number): number {
  // Don't reduce master numbers 11, 22, 33
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = n.toString().split("").reduce((acc, d) => acc + parseInt(d, 10), 0);
  }
  return n;
}

function nameValue(name: string, table: Record<string, number>): number {
  return reduce(
    name.toLowerCase().split("")
      .map((c) => table[c] ?? 0)
      .reduce((a, b) => a + b, 0),
  );
}

export function lifePathNumber(dob: Date): number {
  const sum =
    [dob.getFullYear(), dob.getMonth() + 1, dob.getDate()]
      .join("").split("")
      .reduce((a, c) => a + parseInt(c, 10), 0);
  return reduce(sum);
}

export function destinyNumber(fullName: string, system: "pythagorean" | "chaldean" = "chaldean"): number {
  return nameValue(fullName, system === "chaldean" ? CHALDEAN : PYTHAGOREAN);
}

export function soulUrgeNumber(fullName: string): number {
  const vowels = fullName.toLowerCase().replace(/[^aeiou]/g, "");
  return nameValue(vowels, CHALDEAN);
}

export function personalityNumber(fullName: string): number {
  const cons = fullName.toLowerCase().replace(/[aeiou]/g, "").replace(/[^a-z]/g, "");
  return nameValue(cons, CHALDEAN);
}

export function birthdayNumber(dob: Date): number {
  return reduce(dob.getDate());
}

export function personalYear(dob: Date, year: number): number {
  return reduce(dob.getMonth() + 1 + dob.getDate() + year);
}

export interface NumerologyReport {
  lifePath: number;
  destiny: number;
  soulUrge: number;
  personality: number;
  birthday: number;
  personalYear: number;
  luckyNumbers: number[];
  luckyColors: string[];
  luckyDays: string[];
}

const LUCKY_NUMBER_MAP: Record<number, number[]> = {
  1: [1, 10, 19, 28], 2: [2, 11, 20, 29], 3: [3, 12, 21, 30],
  4: [4, 13, 22, 31], 5: [5, 14, 23], 6: [6, 15, 24],
  7: [7, 16, 25], 8: [8, 17, 26], 9: [9, 18, 27],
  11: [2, 11, 20], 22: [4, 22], 33: [6, 33],
};

const LUCKY_COLOR_MAP: Record<number, string[]> = {
  1: ["Red", "Gold"], 2: ["White", "Silver", "Cream"],
  3: ["Yellow", "Orange"], 4: ["Blue", "Grey"],
  5: ["Green", "Silver"], 6: ["Pink", "Sky-blue"],
  7: ["Purple", "Sea-green"], 8: ["Black", "Dark-blue"],
  9: ["Red", "Crimson"],
};

const LUCKY_DAYS_MAP: Record<number, string[]> = {
  1: ["Sunday"], 2: ["Monday", "Friday"], 3: ["Thursday"],
  4: ["Saturday", "Sunday"], 5: ["Wednesday"], 6: ["Friday"],
  7: ["Monday"], 8: ["Saturday"], 9: ["Tuesday"],
};

export function generateReport(name: string, dob: Date, currentYear?: number): NumerologyReport {
  const lp = lifePathNumber(dob);
  const cy = currentYear ?? new Date().getFullYear();
  return {
    lifePath: lp,
    destiny: destinyNumber(name),
    soulUrge: soulUrgeNumber(name),
    personality: personalityNumber(name),
    birthday: birthdayNumber(dob),
    personalYear: personalYear(dob, cy),
    luckyNumbers: LUCKY_NUMBER_MAP[lp] ?? [lp],
    luckyColors: LUCKY_COLOR_MAP[lp] ?? ["Gold"],
    luckyDays: LUCKY_DAYS_MAP[lp] ?? ["Sunday"],
  };
}
