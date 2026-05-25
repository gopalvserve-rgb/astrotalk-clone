import { AdminShell } from "@/components/AdminShell";

export default function AstrologersPage() {
  return (
    <AdminShell title="Astrologers & Pandits">
      <p className="text-white/60">
        Per-tenant astrologer management. (Phase 2: full CRUD form to add a real or AI pandit,
        with AI persona prompt, languages, rates, KYC, payout details.)
      </p>
      <ul className="mt-4 list-disc list-inside text-white/80 text-sm space-y-1">
        <li>Add Human astrologer (KYC + payout account)</li>
        <li>Add AI astrologer / pandit (system prompt + provider choice)</li>
        <li>Toggle online status, set per-min rate (chat/call/video)</li>
        <li>Feature, mark as "Celebrity", deactivate</li>
      </ul>
    </AdminShell>
  );
}
