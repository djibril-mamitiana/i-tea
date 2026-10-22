import { Bike } from "lucide-react";
import { activePayments, site } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { ModeToggle } from "../cart/ModeToggle";
import { OpenStatus } from "../OpenStatus";

/** Accès direct aux infos de retrait / livraison, sous le hero. */
export function ServiceStrip() {
  const { delivery } = site.ordering;
  const payment = activePayments()[0];
  return (
    <div className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
        <ModeToggle />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <OpenStatus />
          {delivery.enabled && delivery.freeFrom !== null && (
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <Bike size={18} aria-hidden="true" />
              Livraison offerte dès {formatPrice(delivery.freeFrom)}
            </span>
          )}
          {payment && <span className="hidden text-sm font-semibold text-muted md:inline">{payment.label}</span>}
        </div>
      </div>
    </div>
  );
}
