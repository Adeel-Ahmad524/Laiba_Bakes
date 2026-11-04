"use client";

/* eslint-disable @next/next/no-img-element */

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { ImagePlus, Tag, X } from "lucide-react";
import { saveDealAction, type AdminFormState } from "@/app/actions/admin";
import type { Deal } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { Field, FormAlert, SubmitButton, ToggleRow } from "./form-parts";

const initial: AdminFormState = { ok: false };

function dateInput(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function DealForm({ deal }: { deal?: Deal | null }) {
  const [state, formAction] = useActionState(saveDealAction, initial);
  const [title, setTitle] = useState(deal?.title ?? "");
  const [slug, setSlug] = useState(deal?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(deal?.slug));
  const [discountType, setDiscountType] = useState(deal?.discount_type ?? "percentage");
  const [preview, setPreview] = useState<string | null>(deal?.image_url ?? null);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
      <input type="hidden" name="id" value={deal?.id ?? ""} />

      <div className="space-y-6">
        {state.message ? <FormAlert message={state.message} ok={state.ok} /> : null}

        <section className="card-surface p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-cream-100 text-gold-500">
              <Tag className="size-4" />
            </span>
            <h3 className="font-display text-xl text-chocolate">Offer details</h3>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Offer title" htmlFor="title" required error={state.errors?.title}>
              <input
                id="title"
                name="title"
                className="field"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={100}
                placeholder="e.g. Weekend treat — 10% off"
              />
            </Field>
            <Field label="URL slug" htmlFor="slug" required error={state.errors?.slug}>
              <input
                id="slug"
                name="slug"
                className="field"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(event.target.value);
                }}
                maxLength={120}
                placeholder="weekend-treat"
              />
            </Field>
            <Field
              label="Coupon code"
              htmlFor="code"
              error={state.errors?.code}
              hint="Optional. Customers enter this at checkout."
            >
              <input
                id="code"
                name="code"
                className="field uppercase"
                defaultValue={deal?.code ?? ""}
                maxLength={30}
                placeholder="WEEKEND10"
              />
            </Field>
            <Field label="Discount type" htmlFor="discountType" error={state.errors?.discountType}>
              <select
                id="discountType"
                name="discountType"
                className="field"
                value={discountType}
                onChange={(event) =>
                  setDiscountType(event.target.value as "percentage" | "fixed")
                }
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount (PKR)</option>
              </select>
            </Field>
            <Field
              label={discountType === "percentage" ? "Discount (%)" : "Discount (PKR)"}
              htmlFor="discountValue"
              required
              error={state.errors?.discountValue}
            >
              <input
                id="discountValue"
                name="discountValue"
                type="number"
                min="0"
                max={discountType === "percentage" ? 100 : undefined}
                step="1"
                className="field"
                defaultValue={deal?.discount_value ?? ""}
                placeholder={discountType === "percentage" ? "10" : "200"}
              />
            </Field>
            <Field
              label="Minimum order (PKR)"
              htmlFor="minimumOrder"
              error={state.errors?.minimumOrder}
              hint="Use 0 for no minimum."
            >
              <input
                id="minimumOrder"
                name="minimumOrder"
                type="number"
                min="0"
                step="1"
                className="field"
                defaultValue={deal?.minimum_order ?? 0}
              />
            </Field>
            <Field label="Starts on" htmlFor="startsAt" error={state.errors?.startsAt}>
              <input
                id="startsAt"
                name="startsAt"
                type="date"
                className="field"
                defaultValue={dateInput(deal?.starts_at)}
              />
            </Field>
            <Field label="Ends on" htmlFor="endsAt" error={state.errors?.endsAt}>
              <input
                id="endsAt"
                name="endsAt"
                type="date"
                className="field"
                defaultValue={dateInput(deal?.ends_at)}
              />
            </Field>
            <Field
              label="Description"
              htmlFor="description"
              error={state.errors?.description}
              className="sm:col-span-2"
            >
              <textarea
                id="description"
                name="description"
                className="field min-h-24 resize-y"
                defaultValue={deal?.description ?? ""}
                maxLength={1000}
                placeholder="Explain what the offer includes and any conditions."
              />
            </Field>
            <div className="sm:col-span-2">
              <ToggleRow
                name="isActive"
                label="Offer is active"
                description="Inactive offers are hidden and cannot be redeemed."
                defaultChecked={deal?.is_active ?? true}
              />
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="card-surface p-5 sm:p-6">
          <h3 className="font-display text-xl text-chocolate">Offer image</h3>
          <div className="mt-4 overflow-hidden rounded-2xl border border-dashed border-chocolate/15 bg-cream-50">
            {preview ? (
              <div className="relative aspect-[4/3]">
                <img src={preview} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-chocolate/75 text-cream-50"
                  aria-label="Remove image preview"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex aspect-[4/3] flex-col items-center justify-center text-chocolate/30">
                <ImagePlus className="size-8" />
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider">
                  No image selected
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-4">
            <Field label="Upload image" htmlFor="imageFile" error={state.errors?.imageFile}>
              <input
                id="imageFile"
                name="imageFile"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="block w-full cursor-pointer rounded-2xl border border-chocolate/15 bg-white px-3 py-2.5 text-[11px] text-chocolate/55 file:mr-3 file:rounded-full file:border-0 file:bg-chocolate file:px-3 file:py-1.5 file:text-[10px] file:font-bold file:uppercase file:tracking-wider file:text-cream-50"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) setPreview(URL.createObjectURL(file));
                }}
              />
            </Field>
            <Field label="Or use an image URL" htmlFor="imageUrl" error={state.errors?.imageUrl}>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                className="field"
                defaultValue={deal?.image_url ?? ""}
                placeholder="https://…"
                onChange={(event) => setPreview(event.target.value || null)}
              />
            </Field>
          </div>
        </section>

        <div className="flex flex-col gap-2">
          <SubmitButton
            label={deal ? "Save offer" : "Create offer"}
            pendingLabel="Saving offer…"
            className="w-full"
          />
          <Link href="/admin/deals" className="btn-outline w-full">
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}
