"use client";

import { Ruler, Sparkles } from "lucide-react";
import {
  deleteCakeSizeAction,
  deleteDecorationAction,
  saveCakeSizeAction,
  saveDecorationAction,
} from "@/app/actions/admin";
import type { CakeSize, DecorationOption } from "@/lib/types";
import { DeleteForm } from "./delete-form";
import { SubmitButton } from "./form-parts";

export function CakeSizeManager({ sizes }: { sizes: CakeSize[] }) {
  return (
    <section className="card-surface p-5 sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-full bg-cream-100 text-gold-500">
          <Ruler className="size-4" />
        </span>
        <div>
          <h3 className="font-display text-xl text-chocolate">Cake sizes</h3>
          <p className="text-[10px] leading-4 text-chocolate/40">
            Reference prices are a guide only. They are never added to the
            flavour price.
          </p>
        </div>
      </div>

      <form action={saveCakeSizeAction} className="mt-5 rounded-2xl bg-cream-50 p-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-chocolate/40">
          Add a size
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            name="label"
            className="field"
            placeholder="Label e.g. 1 Pound"
            aria-label="Size label"
            required
            maxLength={40}
          />
          <input
            name="pounds"
            type="number"
            min="0.25"
            step="0.25"
            className="field"
            placeholder="Pounds"
            aria-label="Size in pounds"
            required
          />
          <input
            name="referencePrice"
            type="number"
            min="0"
            step="1"
            className="field"
            placeholder="Reference PKR"
            aria-label="Reference price"
            required
          />
          <input
            name="sortOrder"
            type="number"
            step="1"
            className="field"
            placeholder="Sort order"
            aria-label="Sort order"
            defaultValue={0}
          />
          <label className="flex items-center gap-2 rounded-2xl border border-chocolate/10 bg-white px-3 text-[11px] font-semibold text-chocolate/60">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked
              className="size-4 accent-chocolate"
            />
            Active
          </label>
        </div>
        <SubmitButton label="Add size" pendingLabel="Adding…" className="mt-3 w-full sm:w-auto" />
      </form>

      <div className="mt-5 space-y-3">
        {sizes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-chocolate/15 px-4 py-6 text-center text-[11px] text-chocolate/40">
            No cake sizes yet. Add your first size above.
          </p>
        ) : null}
        {sizes.map((size) => (
          <div
            key={size.id}
            className="flex flex-col gap-3 rounded-2xl border border-chocolate/10 p-3 lg:flex-row lg:items-end"
          >
            <form action={saveCakeSizeAction} className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <input type="hidden" name="id" value={size.id} />
              <input
                name="label"
                className="field py-2.5"
                defaultValue={size.label}
                aria-label="Size label"
                required
                maxLength={40}
              />
              <input
                name="pounds"
                type="number"
                min="0.25"
                step="0.25"
                className="field py-2.5"
                defaultValue={size.pounds}
                aria-label="Size in pounds"
                required
              />
              <input
                name="referencePrice"
                type="number"
                min="0"
                step="1"
                className="field py-2.5"
                defaultValue={size.reference_price}
                aria-label="Reference price"
                required
              />
              <input
                name="sortOrder"
                type="number"
                step="1"
                className="field py-2.5"
                defaultValue={size.sort_order}
                aria-label="Sort order"
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-[10px] font-semibold text-chocolate/50">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={size.is_active}
                    className="size-4 accent-chocolate"
                  />
                  Active
                </label>
                <SubmitButton
                  label="Save"
                  pendingLabel="Saving…"
                  className="ml-auto min-h-9 px-4 text-[10px]"
                />
              </div>
            </form>
            <DeleteForm
              id={size.id}
              action={deleteCakeSizeAction}
              compact
              confirmMessage={`Delete the ${size.label} size? Existing orders keep their saved prices.`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function DecorationManager({ decorations }: { decorations: DecorationOption[] }) {
  return (
    <section className="card-surface p-5 sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-full bg-cream-100 text-gold-500">
          <Sparkles className="size-4" />
        </span>
        <div>
          <h3 className="font-display text-xl text-chocolate">Decoration finishes</h3>
          <p className="text-[10px] leading-4 text-chocolate/40">
            Optional finishes and their extra charge, shown at checkout.
          </p>
        </div>
      </div>

      <form action={saveDecorationAction} className="mt-5 rounded-2xl bg-cream-50 p-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-chocolate/40">
          Add a decoration option
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            name="name"
            className="field"
            placeholder="Name e.g. Fresh flowers"
            aria-label="Decoration name"
            required
            maxLength={80}
          />
          <input
            name="description"
            className="field"
            placeholder="Short description"
            aria-label="Decoration description"
            maxLength={300}
          />
          <input
            name="charge"
            type="number"
            min="0"
            step="1"
            className="field"
            placeholder="Charge PKR"
            aria-label="Decoration charge"
            required
          />
          <input
            name="sortOrder"
            type="number"
            step="1"
            className="field"
            placeholder="Sort order"
            aria-label="Sort order"
            defaultValue={0}
          />
          <label className="flex items-center gap-2 rounded-2xl border border-chocolate/10 bg-white px-3 text-[11px] font-semibold text-chocolate/60">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked
              className="size-4 accent-chocolate"
            />
            Active
          </label>
        </div>
        <SubmitButton
          label="Add decoration"
          pendingLabel="Adding…"
          className="mt-3 w-full sm:w-auto"
        />
      </form>

      <div className="mt-5 space-y-3">
        {decorations.length === 0 ? (
          <p className="rounded-xl border border-dashed border-chocolate/15 px-4 py-6 text-center text-[11px] text-chocolate/40">
            No decoration options yet. Add your first option above.
          </p>
        ) : null}
        {decorations.map((option) => (
          <div
            key={option.id}
            className="flex flex-col gap-3 rounded-2xl border border-chocolate/10 p-3 lg:flex-row lg:items-end"
          >
            <form action={saveDecorationAction} className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <input type="hidden" name="id" value={option.id} />
              <input
                name="name"
                className="field py-2.5"
                defaultValue={option.name}
                aria-label="Decoration name"
                required
                maxLength={80}
              />
              <input
                name="description"
                className="field py-2.5"
                defaultValue={option.description ?? ""}
                aria-label="Decoration description"
                maxLength={300}
              />
              <input
                name="charge"
                type="number"
                min="0"
                step="1"
                className="field py-2.5"
                defaultValue={option.charge}
                aria-label="Decoration charge"
                required
              />
              <input
                name="sortOrder"
                type="number"
                step="1"
                className="field py-2.5"
                defaultValue={option.sort_order}
                aria-label="Sort order"
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-[10px] font-semibold text-chocolate/50">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={option.is_active}
                    className="size-4 accent-chocolate"
                  />
                  Active
                </label>
                <SubmitButton
                  label="Save"
                  pendingLabel="Saving…"
                  className="ml-auto min-h-9 px-4 text-[10px]"
                />
              </div>
            </form>
            <DeleteForm
              id={option.id}
              action={deleteDecorationAction}
              compact
              confirmMessage={`Delete the ${option.name} decoration option?`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
