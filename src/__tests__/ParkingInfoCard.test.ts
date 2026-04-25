import { formatCost, formatTimeLimit } from "@/components/ParkingInfoCard";
import type { ParkingSpot } from "@/lib/types";

function makeSpot(overrides: Partial<ParkingSpot> = {}): ParkingSpot {
  return {
    id: "abc-123",
    created_at: "2024-01-01T00:00:00Z",
    latitude: 40.7128,
    longitude: -74.006,
    address: null,
    is_free: false,
    cost_per_hour: null,
    time_limit_minutes: null,
    restrictions: null,
    notes: null,
    upvotes: 0,
    downvotes: 0,
    ...overrides,
  };
}

describe("formatCost", () => {
  it("returns 'Free' for free spots", () => {
    expect(formatCost(makeSpot({ is_free: true }))).toBe("Free");
  });

  it("returns formatted cost when paid", () => {
    expect(formatCost(makeSpot({ is_free: false, cost_per_hour: 2.5 }))).toBe(
      "$2.50/hr",
    );
  });

  it("returns 'Cost unknown' when paid but cost is null", () => {
    expect(
      formatCost(makeSpot({ is_free: false, cost_per_hour: null })),
    ).toBe("Cost unknown");
  });
});

describe("formatTimeLimit", () => {
  it("returns empty string for null", () => {
    expect(formatTimeLimit(null)).toBe("");
  });

  it("formats minutes-only limits", () => {
    expect(formatTimeLimit(30)).toBe("30 min limit");
  });

  it("formats whole-hour limits", () => {
    expect(formatTimeLimit(120)).toBe("2h limit");
  });

  it("formats hours + minutes", () => {
    expect(formatTimeLimit(90)).toBe("1h 30m limit");
  });
});
