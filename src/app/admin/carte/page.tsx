import { cookies } from "next/headers";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminMenu } from "@/components/admin/AdminMenu";
import { AdminNotConfigured } from "@/components/admin/AdminNotConfigured";
import { adminConfig, SESSION_COOKIE, verifySessionToken } from "@/lib/server/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const config = adminConfig();
  if (!config.ok) return <AdminNotConfigured reason={config.reason} />;

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token, config.password) ? <AdminMenu /> : <AdminLogin />;
}
