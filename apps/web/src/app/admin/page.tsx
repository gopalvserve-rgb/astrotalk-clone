import { redirect } from "next/navigation";
import { getAdmin } from "../../lib/admin-auth";

export const dynamic = "force-dynamic";
export default async function AdminIndex() {
  const a = await getAdmin();
  redirect(a ? "/admin/tenants" : "/admin/login");
}
