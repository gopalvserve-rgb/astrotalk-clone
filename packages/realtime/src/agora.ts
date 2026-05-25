/**
 * Agora token generator for voice + video calls.
 * Production: install `agora-token` and uncomment the import.
 */
import crypto from "node:crypto";

const VERSION = "007";
const TOKEN_EXPIRE_SECONDS = 3600;

/**
 * Minimal Agora-compatible token format suitable for development.
 * For production use install the official `agora-token` package and
 * call `RtcTokenBuilder.buildTokenWithUid()` instead.
 */
export function buildAgoraToken(channel: string, uid: number, role: "publisher" | "subscriber" = "publisher"): {
  appId: string; token: string; channel: string; uid: number; expiresAt: number;
} {
  const appId = process.env.AGORA_APP_ID || "";
  const cert  = process.env.AGORA_APP_CERTIFICATE || "";
  if (!appId || !cert) throw new Error("Agora credentials missing");

  const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_EXPIRE_SECONDS;
  const message = `${appId}${channel}${uid}${role}${expiresAt}`;
  const token = VERSION + crypto.createHmac("sha256", cert).update(message).digest("hex");

  return { appId, token, channel, uid, expiresAt };
}
