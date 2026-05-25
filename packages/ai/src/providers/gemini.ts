import { GoogleGenerativeAI } from "@google/generative-ai";

const client = (override?: string) => {
  const key = override || process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");
  return new GoogleGenerativeAI(key);
};

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";

export async function callGemini(opts: {
  prompt: string;
  modelOverride?: string;
  apiKey?: string;
}): Promise<{ text: string; model: string; raw: unknown }> {
  const modelName = opts.modelOverride || DEFAULT_MODEL;
  const model = client(opts.apiKey).getGenerativeModel({ model: modelName });
  const res = await model.generateContent(opts.prompt);
  return { text: res.response.text(), model: modelName, raw: res };
}

export async function callGeminiVision(opts: {
  prompt: string;
  image: { base64?: string; mimeType?: string; url?: string };
  modelOverride?: string;
  apiKey?: string;
}): Promise<{ text: string; model: string; raw: unknown }> {
  const modelName = opts.modelOverride || DEFAULT_MODEL;
  const model = client(opts.apiKey).getGenerativeModel({ model: modelName });

  let base64 = opts.image.base64;
  if (!base64 && opts.image.url) {
    const resp = await fetch(opts.image.url);
    const buf = Buffer.from(await resp.arrayBuffer());
    base64 = buf.toString("base64");
  }
  if (!base64) throw new Error("Image required for vision call");

  const res = await model.generateContent([
    { text: opts.prompt },
    {
      inlineData: {
        mimeType: opts.image.mimeType || "image/jpeg",
        data: base64,
      },
    },
  ]);
  return { text: res.response.text(), model: modelName, raw: res };
}
