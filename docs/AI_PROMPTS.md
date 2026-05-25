# AI Prompts — Library Reference

All prompts live in `packages/ai/src/prompts.ts`.

## Why DeepSeek for reasoning and Gemini for vision?

After comparing the two for astrology/numerology/vastu workloads:

| Dimension | DeepSeek v3 | Gemini 2.0 Flash |
|---|---|---|
| Long-form Vedic reasoning | **Strong** — captures dasha + yoga interplay | Good but shorter outputs |
| Numerological math | **Strong** — explicit calculation steps | Acceptable |
| Cultural/Sanskrit terminology | **Strong** | Good |
| Latency | Slower (8–15s for big prompts) | **Faster** (1–4s) |
| Cost per million tokens | **Cheap** (~$0.27 in / $1.10 out) | Cheap (free tier generous) |
| Vision (image input) | ❌ | **Yes** (multimodal) |
| Voice (Live API) | ❌ | **Yes** |

So:
- Use **Gemini** when there is an image (face / palm / OCR), or when latency
  matters more than depth (chat fallback, voice).
- Use **DeepSeek** for long-form reasoning (kundali, numerology, vastu, tarot).

## How to override the default routing

Per-task, per-tenant — store in `tenant_settings`:
- key `ai_provider_<task>` → value `"gemini"` or `"deepseek"`
- key `ai_model_<task>`    → value the model name string

The router reads these via `tenantConfig` arg.

## Prompt customisation

Each tenant can override prompts (for brand voice, language preferences) by
adding rows in `tenant_settings` with key `ai_prompt_<task>`. If present,
the router substitutes that string instead of the default `PROMPTS[task]`.
(Implement in Phase 3.)

## Safety guidelines

- All prompts include "Be kind, avoid fear-mongering, avoid medical claims, no
  prediction of death/disease".
- We log the input + output to `ai_reports` for audit.
- Daily per-user cap enforced at the route layer.
