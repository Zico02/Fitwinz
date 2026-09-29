"use client";

import { useState } from "react";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/admin/labels";

const input = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black";

/** Status select; choosing "cancelled" reveals the optional customer email + reason. */
export default function OrderStatusFields({
  current,
  disabled,
  hasCustomerEmail,
  cancelledEmailSent,
}: {
  current: OrderStatus;
  disabled: boolean;
  hasCustomerEmail: boolean;
  cancelledEmailSent: boolean;
}) {
  const [status, setStatus] = useState<OrderStatus>(current);
  const cancelling = status === "cancelled" && current !== "cancelled";

  return (
    <>
      <select
        name="status"
        value={status}
        onChange={(e) => setStatus(e.target.value as OrderStatus)}
        className={input}
        disabled={disabled}
        aria-label="Status"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {cancelling && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
          {hasCustomerEmail && !cancelledEmailSent ? (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="notifyCancelled" className="w-4 h-4" />
              Email the customer
            </label>
          ) : (
            <p className="text-xs text-gray-500">
              {cancelledEmailSent
                ? "A cancellation email was already sent for this order."
                : "No email: the customer did not give an email address."}
            </p>
          )}
          <textarea
            name="cancellationReason"
            rows={2}
            maxLength={500}
            placeholder="Reason (optional, included in the email)"
            className={input}
          />
        </div>
      )}
    </>
  );
}
