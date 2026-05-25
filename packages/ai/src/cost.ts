/**
 * Rough per-1k-token cost table (USD). Update when providers change pricing.
 * As of May 2026.
 */
export const COSTS = {
  gemini: {
    "gemini-2.0-flash-exp":  { in: 0.000, out: 0.000 },  // free preview
    "gemini-1.5-flash":      { in: 0.075/1000, out: 0.30/1000 },
    "gemini-1.5-pro":        { in: 1.25/1000, out: 5.00/1000 },
  },
  deepseek: {
    "deepseek-chat":     { in: 0.27/1000, out: 1.10/1000 },
    "deepseek-reasoner": { in: 0.55/1000, out: 2.19/1000 },
  },
} as const;

export function estimateCostUsd(provider: "gemini" | "deepseek", model: string, inTokens: number, outTokens: number): number {
  const provModels: any = (COSTS as any)[provider] || {};
  const m = provModels[model] || { in: 0.001, out: 0.002 };  // unknown model fallback
  return (inTokens * m.in) + (outTokens * m.out);
}

/** Rough token estimator when API doesn't return token counts: ~4 chars/token. */
export function estTokens(text: string): number {
  return Math.ceil((text || "").length / 4);
}
