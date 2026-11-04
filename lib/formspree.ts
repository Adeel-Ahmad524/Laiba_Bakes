import "server-only";

/**
 * The Formspree form that receives orders and contact messages. It can be
 * overridden with FORMSPREE_ENDPOINT, but the bakery's form works out of the
 * box without any environment variables.
 */
export const FORMSPREE_ENDPOINT =
  process.env.FORMSPREE_ENDPOINT?.trim() ||
  "https://formspree.io/f/mljjaljk";

export interface FormspreeFile {
  fieldName: string;
  file: File;
}

export interface FormspreeResult {
  ok: boolean;
  message?: string;
  /** True when the attachment was rejected and the message was sent without it. */
  fileSkipped?: boolean;
}

function buildBody(fields: Record<string, string>, file?: FormspreeFile | null) {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) body.append(key, value);
  }
  if (file) body.append(file.fieldName, file.file, file.file.name);
  return body;
}

async function post(body: FormData) {
  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    headers: { Accept: "application/json" },
    body,
    cache: "no-store",
  });

  let detail = "";
  if (!response.ok) {
    try {
      const data = (await response.json()) as {
        errors?: Array<string | { message?: string }>;
        error?: string;
      };
      if (Array.isArray(data.errors)) {
        detail = data.errors
          .map((entry) =>
            typeof entry === "string" ? entry : entry?.message ?? "",
          )
          .filter(Boolean)
          .join(" ");
      } else if (typeof data.error === "string") {
        detail = data.error;
      }
    } catch {
      // The response may not be JSON (for example an HTML error page).
    }
  }

  return { response, detail };
}

/**
 * Sends a validated form to Formspree using its AJAX API.
 *
 * File uploads are only available on some Formspree plans. If Formspree
 * rejects the attachment, the submission is retried once without it so the
 * bakery still receives the order; the caller can then ask the customer to
 * send the picture on WhatsApp.
 */
export async function submitToFormspree(
  fields: Record<string, string>,
  file?: FormspreeFile | null,
): Promise<FormspreeResult> {
  try {
    const first = await post(buildBody(fields, file));
    if (first.response.ok) return { ok: true };

    const fileWasRejected =
      Boolean(file) &&
      first.response.status >= 400 &&
      first.response.status < 500 &&
      /file|upload|attachment|plan|size|type/i.test(first.detail);

    if (fileWasRejected) {
      const retry = await post(buildBody(fields, null));
      if (retry.response.ok) return { ok: true, fileSkipped: true };
      console.error(
        "Formspree submission failed after removing the attachment:",
        retry.response.status,
        retry.detail,
      );
    } else {
      console.error(
        "Formspree submission failed:",
        first.response.status,
        first.detail,
      );
    }

    return {
      ok: false,
      message:
        "We could not send your order to the bakery. Please try again, or contact us on WhatsApp.",
    };
  } catch (error) {
    console.error("Formspree request failed:", error);
    return {
      ok: false,
      message:
        "We could not send your order. Please check your connection and try again.",
    };
  }
}
