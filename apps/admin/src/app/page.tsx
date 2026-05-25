import { redirect } from "next/navigation";
import { getAdmin } from "../lib/auth";
export default async function Index() {
  const a = await getAdmin();
  redirect(a ? "/tenants" : "/login");
}
