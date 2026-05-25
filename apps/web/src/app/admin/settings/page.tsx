import { AdminShell } from "../../../components/admin/AdminShell";
export default function SettingsPage() {
  return (
    <AdminShell title="Settings">
      <p className="text-white/60">Per-tenant theme + brand customization (Phase 1 stores values in the master DB
        TenantTheme table; admin form for editing coming up in Phase 2).</p>
      <ul className="mt-4 list-disc list-inside text-white/80 text-sm space-y-1">
        <li>Brand name</li><li>Logo + favicon upload</li>
        <li>Primary / secondary / accent colours</li>
        <li>Custom CSS (advanced)</li>
        <li>Cashfree credentials (per-tenant)</li>
        <li>AI provider preference (Gemini / DeepSeek default)</li>
      </ul>
    </AdminShell>
  );
}
