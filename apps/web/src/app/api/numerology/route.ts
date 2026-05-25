import { NextResponse } from "next/server";
import { generateReport } from "@astrotalk/numerology";

export async function POST(req: Request) {
  const { name, dob } = await req.json();
  if (!name || !dob) return NextResponse.json({ error: "name + dob required" }, { status: 400 });
  const report = generateReport(name, new Date(dob));
  return NextResponse.json({ ok: true, report });
}
