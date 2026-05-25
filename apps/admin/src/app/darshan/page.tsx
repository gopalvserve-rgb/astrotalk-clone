import { AdminShell } from "@/components/AdminShell";
import { getMasterDb } from "@astrotalk/db";

export default async function DarshanAdminPage() {
  return (
    <AdminShell title="Live Darshan Streams">
      <p className="text-white/60">
        Add temple live streams. Three sources supported:
        <br />• <b>YouTube embed</b> — paste the YouTube live URL
        <br />• <b>RTMP push</b> — give the broadcaster the RTMP key (Phase 6.x: LiveKit)
        <br />• <b>Uploaded video</b> — for non-live recordings
      </p>
      <div className="mt-6 grid md:grid-cols-2 gap-3">
        <form action="/api/darshan/add" method="post" className="card p-5 space-y-3">
          <h3 className="font-semibold">Add YouTube live</h3>
          <input name="title" placeholder="Title" className="input" required />
          <input name="url" placeholder="https://www.youtube.com/embed/…" className="input" required />
          <input name="thumbnailUrl" placeholder="Thumbnail URL (optional)" className="input" />
          <textarea name="description" rows={3} placeholder="Description" className="input" />
          <input type="hidden" name="type" value="youtube" />
          <button className="btn-primary w-full">Add</button>
        </form>
      </div>
    </AdminShell>
  );
}
