"use client";
import { useState } from "react";

export default function SignInPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function sendOtp() {
    setBusy(true); setMsg("");
    try {
      const r = await fetch("/api/auth/send-otp", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!r.ok) throw new Error((await r.json()).error || "Failed");
      setStep("otp"); setMsg("OTP sent.");
    } catch (e: any) { setMsg(e.message); }
    finally { setBusy(false); }
  }

  async function verifyOtp() {
    setBusy(true); setMsg("");
    try {
      const r = await fetch("/api/auth/verify-otp", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed");
      window.location.href = "/dashboard";
    } catch (e: any) { setMsg(e.message); }
    finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white/5 border border-white/10 p-8">
        <h1 className="font-display text-3xl font-bold text-white">Sign in</h1>
        <p className="text-white/60 mt-1 text-sm">Enter your phone, we'll send a 6-digit OTP.</p>

        {step === "phone" ? (
          <>
            <label className="block text-sm text-white/70 mt-6">Phone number</label>
            <input
              value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98XXXXXX"
              className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 text-white px-4 py-3"
            />
            <button onClick={sendOtp} disabled={busy || !phone} className="btn-primary mt-4 w-full">
              {busy ? "Sending…" : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <label className="block text-sm text-white/70 mt-6">Enter OTP</label>
            <input
              value={otp} onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit OTP" maxLength={6}
              className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 text-white px-4 py-3 tracking-widest text-center text-lg"
            />
            <button onClick={verifyOtp} disabled={busy || otp.length < 4} className="btn-primary mt-4 w-full">
              {busy ? "Verifying…" : "Verify & Sign in"}
            </button>
            <button onClick={() => setStep("phone")} className="text-white/60 text-xs mt-3 underline">
              Use different number
            </button>
          </>
        )}

        {msg && <div className="mt-4 text-sm text-white/70">{msg}</div>}
      </div>
    </main>
  );
}
