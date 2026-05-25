/**
 * AI Router — picks the right provider for each task.
 *
 * Routing decisions (set once, in PROVIDER_MAP):
 *   • Vision tasks (face/palm reading, multimodal) → Gemini
 *   • Long-form reasoning (kundali, numerology, vastu, tarot narrative) → DeepSeek
 *   • Latency-sensitive chat fallback → Gemini Flash
 *
 * One entry point: ai.complete({ task, input, ... }).
 * Switching providers is a one-line config change per tenant.
 */

import { callGemini, callGeminiVision } from "./providers/gemini";
import { callDeepSeek } from "./providers/deepseek";
import { PROMPTS, type PromptTask } from "./prompts";
import { estimateCostUsd, estTokens } from "./cost";

export type AiProvider = "gemini" | "deepseek";

const PROVIDER_MAP: Record<PromptTask, AiProvider> = {
  kundali_reading:     "deepseek",
  numerology_report:   "deepseek",
  vastu_consult:       "deepseek",
  tarot_reading:       "deepseek",
  business_name:       "gemini",
  baby_name:           "gemini",
  face_reading:        "gemini",
  palm_reading:        "gemini",
  horoscope_daily:     "deepseek",
  compatibility:       "deepseek",
  match_making:        "deepseek",
  chat_fallback:       "gemini",
  voice_assist:        "gemini",
};

export interface CompleteArgs {
  task: PromptTask;
  /** structured input data — merged into the prompt */
  input: Record<string, unknown>;
  /** optional image (base64 or URL) for vision tasks */
  image?: { base64?: string; mimeType?: string; url?: string };
  /** override the routed provider */
  forceProvider?: AiProvider;
  /** tenant-level config (e.g. per-tenant model override) */
  tenantConfig?: { provider?: AiProvider; model?: string; apiKey?: string };
  userId?: string;
  language?: string;
}

export interface CompleteResult {
  provider: AiProvider;
  model: string;
  text: string;
  raw?: unknown;
  durationMs: number;
  costUsd?: number;
}

export async function complete(args: CompleteArgs): Promise<CompleteResult> {
  const provider =
    args.forceProvider ??
    args.tenantConfig?.provider ??
    PROVIDER_MAP[args.task];

  const prompt = PROMPTS[args.task](args.input, args.language ?? "en");

  const start = Date.now();
  let text: string;
  let model: string;
  let raw: unknown;

  if (provider === "gemini") {
    if (args.image) {
      ({ text, model, raw } = await callGeminiVision({
        prompt, image: args.image,
        modelOverride: args.tenantConfig?.model,
        apiKey: args.tenantConfig?.apiKey,
      }));
    } else {
      ({ text, model, raw } = await callGemini({
        prompt, modelOverride: args.tenantConfig?.model,
        apiKey: args.tenantConfig?.apiKey,
      }));
    }
  } else {
    ({ text, model, raw } = await callDeepSeek({
      prompt, modelOverride: args.tenantConfig?.model,
      apiKey: args.tenantConfig?.apiKey,
    }));
  }

  const costUsd = estimateCostUsd(provider, model, estTokens(prompt), estTokens(text));
  return { provider, model, text, raw, durationMs: Date.now() - start, costUsd };
}

export const ai = { complete };
