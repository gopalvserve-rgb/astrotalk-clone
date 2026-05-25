import { redirect } from "next/navigation";
import { getAdmin } from "../../lib/admin-auth";
export default async function AdminIndex() {
  const a = await getAdmin();
  redirect(a ? "/admin/tenants" : "/admin/login");
}
