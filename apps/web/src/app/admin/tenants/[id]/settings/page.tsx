import { AdminShell } from "../../../../../components/admin/AdminShell";
import { tenantCredentials } from "../../../../../lib/admin-credentials";
import { revalidatePath } from "next/cache";
import { getMasterDb } from "@astrotalk/db";
import { CREDENTIAL_KEYS } from "@astrotalk/shared";


export const dynamic = "force-dynamic";
export default async function TenantSettings({ params }: { params: { id: string } }) {
  const db = getMasterDb();
  const tenant = await db.tenant.findUniqueOrThrow({ where: { id: params.id } });
  const creds = tenantCredentials(tenant.id);
  const list = await creds.list();

  async function save(formData: FormData) {
    "use server";
    const creds = tenantCredentials(params.id);
    for (const k of CREDENTIAL_KEYS) {
      const v = formData.get(k);
      if (typeof v === "string" && v && !v.startsWith("•••")) {
        await creds.set(k, v);
      }
    }
    revalidatePath(`/tenants/${params.id}/settings`);
  }

  const LABELS: Record<string, { label: string; help: string; href?: string }> = {
    gemini_api_key:          { label: "Google Gemini API Key",   help: "Used for face/palm reading + AI horoscopes", href: "https://aistudio.google.com/apikey" },
    deepseek_api_key:        { label: "DeepSeek API Key",        help: "Used for kundali, numerology, vastu, tarot reports", href: "https://platform.deepseek.com" },
    cashfree_app_id:         { label: "Cashfree App ID",         help: "Wallet recharge + product checkout",  href: "https://merchant.cashfree.com" },
    cashfree_secret_key:     { label: "Cashfree Secret Key",     help: "Pair with App ID above" },
    cashfree_webhook_secret: { label: "Cashfree Webhook Secret", help: "Signs the payment webhook (HMAC)" },
    msg91_auth_key:          { label: "MSG91 Auth Key",          help: "Sends SMS OTP to users on sign-in",   href: "https://control.msg91.com" },
    agora_app_id:            { label: "Agora App ID",            help: "Voice + video calls with astrologers",href: "https://console.agora.io" },
    agora_app_certificate:   { label: "Agora App Certificate",   help: "Pairs with Agora App ID" },
  };

  return (
    <AdminShell title={`${tenant.name} — API Keys & Credentials`}>
      <p className="text-white/60">
        These keys are encrypted at rest and used at runtime by the AI router, payment processor and SMS sender.
        Leave blank to use the platform default (env var).
      </p>

      <form action={save} className="mt-6 space-y-4 max-w-3xl">
        {list.map(item => {
          const meta = LABELS[item.key];
          return (
            <div key={item.key} className="card p-4">
              <div className="flex items-baseline justify-between">
                <label className="font-semibold">{meta?.label || item.key}</label>
                <span className={`text-xs ${item.hasValue ? "text-green-300" : "text-amber-300"}`}>
                  {item.hasValue ? `✓ set (${item.preview})` : "○ not set"}
                </span>
              </div>
              <p className="text-white/50 text-xs mt-1">
                {meta?.help}
                {meta?.href && <> · <a className="underline" target="_blank" rel="noopener" href={meta.href}>get key →</a></>}
              </p>
              <input name={item.key} type="password" autoComplete="off"
                placeholder={item.hasValue ? `••••••••${item.preview.slice(-4)}` : "Paste key here"}
                className="input mt-3" />
            </div>
          );
        })}
        <button className="btn-primary">Save Credentials</button>
      </form>
    </AdminShell>
  );
}
