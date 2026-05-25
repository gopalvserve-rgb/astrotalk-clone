/**
 * DeepSeek API client — uses the OpenAI-compatible chat completions endpoint.
 */

const DEFAULT_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const BASE_URL = "https://api.deepseek.com/v1";

export async function callDeepSeek(opts: {
  prompt: string;
  modelOverride?: string;
  systemPrompt?: string;
}): Promise<{ text: string; model: string; raw: unknown }> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("DEEPSEEK_API_KEY not set");

  const model = opts.modelOverride || DEFAULT_MODEL;
  const messages: Array<{ role: string; content: string }> = [];
  if (opts.systemPrompt) messages.push({ role: "system", content: opts.systemPrompt });
  messages.push({ role: "user", content: opts.prompt });

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model, messages, temperature: 0.7, max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepSeek API ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return { text: data.choices[0]?.message?.content ?? "", model, raw: data };
}
