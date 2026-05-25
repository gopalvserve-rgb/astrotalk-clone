import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-admin-secret");
const COOKIE = "astrotalk_admin";

export interface AdminJwt { sid: string; role: "super_admin" | "admin"; }

export async function issueAdminToken(p: AdminJwt) {
  return await new SignJWT(p as any).setProtectedHeader({ alg: "HS256" })
    .setIssuedAt().setExpirationTime("7d").sign(SECRET);
}
export async function verifyAdminToken(t: string): Promise<AdminJwt | null> {
  try { const { payload } = await jwtVerify(t, SECRET); return payload as any; } catch { return null; }
}
export function setAdminCookie(t: string) {
  cookies().set(COOKIE, t, { httpOnly: true, sameSite: "lax",
    secure: process.env.NODE_ENV === "production", path: "/", maxAge: 7*24*60*60 });
}
export function clearAdminCookie() { cookies().delete(COOKIE); }
export async function getAdmin(): Promise<AdminJwt | null> {
  const t = cookies().get(COOKIE)?.value; return t ? verifyAdminToken(t) : null;
}
