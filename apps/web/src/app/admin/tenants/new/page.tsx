"use client";
import { useState } from "react";

export default function NewTenantWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    slug: "", name: "", primaryDomain: "",
    brandName: "", primaryColor: "#F26B1D", secondaryColor: "#1A1230", accentColor: "#F5C518",
    dbConnString: "",
  });
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState("");

  async function provision() {
    setBusy(true); setMsg("");
    try {
      const r = await fetch("/api/tenants/new", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setMsg(`✔ Tenant created. Visit https://${form.primaryDomain}/ once DNS is set.`);
      setStep(4);
    } catch (e: any) { setMsg("✗ " + e.message); }
    finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="card p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold">New Tenant — White-label Setup</h1>
        <div className="text-white/60 mt-2 text-sm">Step {step} of 4</div>

        {step === 1 && (
          <div className="space-y-3 mt-6">
            <input className="input" placeholder="Slug (lowercase, no spaces)" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
            <input className="input" placeholder="Display name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input className="input" placeholder="Primary domain (e.g. astro.client.com)" value={form.primaryDomain} onChange={e => setForm({...form, primaryDomain: e.target.value})} />
            <button onClick={() => setStep(2)} className="btn-primary">Next</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 mt-6">
            <input className="input" placeholder="Brand name" value={form.brandName} onChange={e => setForm({...form, brandName: e.target.value})} />
            <div className="grid grid-cols-3 gap-3">
              <label className="text-xs"><div className="text-white/60 mb-1">Primary</div><input type="color" value={form.primaryColor} onChange={e => setForm({...form, primaryColor: e.target.value})} /></label>
              <label className="text-xs"><div className="text-white/60 mb-1">Secondary</div><input type="color" value={form.secondaryColor} onChange={e => setForm({...form, secondaryColor: e.target.value})} /></label>
              <label className="text-xs"><div className="text-white/60 mb-1">Accent</div><input type="color" value={form.accentColor} onChange={e => setForm({...form, accentColor: e.target.value})} /></label>
            </div>
            <button onClick={() => setStep(3)} className="btn-primary">Next</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 mt-6">
            <p className="text-white/60 text-sm">Provide a Postgres connection string for this tenant's database.
              Leave blank to auto-generate one based on env <code>TENANT_DATABASE_URL_TEMPLATE</code>.</p>
            <input className="input" placeholder="postgresql://… (optional)" value={form.dbConnString} onChange={e => setForm({...form, dbConnString: e.target.value})} />
            <button onClick={provision} disabled={busy} className="btn-primary">{busy ? "Provisioning…" : "Provision tenant"}</button>
          </div>
        )}

        {msg && <div className="mt-6 text-white/80">{msg}</div>}
      </div>
    </main>
  );
}
