"use client";

/* eslint-disable @next/next/no-img-element */

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { FolderTree, ImagePlus, X } from "lucide-react";
import { saveCategoryAction, type AdminFormState } from "@/app/actions/admin";
import type { Category } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { Field, FormAlert, SubmitButton, ToggleRow } from "./form-parts";

const initial: AdminFormState = { ok: false };

export function CategoryForm({ category }: { category?: Category | null }) {
  const [state, formAction] = useActionState(saveCategoryAction, initial);
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(category?.slug));
  const [preview, setPreview] = useState<string | null>(category?.image_url ?? null);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
      <input type="hidden" name="id" value={category?.id ?? ""} />

      <div className="space-y-6">
        {state.message ? <FormAlert message={state.message} ok={state.ok} /> : null}

        <section className="card-surface p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-full bg-cream-100 text-gold-500">
              <FolderTree className="size-4" />
            </span>
            <h3 className="font-display text-xl text-chocolate">Category details</h3>
          </div>

          <div className="mt-5 grid gap-4">
            <Field label="Category name" htmlFor="name" required error={state.errors?.name}>
              <input
                id="name"
                name="name"
                className="field"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                placeholder="e.g. Celebration cakes"
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
                maxLength={100}
                placeholder="celebration-cakes"
              />
            </Field>
            <Field
              label="Description"
              htmlFor="description"
              error={state.errors?.description}
            >
              <textarea
                id="description"
                name="description"
                className="field min-h-24 resize-y"
                defaultValue={category?.description ?? ""}
                maxLength={500}
                placeholder="A short description shown on the categories page."
              />
            </Field>
            <Field label="Display order" htmlFor="sortOrder" error={state.errors?.sortOrder}>
              <input
                id="sortOrder"
                name="sortOrder"
                type="number"
                step="1"
                className="field"
                defaultValue={category?.sort_order ?? 0}
              />
            </Field>
            <ToggleRow
              name="isActive"
              label="Visible on the website"
              description="Inactive categories are hidden from customers."
              defaultChecked={category?.is_active ?? true}
            />
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="card-surface p-5 sm:p-6">
          <h3 className="font-display text-xl text-chocolate">Category image</h3>
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
                defaultValue={category?.image_url ?? ""}
                placeholder="https://…"
                onChange={(event) => setPreview(event.target.value || null)}
              />
            </Field>
          </div>
        </section>

        <div className="flex flex-col gap-2">
          <SubmitButton
            label={category ? "Save category" : "Create category"}
            pendingLabel="Saving category…"
            className="w-full"
          />
          <Link href="/admin/categories" className="btn-outline w-full">
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}
