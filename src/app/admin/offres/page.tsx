import { cookies } from "next/headers";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminNotConfigured } from "@/components/admin/AdminNotConfigured";
import { AdminOffers } from "@/components/admin/AdminOffers";
import { adminConfig, SESSION_COOKIE, verifySessionToken } from "@/lib/server/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminOffersPage() {
  const config = adminConfig();
  if (!config.ok) return <AdminNotConfigured reason={config.reason} />;

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token, config.password) ? <AdminOffers /> : <AdminLogin />;
}
