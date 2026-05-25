import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const BASE = Constants.expoConfig?.extra?.apiBase ?? "https://demo.astrotalk-clone.com";

export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = await SecureStore.getItemAsync("astrotalk_session").catch(() => null);
  const r = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
  return data;
}

export const auth = {
  sendOtp: (phone: string) => api("/api/auth/send-otp", { method: "POST", body: JSON.stringify({ phone }) }),
  verifyOtp: (phone: string, otp: string) => api("/api/auth/verify-otp", { method: "POST", body: JSON.stringify({ phone, otp }) }),
};

export const ai = {
  call: (task: string, input: any, image?: any) => api("/api/ai", { method: "POST", body: JSON.stringify({ task, input, image }) }),
};

export const wallet = {
  balance: () => api("/api/wallet/balance"),
  recharge: (amount: number) => api("/api/wallet/recharge", { method: "POST", body: JSON.stringify({ amount }) }),
};
