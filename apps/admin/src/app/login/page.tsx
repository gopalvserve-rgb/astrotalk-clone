"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      const r = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }) });
      if (!r.ok) throw new Error((await r.json()).error || "Failed");
      window.location.href = "/tenants";
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }
  return (
    <main className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="card p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold">Admin sign-in</h1>
        <p className="text-white/60 text-sm mt-1">Super admin or tenant admin.</p>
        <label className="block mt-6 text-sm">Email</label>
        <input className="input mt-1" value={email} onChange={e=>setEmail(e.target.value)} />
        <label className="block mt-4 text-sm">Password</label>
        <input className="input mt-1" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={busy} className="btn-primary mt-6 w-full">{busy?"Signing in…":"Sign in"}</button>
        {err && <div className="mt-3 text-red-300 text-sm">{err}</div>}
      </form>
    </main>
  );
}
