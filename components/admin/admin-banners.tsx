import { CheckCircle2, XCircle } from "lucide-react";

export function AdminSuccess({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-[12px] leading-5 text-green-800">
      <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function AdminError({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] leading-5 text-rose-800">
      <XCircle className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
