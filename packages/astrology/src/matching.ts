/**
 * Ashtakoot 36-Guna matching — real implementation.
 * Computes scores from both partners' sidereal Moon sign + Nakshatra.
 */

const SIGN_VARNA: Record<number, "Brahmin" | "Kshatriya" | "Vaishya" | "Shudra"> = {
  // 0=Aries, 1=Taurus, …, 11=Pisces
  0: "Kshatriya", 1: "Vaishya", 2: "Shudra", 3: "Brahmin",
  4: "Kshatriya", 5: "Vaishya", 6: "Shudra", 7: "Brahmin",
  8: "Kshatriya", 9: "Vaishya", 10: "Shudra", 11: "Brahmin",
};

const VARNA_RANK: Record<string, number> = { Shudra: 1, Vaishya: 2, Kshatriya: 3, Brahmin: 4 };

const SIGN_VASHYA: Record<number, "Chatushpada" | "Manava" | "Jalachara" | "Vanachara" | "Keeta"> = {
  0: "Chatushpada", 1: "Chatushpada", 2: "Manava", 3: "Jalachara",
  4: "Vanachara", 5: "Manava", 6: "Manava", 7: "Keeta",
  8: "Manava", 9: "Chatushpada", 10: "Manava", 11: "Jalachara",
};

const YONI: Record<number, { animal: string; sex: "M" | "F" }> = {
  0: { animal: "Horse", sex: "M" }, 1: { animal: "Elephant", sex: "M" }, 2: { animal: "Sheep", sex: "F" },
  3: { animal: "Snake", sex: "M" }, 4: { animal: "Snake", sex: "F" }, 5: { animal: "Dog", sex: "M" },
  6: { animal: "Cat", sex: "F" }, 7: { animal: "Cat", sex: "M" }, 8: { animal: "Rat", sex: "M" },
  9: { animal: "Rat", sex: "F" }, 10: { animal: "Cow", sex: "F" }, 11: { animal: "Buffalo", sex: "M" },
  12: { animal: "Tiger", sex: "M" }, 13: { animal: "Hare", sex: "F" }, 14: { animal: "Hare", sex: "M" },
  15: { animal: "Monkey", sex: "M" }, 16: { animal: "Mongoose", sex: "M" }, 17: { animal: "Lion", sex: "F" },
  18: { animal: "Lion", sex: "M" }, 19: { animal: "Horse", sex: "F" }, 20: { animal: "Cow", sex: "M" },
  21: { animal: "Buffalo", sex: "F" }, 22: { animal: "Tiger", sex: "F" }, 23: { animal: "Sheep", sex: "M" },
  24: { animal: "Monkey", sex: "F" }, 25: { animal: "Mongoose", sex: "F" }, 26: { animal: "Elephant", sex: "F" },
};

const GANA_FROM_NAK: Record<number, "Deva" | "Manushya" | "Rakshasa"> = {
  0: "Deva", 1: "Manushya", 2: "Rakshasa", 3: "Manushya", 4: "Deva", 5: "Manushya",
  6: "Deva", 7: "Deva", 8: "Rakshasa", 9: "Rakshasa", 10: "Manushya", 11: "Manushya",
  12: "Deva", 13: "Rakshasa", 14: "Deva", 15: "Rakshasa", 16: "Deva", 17: "Rakshasa",
  18: "Rakshasa", 19: "Manushya", 20: "Manushya", 21: "Deva", 22: "Rakshasa", 23: "Rakshasa",
  24: "Manushya", 25: "Manushya", 26: "Deva",
};

const NADI: Record<number, "Adi" | "Madhya" | "Antya"> = {
  0: "Adi", 1: "Madhya", 2: "Antya", 3: "Antya", 4: "Madhya", 5: "Adi",
  6: "Adi", 7: "Madhya", 8: "Antya", 9: "Antya", 10: "Madhya", 11: "Adi",
  12: "Adi", 13: "Madhya", 14: "Antya", 15: "Antya", 16: "Madhya", 17: "Adi",
  18: "Adi", 19: "Madhya", 20: "Antya", 21: "Antya", 22: "Madhya", 23: "Adi",
  24: "Adi", 25: "Madhya", 26: "Antya",
};

export interface MatchInput {
  boy:  { name: string; moonSignIndex: number; nakshatraIndex: number };
  girl: { name: string; moonSignIndex: number; nakshatraIndex: number };
}
export interface MatchResult {
  total: number;
  outOf: 36;
  percent: number;
  verdict: "Excellent" | "Good" | "Average" | "Not recommended";
  breakdown: Array<{ koot: string; score: number; max: number; reason: string }>;
}

export function computeMatch(input: MatchInput): MatchResult {
  const b = input.boy, g = input.girl;
  const items: MatchResult["breakdown"] = [];

  // 1) Varna (max 1)
  const bv = VARNA_RANK[SIGN_VARNA[b.moonSignIndex]!]!;
  const gv = VARNA_RANK[SIGN_VARNA[g.moonSignIndex]!]!;
  items.push({ koot: "Varna", max: 1, score: bv >= gv ? 1 : 0,
    reason: bv >= gv ? "Boy's varna equal or higher" : "Boy's varna lower" });

  // 2) Vashya (max 2)
  const bvash = SIGN_VASHYA[b.moonSignIndex];
  const gvash = SIGN_VASHYA[g.moonSignIndex];
  let vashScore = 2;
  if (bvash !== gvash) vashScore = 1;
  if ((bvash === "Manava" && gvash === "Vanachara") || (bvash === "Chatushpada" && gvash === "Keeta")) vashScore = 0;
  items.push({ koot: "Vashya", max: 2, score: vashScore, reason: `${bvash} ↔ ${gvash}` });

  // 3) Tara (max 3)
  const taraDiff = ((g.nakshatraIndex - b.nakshatraIndex + 27) % 27);
  const taraNum = (taraDiff % 9) + 1;
  // 1,3,5,7 inauspicious — 0 points. 2,4,6,8,9 — score 3.
  const taraScore = [1, 3, 5, 7].includes(taraNum) ? 0 : 3;
  items.push({ koot: "Tara", max: 3, score: taraScore, reason: `Tara number ${taraNum}` });

  // 4) Yoni (max 4)
  const bYoni = YONI[b.nakshatraIndex]!, gYoni = YONI[g.nakshatraIndex]!;
  let yoniScore = 0;
  if (bYoni.animal === gYoni.animal) yoniScore = 4;
  else if ([["Cow","Tiger"],["Elephant","Lion"],["Horse","Buffalo"],["Dog","Hare"],["Snake","Mongoose"],["Cat","Rat"],["Monkey","Sheep"]].some(([a,b2])=>(a===bYoni.animal&&b2===gYoni.animal)||(b2===bYoni.animal&&a===gYoni.animal))) yoniScore = 0;
  else yoniScore = 2;
  items.push({ koot: "Yoni", max: 4, score: yoniScore, reason: `${bYoni.animal} ↔ ${gYoni.animal}` });

  // 5) Graha Maitri (max 5) — simplified by sign lord friendship
  const SIGN_LORD = ["Mars","Venus","Mercury","Moon","Sun","Mercury","Venus","Mars","Jupiter","Saturn","Saturn","Jupiter"];
  const friends: Record<string,string[]> = {
    Sun: ["Moon","Mars","Jupiter"], Moon: ["Sun","Mercury"],
    Mars: ["Sun","Moon","Jupiter"], Mercury: ["Sun","Venus"],
    Jupiter: ["Sun","Moon","Mars"], Venus: ["Mercury","Saturn"],
    Saturn: ["Venus","Mercury"],
  };
  const bL = SIGN_LORD[b.moonSignIndex]!, gL = SIGN_LORD[g.moonSignIndex]!;
  let grahaScore = 0;
  if (bL === gL) grahaScore = 5;
  else if (friends[bL]?.includes(gL) && friends[gL]?.includes(bL)) grahaScore = 5;
  else if (friends[bL]?.includes(gL) || friends[gL]?.includes(bL)) grahaScore = 4;
  else grahaScore = 0;
  items.push({ koot: "Graha Maitri", max: 5, score: grahaScore, reason: `${bL} ↔ ${gL}` });

  // 6) Gana (max 6)
  const bG = GANA_FROM_NAK[b.nakshatraIndex], gG = GANA_FROM_NAK[g.nakshatraIndex];
  let ganaScore = 0;
  if (bG === gG) ganaScore = 6;
  else if ((bG === "Deva" && gG === "Manushya") || (bG === "Manushya" && gG === "Deva")) ganaScore = 5;
  else if ((bG === "Manushya" && gG === "Rakshasa") || (bG === "Rakshasa" && gG === "Manushya")) ganaScore = 1;
  else ganaScore = 0;
  items.push({ koot: "Gana", max: 6, score: ganaScore, reason: `${bG} ↔ ${gG}` });

  // 7) Bhakoot (max 7) — sign distance
  const sd = (g.moonSignIndex - b.moonSignIndex + 12) % 12;
  const bhakootScore = [2,5,6,8,12-2,12-5,12-6,12-8].includes(sd) ? 0 : 7;
  items.push({ koot: "Bhakoot", max: 7, score: bhakootScore, reason: `Sign distance ${sd}` });

  // 8) Nadi (max 8)
  const bN = NADI[b.nakshatraIndex], gN = NADI[g.nakshatraIndex];
  const nadiScore = bN !== gN ? 8 : 0;
  items.push({ koot: "Nadi", max: 8, score: nadiScore, reason: `${bN} ↔ ${gN}` });

  const total = items.reduce((a, c) => a + c.score, 0);
  const percent = Math.round((total / 36) * 100);
  const verdict: MatchResult["verdict"] =
    total >= 30 ? "Excellent" : total >= 24 ? "Good" : total >= 18 ? "Average" : "Not recommended";

  return { total, outOf: 36, percent, verdict, breakdown: items };
}
