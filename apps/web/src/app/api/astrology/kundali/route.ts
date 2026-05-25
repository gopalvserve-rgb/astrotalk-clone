import { NextResponse } from "next/server";
import { z } from "zod";
import { computeKundali } from "@astrotalk/astrology";

const Body = z.object({
  name: z.string(),
  gender: z.string().optional(),
  date: z.string(),
  time: z.string(),
  place: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  timezone: z.string().default("Asia/Kolkata"),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const d = parsed.data;
  const data = computeKundali({
    name: d.name, gender: d.gender as any, date: d.date, time: d.time,
    place: d.place, lat: d.lat ?? 28.61, lng: d.lng ?? 77.20, timezone: d.timezone,
  });

  return NextResponse.json({ ok: true, kundali: data });
}
