import type { Metadata } from "next";
import { ConfirmationClient } from "@/components/checkout/ConfirmationClient";

export const metadata: Metadata = {
  title: "Commande confirmée",
  robots: { index: false, follow: false },
};

export default function ConfirmationPage() {
  return <ConfirmationClient />;
}
