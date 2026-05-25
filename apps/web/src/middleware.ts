import { NextResponse, type NextRequest } from "next/server";

// Simple in-memory rate-limit (Phase 9.x: Redis sliding window).
const HITS = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 120;        // 120 requests / minute / IP

export function middleware(req: NextRequest) {
  const isApi = req.nextUrl.pathname.startsWith("/api/");
  if (!isApi) return NextResponse.next();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.ip || "unknown";
  const now = Date.now();
  const rec = HITS.get(ip);
  if (!rec || rec.resetAt < now) {
    HITS.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    rec.count += 1;
    if (rec.count > MAX_PER_WINDOW) {
      return new NextResponse(JSON.stringify({ error: "Rate limited" }), {
        status: 429, headers: { "content-type": "application/json", "retry-after": "60" },
      });
    }
  }

  const res = NextResponse.next();
  // Security headers (OWASP-recommended baseline)
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  return res;
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next|favicon.ico).*)"],
};
