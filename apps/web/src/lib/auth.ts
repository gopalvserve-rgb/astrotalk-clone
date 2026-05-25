/**
 * Auth — JWT-based with HttpOnly cookies.
 * Phase 1 implements: signup (phone OTP), signin (phone OTP or email/password).
 */

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-replace-me",
);
const COOKIE_NAME = "astrotalk_session";

export interface JwtPayload {
  uid: string;
  tid: string;
  role: "user" | "astrologer" | "admin";
  iat?: number;
  exp?: number;
}

export async function issueToken(payload: Omit<JwtPayload, "iat" | "exp">) {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true, sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<JwtPayload | null> {
  const t = cookies().get(COOKIE_NAME)?.value;
  if (!t) return null;
  return await verifyToken(t);
}
