import { ZODIAC_SIGNS, type ZodiacSign } from "@astrotalk/shared";

/** Western (tropical) zodiac sign from a JS Date — based on Sun longitude approximation by date. */
export function tropicalSignFromDate(d: Date): ZodiacSign {
  const m = d.getMonth() + 1; const day = d.getDate();
  const cutoffs: Array<[number, number, ZodiacSign]> = [
    [3, 21, "aries"], [4, 20, "taurus"], [5, 21, "gemini"], [6, 21, "cancer"],
    [7, 23, "leo"], [8, 23, "virgo"], [9, 23, "libra"], [10, 23, "scorpio"],
    [11, 22, "sagittarius"], [12, 22, "capricorn"], [1, 20, "aquarius"], [2, 19, "pisces"],
  ];
  // simple month/day comparison
  for (let i = 0; i < cutoffs.length; i++) {
    const [cm, cd, sign] = cutoffs[i]!;
    const [nm, nd] = i < cutoffs.length - 1 ? [cutoffs[i + 1]![0], cutoffs[i + 1]![1]] : [3, 21];
    if (
      (m === cm && day >= cd) ||
      (m === nm && day < nd) ||
      (cm === 12 && (m === 12 || m === 1) && (m === 12 ? day >= cd : day < nd))
    ) return sign;
  }
  return "aries";
}

export const ELEMENTS: Record<ZodiacSign, "fire" | "earth" | "air" | "water"> = {
  aries: "fire", leo: "fire", sagittarius: "fire",
  taurus: "earth", virgo: "earth", capricorn: "earth",
  gemini: "air", libra: "air", aquarius: "air",
  cancer: "water", scorpio: "water", pisces: "water",
};

export const SIGN_LORDS: Record<ZodiacSign, string> = {
  aries: "Mars", taurus: "Venus", gemini: "Mercury", cancer: "Moon",
  leo: "Sun", virgo: "Mercury", libra: "Venus", scorpio: "Mars",
  sagittarius: "Jupiter", capricorn: "Saturn", aquarius: "Saturn", pisces: "Jupiter",
};

export const ALL_SIGNS = ZODIAC_SIGNS;
