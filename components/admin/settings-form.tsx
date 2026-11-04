"use client";

import { useActionState } from "react";
import { Building2, CreditCard, MapPinned, Share2 } from "lucide-react";
import { saveSettingsAction, type AdminFormState } from "@/app/actions/admin";
import type { BusinessSettings } from "@/lib/types";
import { Field, FormAlert, SubmitButton } from "./form-parts";

const initial: AdminFormState = { ok: false };

export function SettingsForm({ settings }: { settings: BusinessSettings }) {
  const [state, formAction] = useActionState(saveSettingsAction, initial);

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? <FormAlert message={state.message} ok={state.ok} /> : null}

      <section className="card-surface p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-full bg-cream-100 text-gold-500">
            <Building2 className="size-4" />
          </span>
          <h3 className="font-display text-xl text-chocolate">Business details</h3>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field
            label="Business name"
            htmlFor="businessName"
            required
            error={state.errors?.businessName}
          >
            <input
              id="businessName"
              name="businessName"
              className="field"
              defaultValue={settings.business_name}
              maxLength={100}
            />
          </Field>
          <Field label="Tagline" htmlFor="tagline" error={state.errors?.tagline}>
            <input
              id="tagline"
              name="tagline"
              className="field"
              defaultValue={settings.tagline ?? ""}
              maxLength={160}
            />
          </Field>
          <Field
            label="Street address"
            htmlFor="address"
            required
            error={state.errors?.address}
            className="sm:col-span-2"
          >
            <textarea
              id="address"
              name="address"
              className="field min-h-20 resize-y"
              defaultValue={settings.address}
              maxLength={300}
            />
          </Field>
          <Field label="Phone number" htmlFor="phone" required error={state.errors?.phone}>
            <input
              id="phone"
              name="phone"
              className="field"
              defaultValue={settings.phone}
              maxLength={30}
            />
          </Field>
          <Field
            label="WhatsApp number"
            htmlFor="whatsapp"
            required
            error={state.errors?.whatsapp}
          >
            <input
              id="whatsapp"
              name="whatsapp"
              className="field"
              defaultValue={settings.whatsapp}
              maxLength={30}
            />
          </Field>
          <Field label="Email address" htmlFor="email" required error={state.errors?.email}>
            <input
              id="email"
              name="email"
              type="email"
              className="field"
              defaultValue={settings.email}
              maxLength={120}
            />
          </Field>
          <Field label="Opening hours" htmlFor="openingHours" error={state.errors?.openingHours}>
            <input
              id="openingHours"
              name="openingHours"
              className="field"
              defaultValue={settings.opening_hours ?? ""}
              maxLength={160}
            />
          </Field>
          <Field
            label="Announcement bar text"
            htmlFor="announcement"
            error={state.errors?.announcement}
            hint="Shown across the top of the public website. Leave blank to hide."
            className="sm:col-span-2"
          >
            <input
              id="announcement"
              name="announcement"
              className="field"
              defaultValue={settings.announcement ?? ""}
              maxLength={240}
            />
          </Field>
        </div>
      </section>

      <section className="card-surface p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-full bg-cream-100 text-gold-500">
            <CreditCard className="size-4" />
          </span>
          <h3 className="font-display text-xl text-chocolate">Orders & pricing</h3>
        </div>
        <p className="mt-1 text-[11px] leading-5 text-chocolate/45">
          Profit estimates are private. They are never shown to customers.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field
            label="Delivery charge (PKR)"
            htmlFor="deliveryCharge"
            error={state.errors?.deliveryCharge}
          >
            <input
              id="deliveryCharge"
              name="deliveryCharge"
              type="number"
              min="0"
              step="1"
              className="field"
              defaultValue={settings.delivery_charge}
            />
          </Field>
          <Field
            label="Free delivery over (PKR)"
            htmlFor="freeDeliveryThreshold"
            error={state.errors?.freeDeliveryThreshold}
            hint="Use 0 to disable free delivery."
          >
            <input
              id="freeDeliveryThreshold"
              name="freeDeliveryThreshold"
              type="number"
              min="0"
              step="1"
              className="field"
              defaultValue={settings.free_delivery_threshold}
            />
          </Field>
          <Field
            label="Minimum order (PKR)"
            htmlFor="minimumOrder"
            error={state.errors?.minimumOrder}
          >
            <input
              id="minimumOrder"
              name="minimumOrder"
              type="number"
              min="0"
              step="1"
              className="field"
              defaultValue={settings.minimum_order}
            />
          </Field>
          <Field
            label="Estimated profit per pound (PKR)"
            htmlFor="profitPerPound"
            error={state.errors?.profitPerPound}
            hint="Used for admin reporting only."
          >
            <input
              id="profitPerPound"
              name="profitPerPound"
              type="number"
              min="0"
              step="1"
              className="field"
              defaultValue={settings.profit_per_pound}
            />
          </Field>
          <Field
            label="Payment methods"
            htmlFor="paymentMethods"
            required
            error={state.errors?.paymentMethods}
            hint="One method per line."
            className="sm:col-span-2"
          >
            <textarea
              id="paymentMethods"
              name="paymentMethods"
              className="field min-h-24 resize-y"
              defaultValue={settings.payment_methods.join("\n")}
            />
          </Field>
        </div>
      </section>

      <section className="card-surface p-5 sm:p-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-full bg-cream-100 text-gold-500">
            <MapPinned className="size-4" />
          </span>
          <h3 className="font-display text-xl text-chocolate">Map & social links</h3>
        </div>

        <div className="mt-5 grid gap-4">
          <Field
            label="Google Maps embed URL"
            htmlFor="mapEmbedUrl"
            error={state.errors?.mapEmbedUrl}
            hint="Use the src value from a Google Maps embed iframe."
          >
            <input
              id="mapEmbedUrl"
              name="mapEmbedUrl"
              className="field"
              defaultValue={settings.map_embed_url ?? ""}
              maxLength={1000}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Instagram URL"
              htmlFor="instagramUrl"
              error={state.errors?.instagramUrl}
            >
              <input
                id="instagramUrl"
                name="instagramUrl"
                type="url"
                className="field"
                defaultValue={settings.instagram_url ?? ""}
                maxLength={300}
              />
            </Field>
            <Field
              label="Facebook URL"
              htmlFor="facebookUrl"
              error={state.errors?.facebookUrl}
            >
              <input
                id="facebookUrl"
                name="facebookUrl"
                type="url"
                className="field"
                defaultValue={settings.facebook_url ?? ""}
                maxLength={300}
              />
            </Field>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton label="Save settings" pendingLabel="Saving settings…" />
        <p className="flex items-center gap-1.5 text-[10px] text-chocolate/40">
          <Share2 className="size-3.5" />
          Changes update the public website immediately.
        </p>
      </div>
    </form>
  );
}
