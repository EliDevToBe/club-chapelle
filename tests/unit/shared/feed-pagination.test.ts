import { describe, expect, it } from "vitest";
import {
  FEED_PAGE_SIZE,
  getNextVisibleCount,
} from "~~/shared/website/feed-pagination";

describe("feed-pagination", () => {
  it("uses a default page size of five", () => {
    expect(FEED_PAGE_SIZE).toBe(5);
  });

  it("increments visible count by page size until total is reached", () => {
    expect(getNextVisibleCount(0, 12)).toBe(5);
    expect(getNextVisibleCount(5, 12)).toBe(10);
    expect(getNextVisibleCount(10, 12)).toBe(12);
    expect(getNextVisibleCount(12, 12)).toBe(12);
  });
});
