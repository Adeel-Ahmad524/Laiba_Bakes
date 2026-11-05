import { describe, expect, it } from "vitest";
import {
  formatPKR,
  normalizePhone,
  displayPhone,
  safeNumber,
  slugify,
  truncate,
} from "@/lib/utils";

describe("normalizePhone", () => {
  it("converts local Pakistani numbers to international format", () => {
    expect(normalizePhone("0300-5477207")).toBe("923005477207");
  });

  it("keeps already-normalised numbers", () => {
    expect(normalizePhone("923005477207")).toBe("923005477207");
    expect(normalizePhone("0092 300 5477207")).toBe("923005477207");
  });

  it("handles ten digit mobile numbers", () => {
    expect(normalizePhone("3005477207")).toBe("923005477207");
  });
});

describe("displayPhone", () => {
  it("formats an international number for display", () => {
    expect(displayPhone("923005477207")).toBe("0300-5477207");
  });

  it("returns the original value when it cannot format", () => {
    expect(displayPhone("+44 20 7946 0958")).toBe("+44 20 7946 0958");
  });
});

describe("slugify", () => {
  it("creates URL-safe slugs", () => {
    expect(slugify("Chocolate Fudge Cake!")).toBe("chocolate-fudge-cake");
    expect(slugify("  Red   Velvet  ")).toBe("red-velvet");
  });
});

describe("formatPKR", () => {
  it("formats currency in Pakistani rupees", () => {
    expect(formatPKR(1100)).toContain("1,100");
  });

  it("handles invalid values", () => {
    expect(formatPKR(undefined)).toContain("0");
  });
});

describe("safeNumber", () => {
  it("returns numeric strings as numbers", () => {
    expect(safeNumber("1300")).toBe(1300);
  });

  it("falls back for invalid values", () => {
    expect(safeNumber("not-a-number", 7)).toBe(7);
  });
});

describe("truncate", () => {
  it("adds an ellipsis only when needed", () => {
    expect(truncate("short", 10)).toBe("short");
    expect(truncate("a much longer sentence", 5)).toBe("a muc…");
  });
});
