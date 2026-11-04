"use client";

/* eslint-disable @next/next/no-img-element */

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { ImagePlus, Package, X } from "lucide-react";
import { saveProductAction, type AdminFormState } from "@/app/actions/admin";
import type { Category, Product } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { Field, FormAlert, SubmitButton, ToggleRow } from "./form-parts";

const initial: AdminFormState = { ok: false };

export function ProductForm({
  product,
  categories,
}: {
  product?: Product | null;
  categories: Category[];
}) {
  const [state, formAction] = useActionState(saveProductAction, initial);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product?.slug));
  const [pricingType, setPricingType] = useState(product?.pricing_type ?? "per_pound");
  const [preview, setPreview] = useState<string | null>(product?.image_url ?? null);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
      <input type="hidden" name="id" value={product?.id ?? ""} />

      <div className="space-y-6">
        {state.message ? <FormAlert message={state.message} ok={state.ok} /> : null}

        <section className="card-surface p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-cream-100 text-gold-500">
              <Package className="size-4" />
            </span>
            <h3 className="font-display text-xl text-chocolate">Product details</h3>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Product name" htmlFor="name" required error={state.errors?.name}>
              <input
                id="name"
                name="name"
                className="field"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                placeholder="e.g. Chocolate Fudge Cake"
              />
            </Field>
            <Field
              label="URL slug"
              htmlFor="slug"
              required
              error={state.errors?.slug}
              hint="Lowercase letters, numbers and hyphens only."
            >
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
                placeholder="chocolate-fudge-cake"
              />
            </Field>
            <Field label="Category" htmlFor="categoryId" error={state.errors?.categoryId}>
              <select
                id="categoryId"
                name="categoryId"
                className="field"
                defaultValue={product?.category_id ?? ""}
              >
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Flavour"
              htmlFor="flavor"
              error={state.errors?.flavor}
              hint="Shown as the flavour note on the cake card."
            >
              <input
                id="flavor"
                name="flavor"
                className="field"
                defaultValue={product?.flavor ?? ""}
                maxLength={80}
                placeholder="e.g. Chocolate"
              />
            </Field>
            <Field
              label={pricingType === "per_pound" ? "Price per pound (PKR)" : "Price per item (PKR)"}
              htmlFor="price"
              required
              error={state.errors?.price}
            >
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="1"
                className="field"
                defaultValue={product?.price ?? ""}
                placeholder="1100"
              />
            </Field>
            <Field label="Pricing type" htmlFor="pricingType" error={state.errors?.pricingType}>
              <select
                id="pricingType"
                name="pricingType"
                className="field"
                value={pricingType}
                onChange={(event) =>
                  setPricingType(event.target.value as "per_pound" | "fixed")
                }
              >
                <option value="per_pound">Per pound (cakes)</option>
                <option value="fixed">Fixed price (treats)</option>
              </select>
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
                className="field min-h-28 resize-y"
                defaultValue={product?.description ?? ""}
                maxLength={1000}
                placeholder="Describe the flavour, texture and finish."
              />
            </Field>
            <Field label="Display order" htmlFor="sortOrder" error={state.errors?.sortOrder}>
              <input
                id="sortOrder"
                name="sortOrder"
                type="number"
                step="1"
                className="field"
                defaultValue={product?.sort_order ?? 0}
              />
            </Field>
          </div>
        </section>

        <section className="card-surface p-5 sm:p-6">
          <h3 className="font-display text-xl text-chocolate">Visibility</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ToggleRow
              name="isActive"
              label="Visible on the website"
              description="Inactive products are hidden from customers."
              defaultChecked={product?.is_active ?? true}
            />
            <ToggleRow
              name="isFeatured"
              label="Featured product"
              description="Featured cakes appear in the home page spotlight."
              defaultChecked={product?.is_featured ?? false}
            />
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="card-surface p-5 sm:p-6">
          <h3 className="font-display text-xl text-chocolate">Product photograph</h3>
          <p className="mt-1 text-[11px] leading-5 text-chocolate/45">
            Upload a JPG, PNG or WebP up to 5 MB. The uploaded image is stored in
            Supabase Storage.
          </p>

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
            <Field
              label="Or use an image URL"
              htmlFor="imageUrl"
              error={state.errors?.imageUrl}
              hint="Leave blank to keep the existing image."
            >
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                className="field"
                defaultValue={product?.image_url ?? ""}
                placeholder="https://…"
                onChange={(event) => setPreview(event.target.value || null)}
              />
            </Field>
          </div>
        </section>

        <div className="flex flex-col gap-2">
          <SubmitButton
            label={product ? "Save product" : "Create product"}
            pendingLabel="Saving product…"
            className="w-full"
          />
          <Link href="/admin/products" className="btn-outline w-full">
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}
