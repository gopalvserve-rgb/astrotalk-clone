import { AdminShell } from "../../components/AdminShell";

export default function ArticlesPage() {
  return (
    <AdminShell title="Articles / Blog / Horoscopes">
      <p className="text-white/60">
        Per-tenant article CMS. Categories: blog, horoscope (daily/weekly/monthly/yearly per sign),
        astrology, numerology, vastu.
      </p>
      <p className="text-white/60 mt-3">
        Daily horoscopes auto-generate at 00:05 IST via cron — run:<br />
        <code className="text-amber-300">node --loader tsx apps/web/src/jobs/horoscope-daily.ts</code>
      </p>
      <ul className="mt-4 list-disc list-inside text-white/80 text-sm space-y-1">
        <li>Markdown editor with image upload</li>
        <li>Publish / unpublish / schedule</li>
        <li>SEO meta + slug + OG image</li>
        <li>Override AI-generated horoscope per-sign per-day</li>
      </ul>
    </AdminShell>
  );
}
