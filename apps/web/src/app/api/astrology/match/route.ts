import { NextResponse } from "next/server";
import { computeKundali, computeMatch } from "@astrotalk/astrology";

const SIGN_INDEX: Record<string, number> = {
  Aries:0, Taurus:1, Gemini:2, Cancer:3, Leo:4, Virgo:5,
  Libra:6, Scorpio:7, Sagittarius:8, Capricorn:9, Aquarius:10, Pisces:11,
};
const NAK_INDEX: Record<string, number> = Object.fromEntries(
  ["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"]
    .map((n, i) => [n, i]),
);

export async function POST(req: Request) {
  const { boy, girl } = await req.json();
  const kb = computeKundali({ name: boy.name, date: boy.date, time: boy.time, place: boy.place, lat: 28.61, lng: 77.20, timezone: "Asia/Kolkata" });
  const kg = computeKundali({ name: girl.name, date: girl.date, time: girl.time, place: girl.place, lat: 28.61, lng: 77.20, timezone: "Asia/Kolkata" });

  const result = computeMatch({
    boy:  { name: boy.name,  moonSignIndex: SIGN_INDEX[kb.moon.sign]!, nakshatraIndex: NAK_INDEX[kb.moon.nakshatra]! },
    girl: { name: girl.name, moonSignIndex: SIGN_INDEX[kg.moon.sign]!, nakshatraIndex: NAK_INDEX[kg.moon.nakshatra]! },
  });

  return NextResponse.json({ ok: true, ...result });
}
