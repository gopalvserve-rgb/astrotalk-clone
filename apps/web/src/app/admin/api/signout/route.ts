import { NextResponse } from "next/server";
import { clearAdminCookie } from "../../../../lib/admin-auth";
export async function POST() { clearAdminCookie(); return NextResponse.redirect(new URL("/admin/login", "http://localhost:3000")); }
