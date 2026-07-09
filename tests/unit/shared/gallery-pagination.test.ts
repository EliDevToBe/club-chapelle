import { describe, expect, it } from "vitest";
import {
  clampGalleryPage,
  getGalleryPageSize,
  getGalleryPageSlice,
} from "~~/shared/website/gallery-pagination";

describe("gallery-pagination", () => {
  it("derives page size from three rows and column count", () => {
    expect(getGalleryPageSize(1)).toBe(3);
    expect(getGalleryPageSize(2)).toBe(6);
    expect(getGalleryPageSize(3)).toBe(9);
    expect(getGalleryPageSize(4)).toBe(12);
  });

  it("slices items for the requested page", () => {
    const items = ["a", "b", "c", "d", "e", "f", "g"];

    expect(getGalleryPageSlice(items, 1, 3)).toEqual(["a", "b", "c"]);
    expect(getGalleryPageSlice(items, 2, 3)).toEqual(["d", "e", "f"]);
    expect(getGalleryPageSlice(items, 3, 3)).toEqual(["g"]);
  });

  it("clamps page when total items shrink or page size grows", () => {
    expect(clampGalleryPage(5, 10, 3)).toBe(4);
    expect(clampGalleryPage(4, 10, 3)).toBe(4);
    expect(clampGalleryPage(1, 0, 3)).toBe(1);
    expect(clampGalleryPage(2, 5, 12)).toBe(1);
  });
});
