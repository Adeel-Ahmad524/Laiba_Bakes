import Link from "next/link";
import { Mail, MailOpen, Phone, Reply } from "lucide-react";
import { getAdminMessages } from "@/lib/admin-data";
import {
  deleteMessageAction,
  updateMessageStatusAction,
} from "@/app/actions/admin";
import { AdminSuccess } from "@/components/admin/admin-banners";
import { DeleteForm } from "@/components/admin/delete-form";
import { AdminPageHeader, EmptyState, Panel } from "@/components/admin/admin-ui";
import { cn, formatDate } from "@/lib/utils";

export const metadata = { title: "Messages" };

const STATUS_TONE = {
  new: "border-blue-200 bg-blue-50 text-blue-700",
  read: "border-amber-200 bg-amber-50 text-amber-700",
  replied: "border-green-200 bg-green-50 text-green-700",
} as const;

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; updated?: string; deleted?: string }>;
}) {
  const [params, messages] = await Promise.all([searchParams, getAdminMessages()]);
  const status = params.status ?? "";
  const filtered = status ? messages.filter((message) => message.status === status) : messages;
  const counts = {
    new: messages.filter((message) => message.status === "new").length,
    read: messages.filter((message) => message.status === "read").length,
    replied: messages.filter((message) => message.status === "replied").length,
  };

  return (
    <div className="space-y-5">
      {params.updated ? <AdminSuccess>Message updated.</AdminSuccess> : null}
      {params.deleted ? <AdminSuccess>Message deleted.</AdminSuccess> : null}

      <AdminPageHeader
        title="Messages"
        description="Enquiries submitted through the contact form on the website."
      />

      <div className="flex flex-wrap gap-1.5">
        {[
          { value: "", label: "All", count: messages.length },
          { value: "new", label: "New", count: counts.new },
          { value: "read", label: "Read", count: counts.read },
          { value: "replied", label: "Replied", count: counts.replied },
        ].map((tab) => (
          <Link
            key={tab.value || "all"}
            href={tab.value ? `/admin/messages?status=${tab.value}` : "/admin/messages"}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-wider transition",
              status === tab.value
                ? "border-chocolate bg-chocolate text-cream-50"
                : "border-chocolate/10 bg-white text-chocolate/50 hover:border-gold-300",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[8px]",
                status === tab.value ? "bg-cream-50/15" : "bg-cream-100",
              )}
            >
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<Mail className="size-5" />}
            title="No messages here"
            description="New contact form enquiries will appear in this inbox."
          />
        </Panel>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((message) => (
            <Panel key={message.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[13px] font-semibold text-chocolate">{message.name}</h3>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider",
                        STATUS_TONE[message.status],
                      )}
                    >
                      {message.status}
                    </span>
                  </div>
                  {message.subject ? (
                    <p className="mt-1 text-[11px] font-medium text-chocolate/60">
                      {message.subject}
                    </p>
                  ) : null}
                </div>
                <span className="shrink-0 text-[9px] text-chocolate/35">
                  {formatDate(message.created_at, true)}
                </span>
              </div>

              <p className="mt-3 flex-1 whitespace-pre-line rounded-2xl bg-cream-50 px-4 py-3 text-[12px] leading-6 text-chocolate/65">
                {message.message}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-chocolate/50">
                <a
                  href={`mailto:${message.email}`}
                  className="inline-flex items-center gap-1.5 hover:text-chocolate"
                >
                  <MailOpen className="size-3.5 text-gold-500" />
                  {message.email}
                </a>
                {message.phone ? (
                  <a
                    href={`tel:${message.phone.replace(/[^\d+]/g, "")}`}
                    className="inline-flex items-center gap-1.5 hover:text-chocolate"
                  >
                    <Phone className="size-3.5 text-gold-500" />
                    {message.phone}
                  </a>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-chocolate/10 pt-3">
                <a
                  href={`mailto:${message.email}?subject=${encodeURIComponent(
                    `Re: ${message.subject || "Your enquiry to Laiba Bakes"}`,
                  )}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-chocolate px-3.5 py-2 text-[9px] font-bold uppercase tracking-wider text-cream-50 transition hover:bg-chocolate-900"
                >
                  <Reply className="size-3" />
                  Reply by email
                </a>
                {message.status !== "replied" ? (
                  <form action={updateMessageStatusAction}>
                    <input type="hidden" name="id" value={message.id} />
                    <input type="hidden" name="status" value="replied" />
                    <button
                      type="submit"
                      className="rounded-full border border-green-200 bg-green-50 px-3.5 py-2 text-[9px] font-bold uppercase tracking-wider text-green-700 transition hover:bg-green-100"
                    >
                      Mark replied
                    </button>
                  </form>
                ) : null}
                {message.status === "new" ? (
                  <form action={updateMessageStatusAction}>
                    <input type="hidden" name="id" value={message.id} />
                    <input type="hidden" name="status" value="read" />
                    <button
                      type="submit"
                      className="rounded-full border border-chocolate/10 bg-white px-3.5 py-2 text-[9px] font-bold uppercase tracking-wider text-chocolate/50 transition hover:border-gold-300 hover:text-chocolate"
                    >
                      Mark read
                    </button>
                  </form>
                ) : null}
                <div className="ml-auto">
                  <DeleteForm
                    id={message.id}
                    action={deleteMessageAction}
                    compact
                    confirmMessage={`Delete the message from ${message.name}?`}
                  />
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
