"use client";

import { useState } from "react";
import type { ParkingSpot } from "@/lib/types";

interface ParkingInfoCardProps {
  spot: ParkingSpot;
  onVote?: (id: string, vote: "up" | "down") => void;
}

function formatCost(spot: ParkingSpot): string {
  if (spot.is_free) return "Free";
  if (spot.cost_per_hour != null) return `$${spot.cost_per_hour.toFixed(2)}/hr`;
  return "Cost unknown";
}

function formatTimeLimit(minutes: number | null): string {
  if (minutes == null) return "";
  if (minutes < 60) return `${minutes} min limit`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m limit` : `${h}h limit`;
}

export default function ParkingInfoCard({ spot, onVote }: ParkingInfoCardProps) {
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  function handleVote(v: "up" | "down") {
    if (voted) return;
    setVoted(v);
    onVote?.(spot.id, v);
  }

  const costLabel = formatCost(spot);
  const costColor = spot.is_free
    ? "bg-green-100 text-green-800"
    : "bg-amber-100 text-amber-800";

  return (
    <div
      className="rounded-2xl bg-white shadow-md p-4 flex flex-col gap-3"
      data-testid="parking-info-card"
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span
          className={`text-sm font-semibold px-3 py-1 rounded-full ${costColor}`}
          data-testid="cost-badge"
        >
          {costLabel}
        </span>
        {spot.time_limit_minutes != null && (
          <span className="text-xs text-gray-500" data-testid="time-limit">
            {formatTimeLimit(spot.time_limit_minutes)}
          </span>
        )}
      </div>

      {/* Address */}
      {spot.address && (
        <p className="text-sm font-medium text-gray-700" data-testid="address">
          {spot.address}
        </p>
      )}

      {/* Restrictions */}
      {spot.restrictions && (
        <p className="text-xs text-red-600 flex items-center gap-1" data-testid="restrictions">
          <span aria-hidden>⚠️</span> {spot.restrictions}
        </p>
      )}

      {/* Notes */}
      {spot.notes && (
        <p className="text-xs text-gray-500 italic" data-testid="notes">
          {spot.notes}
        </p>
      )}

      {/* Votes */}
      <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
        <span className="text-xs text-gray-400">Helpful?</span>
        <button
          onClick={() => handleVote("up")}
          disabled={!!voted}
          aria-label="Upvote"
          className={`flex items-center gap-1 text-sm px-2 py-1 rounded-lg transition-colors
            ${voted === "up" ? "bg-green-100 text-green-700" : "hover:bg-gray-100 text-gray-600"}
            disabled:cursor-not-allowed`}
        >
          👍 {spot.upvotes + (voted === "up" ? 1 : 0)}
        </button>
        <button
          onClick={() => handleVote("down")}
          disabled={!!voted}
          aria-label="Downvote"
          className={`flex items-center gap-1 text-sm px-2 py-1 rounded-lg transition-colors
            ${voted === "down" ? "bg-red-100 text-red-700" : "hover:bg-gray-100 text-gray-600"}
            disabled:cursor-not-allowed`}
        >
          👎 {spot.downvotes + (voted === "down" ? 1 : 0)}
        </button>
      </div>
    </div>
  );
}

export { formatCost, formatTimeLimit };
