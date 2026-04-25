"use client";

import { useState } from "react";
import type { NewParkingSpot } from "@/lib/types";

interface ReportSpotFormProps {
  latitude?: number;
  longitude?: number;
  onSubmit: (spot: NewParkingSpot) => Promise<void>;
  onCancel?: () => void;
}

export default function ReportSpotForm({
  latitude,
  longitude,
  onSubmit,
  onCancel,
}: ReportSpotFormProps) {
  const [isFree, setIsFree] = useState(false);
  const [costPerHour, setCostPerHour] = useState("");
  const [timeLimitMinutes, setTimeLimitMinutes] = useState("");
  const [address, setAddress] = useState("");
  const [restrictions, setRestrictions] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (latitude == null || longitude == null) {
      setError("Location not available. Please allow location access.");
      return;
    }

    const spot: NewParkingSpot = {
      latitude,
      longitude,
      address: address.trim() || null,
      is_free: isFree,
      cost_per_hour: !isFree && costPerHour ? parseFloat(costPerHour) : null,
      time_limit_minutes: timeLimitMinutes ? parseInt(timeLimitMinutes, 10) : null,
      restrictions: restrictions.trim() || null,
      notes: notes.trim() || null,
    };

    setSubmitting(true);
    try {
      await onSubmit(spot);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      data-testid="report-spot-form"
      noValidate
    >
      <h2 className="text-base font-semibold text-gray-800">Report a Parking Spot</h2>

      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Address (optional)
        </label>
        <input
          id="address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. 123 Main St"
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Is Free toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isFree}
          onClick={() => setIsFree((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${isFree ? "bg-green-500" : "bg-gray-300"}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
              ${isFree ? "translate-x-6" : "translate-x-1"}`}
          />
        </button>
        <span className="text-sm text-gray-700">{isFree ? "Free parking" : "Paid parking"}</span>
      </div>

      {/* Cost per hour (only when paid) */}
      {!isFree && (
        <div>
          <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
            Cost per hour ($)
          </label>
          <input
            id="cost"
            type="number"
            min="0"
            step="0.25"
            value={costPerHour}
            onChange={(e) => setCostPerHour(e.target.value)}
            placeholder="e.g. 2.50"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Time limit */}
      <div>
        <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">
          Time limit (minutes, optional)
        </label>
        <input
          id="timeLimit"
          type="number"
          min="0"
          step="15"
          value={timeLimitMinutes}
          onChange={(e) => setTimeLimitMinutes(e.target.value)}
          placeholder="e.g. 120"
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Restrictions */}
      <div>
        <label htmlFor="restrictions" className="block text-sm font-medium text-gray-700 mb-1">
          Restrictions (optional)
        </label>
        <input
          id="restrictions"
          type="text"
          value={restrictions}
          onChange={(e) => setRestrictions(e.target.value)}
          placeholder="e.g. No parking 7-9am Mon-Fri"
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional info…"
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || latitude == null}
          className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Submitting…" : "Submit Report"}
        </button>
      </div>
    </form>
  );
}
