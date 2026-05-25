export const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
] as const;
export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni",
  "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha",
  "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana",
  "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
] as const;

export const MUHURAT_TYPES = [
  "annaprashan", "naamkaran", "car_bike", "marriage",
  "bhoomi_pujan", "griha_pravesh", "mundan",
] as const;

export const HOROSCOPE_PERIODS = ["daily", "weekly", "monthly", "yearly"] as const;
export type HoroscopePeriod = (typeof HOROSCOPE_PERIODS)[number];

export const DEFAULT_THEME = {
  primaryColor: "#F26B1D",     // saffron
  secondaryColor: "#1A1230",   // night-sky
  accentColor: "#F5C518",      // gold
};
