// Phase-1 in-memory OTP store. Production should use Redis with TTL.
export const OTP_STORE = new Map<string, { code: string; exp: number }>();
