"use client";

import { updateOrderAction } from "@/app/actions/admin";
import { ORDER_STATUSES } from "@/lib/constants";
import type { OrderStatus, PaymentStatus } from "@/lib/types";
import { Field, SubmitButton } from "./form-parts";

const PAYMENT_STATUSES: Array<{ value: PaymentStatus; label: string }> = [
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
];

export function OrderStatusForm({
  id,
  status,
  paymentStatus,
  internalNotes,
}: {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  internalNotes: string | null;
}) {
  return (
    <form action={updateOrderAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Order status" htmlFor="status">
          <select id="status" name="status" className="field" defaultValue={status}>
            {ORDER_STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Payment status" htmlFor="paymentStatus">
          <select
            id="paymentStatus"
            name="paymentStatus"
            className="field"
            defaultValue={paymentStatus}
          >
            {PAYMENT_STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field
        label="Internal notes"
        htmlFor="internalNotes"
        hint="Only visible to administrators. Never shown to customers."
      >
        <textarea
          id="internalNotes"
          name="internalNotes"
          className="field min-h-24 resize-y"
          defaultValue={internalNotes ?? ""}
          maxLength={3000}
          placeholder="Bakery notes, special handling, balance due…"
        />
      </Field>
      <SubmitButton label="Update order" pendingLabel="Updating…" className="w-full sm:w-auto" />
    </form>
  );
}
