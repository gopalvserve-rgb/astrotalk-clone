import { AdminShell } from "@/components/AdminShell";
import { getMasterDb } from "@astrotalk/db";
import { revalidatePath } from "next/cache";

export default async function ThemeBuilder({ params }: { params: { id: string } }) {
  const db = getMasterDb();
  const t = await db.tenant.findUniqueOrThrow({ where: { id: params.id }, include: { theme: true } });

  async function save(formData: FormData) {
    "use server";
    await getMasterDb().tenantTheme.upsert({
      where: { tenantId: t.id },
      update: {
        brandName: String(formData.get("brandName") || ""),
        logoUrl:    (formData.get("logoUrl") as string) || null,
        faviconUrl: (formData.get("faviconUrl") as string) || null,
        primaryColor:   String(formData.get("primaryColor")  || "#F26B1D"),
        secondaryColor: String(formData.get("secondaryColor")|| "#1A1230"),
        accentColor:    String(formData.get("accentColor")   || "#F5C518"),
        fontFamily: String(formData.get("fontFamily") || "Inter"),
        customCss:  (formData.get("customCss") as string) || null,
      },
      create: { tenantId: t.id, brandName: String(formData.get("brandName") || ""),
        primaryColor: String(formData.get("primaryColor") || "#F26B1D"),
        secondaryColor: String(formData.get("secondaryColor") || "#1A1230"),
        accentColor: String(formData.get("accentColor") || "#F5C518") },
    });
    revalidatePath(`/tenants/${t.id}/theme`);
  }

  return (
    <AdminShell title={`${t.name} — Theme`}>
      <form action={save} className="card p-6 grid md:grid-cols-2 gap-3 max-w-2xl">
        <Field label="Brand name"     name="brandName"     defaultValue={t.theme?.brandName || ""} />
        <Field label="Logo URL"       name="logoUrl"       defaultValue={t.theme?.logoUrl || ""} />
        <Field label="Favicon URL"    name="faviconUrl"    defaultValue={t.theme?.faviconUrl || ""} />
        <Field label="Font family"    name="fontFamily"    defaultValue={t.theme?.fontFamily || "Inter"} />
        <Color label="Primary"   name="primaryColor"   defaultValue={t.theme?.primaryColor   || "#F26B1D"} />
        <Color label="Secondary" name="secondaryColor" defaultValue={t.theme?.secondaryColor || "#1A1230"} />
        <Color label="Accent"    name="accentColor"    defaultValue={t.theme?.accentColor    || "#F5C518"} />
        <label className="md:col-span-2">
          <div className="text-xs text-white/60 mb-1">Custom CSS (advanced)</div>
          <textarea name="customCss" rows={6} defaultValue={t.theme?.customCss || ""} className="input font-mono text-xs" />
        </label>
        <button className="btn-primary md:col-span-2">Save Theme</button>
      </form>
    </AdminShell>
  );
}

function Field({ label, name, defaultValue }: any) {
  return <label className="block"><div className="text-xs text-white/60 mb-1">{label}</div><input name={name} defaultValue={defaultValue} className="input" /></label>;
}
function Color({ label, name, defaultValue }: any) {
  return <label className="block"><div className="text-xs text-white/60 mb-1">{label}</div><input type="color" name={name} defaultValue={defaultValue} className="h-10 w-full bg-transparent border border-white/10 rounded" /></label>;
}
