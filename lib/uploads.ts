import "server-only";

import { createSupabaseAdminClient } from "./supabase/admin";
import { STORAGE_BUCKETS } from "./supabase/config";
import { slugify } from "./utils";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function isValidImageBytes(bytes: Uint8Array, mime: string) {
  if (mime === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mime === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  }
  if (mime === "image/webp") {
    return (
      String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === "RIFF" &&
      String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]) === "WEBP"
    );
  }
  return false;
}

export async function uploadProductImage(file: File, slug: string) {
  if (!file || file.size === 0) return null;
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be smaller than 5 MB.");
  }
  const extension = MIME_EXTENSIONS[file.type];
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!extension || !isValidImageBytes(bytes, file.type)) {
    throw new Error("Upload a valid JPG, PNG or WebP image.");
  }

  const path = `${slugify(slug) || "product"}-${Date.now()}.${extension}`;
  const admin = createSupabaseAdminClient();
  const { error } = await admin.storage
    .from(STORAGE_BUCKETS.products)
    .upload(path, bytes, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    throw new Error("The image could not be uploaded. Check the storage bucket.");
  }

  const { data } = admin.storage.from(STORAGE_BUCKETS.products).getPublicUrl(path);
  return data.publicUrl;
}
