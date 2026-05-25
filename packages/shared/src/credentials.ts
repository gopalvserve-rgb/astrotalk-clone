/**
 * Per-tenant credential resolver.
 * Order: tenant_settings → env var → default
 * Used by AI router + Cashfree wrapper at runtime.
 */
import crypto from "node:crypto";

const ENCRYPTION_KEY = (process.env.CREDS_ENCRYPTION_KEY || "default-32-char-key-replace-me!!").padEnd(32, "0").slice(0, 32);

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(ENCRYPTION_KEY), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}
export function decryptSecret(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("enc:")) return value; // backward-compat: plaintext
  try {
    const [, iv, tag, ct] = value.split(":");
    const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(ENCRYPTION_KEY),
      Buffer.from(iv!, "base64"));
    decipher.setAuthTag(Buffer.from(tag!, "base64"));
    const dec = Buffer.concat([decipher.update(Buffer.from(ct!, "base64")), decipher.final()]);
    return dec.toString("utf8");
  } catch { return null; }
}

export const CREDENTIAL_KEYS = [
  "gemini_api_key",
  "deepseek_api_key",
  "cashfree_app_id",
  "cashfree_secret_key",
  "cashfree_webhook_secret",
  "msg91_auth_key",
  "agora_app_id",
  "agora_app_certificate",
] as const;
export type CredentialKey = (typeof CREDENTIAL_KEYS)[number];

export const ENV_FALLBACK: Record<CredentialKey, string> = {
  gemini_api_key:          "GEMINI_API_KEY",
  deepseek_api_key:        "DEEPSEEK_API_KEY",
  cashfree_app_id:         "CASHFREE_APP_ID",
  cashfree_secret_key:     "CASHFREE_SECRET_KEY",
  cashfree_webhook_secret: "CASHFREE_WEBHOOK_SECRET",
  msg91_auth_key:          "MSG91_AUTH_KEY",
  agora_app_id:            "AGORA_APP_ID",
  agora_app_certificate:   "AGORA_APP_CERTIFICATE",
};

export interface CredentialResolver {
  get(key: CredentialKey): Promise<string | null>;
  set(key: CredentialKey, value: string): Promise<void>;
  list(): Promise<Array<{ key: CredentialKey; hasValue: boolean; preview: string }>>;
}

/**
 * Build a credential resolver bound to a tenant.
 * Pass in a function that reads/writes the master DB's tenant_settings table.
 */
export function makeCredentialResolver(io: {
  read:  (key: string) => Promise<string | null>;
  write: (key: string, value: string) => Promise<void>;
}): CredentialResolver {
  return {
    async get(key) {
      const stored = await io.read(`creds.${key}`);
      const decrypted = decryptSecret(stored);
      if (decrypted) return decrypted;
      const envName = ENV_FALLBACK[key];
      return process.env[envName] || null;
    },
    async set(key, value) {
      const trimmed = (value ?? "").trim();
      if (!trimmed) return;
      await io.write(`creds.${key}`, encryptSecret(trimmed));
    },
    async list() {
      const out: Array<{ key: CredentialKey; hasValue: boolean; preview: string }> = [];
      for (const k of CREDENTIAL_KEYS) {
        const stored = await io.read(`creds.${k}`);
        const decrypted = decryptSecret(stored);
        const env = process.env[ENV_FALLBACK[k]];
        const v = decrypted || env || "";
        out.push({
          key: k,
          hasValue: !!v,
          preview: v ? `${v.slice(0, 4)}…${v.slice(-4)}` : "(not set)",
        });
      }
      return out;
    },
  };
}
