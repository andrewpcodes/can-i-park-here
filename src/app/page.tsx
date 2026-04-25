"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import ParkingInfoCard from "@/components/ParkingInfoCard";
import ReportSpotForm from "@/components/ReportSpotForm";
import type { ParkingSpot, NewParkingSpot } from "@/lib/types";

// Leaflet must not render server-side
const ParkingMap = dynamic(() => import("@/components/ParkingMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <span className="text-gray-400 text-sm animate-pulse">Loading map…</span>
    </div>
  ),
});

type Panel = "spots" | "report";

export default function HomePage() {
  const { latitude, longitude, loading: locLoading, error: locError } = useGeolocation();
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [activePanel, setActivePanel] = useState<Panel>("spots");
  const [loadingSpots, setLoadingSpots] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Fetch nearby spots whenever location changes
  useEffect(() => {
    if (latitude == null || longitude == null) return;
    setLoadingSpots(true);
    fetch(`/api/parking-spots?lat=${latitude}&lng=${longitude}`)
      .then((r) => r.json())
      .then((data: ParkingSpot[]) => setSpots(Array.isArray(data) ? data : []))
      .catch(() => setSpots([]))
      .finally(() => setLoadingSpots(false));
  }, [latitude, longitude]);

  const handleSpotClick = useCallback((spot: ParkingSpot) => {
    setSelectedSpot(spot);
    setActivePanel("spots");
  }, []);

  const handleVote = useCallback(async (id: string, vote: "up" | "down") => {
    await fetch(`/api/parking-spots/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote }),
    });
  }, []);

  const handleReport = useCallback(
    async (spot: NewParkingSpot) => {
      const res = await fetch("/api/parking-spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spot),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to submit report.");
      }
      const created: ParkingSpot = await res.json();
      setSpots((prev) => [created, ...prev]);
      setReportSuccess(true);
      setActivePanel("spots");
      setTimeout(() => setReportSuccess(false), 3000);
    },
    [],
  );

  return (
    <main className="flex flex-col h-screen overflow-hidden bg-gray-50 font-[family-name:var(--font-geist-sans)]">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white shadow z-10 shrink-0">
        <h1 className="text-lg font-bold tracking-tight">🅿️ Can I Park Here?</h1>
        {locError && (
          <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">
            📍 Location unavailable
          </span>
        )}
        {locLoading && !locError && (
          <span className="text-xs animate-pulse">Finding you…</span>
        )}
      </header>

      {/* ── Map ── */}
      <div className="flex-1 relative min-h-0">
        <ParkingMap
          userLat={latitude}
          userLng={longitude}
          spots={spots}
          onSpotClick={handleSpotClick}
        />
      </div>

      {/* ── Bottom Panel ── */}
      <div className="shrink-0 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] max-h-[50vh] flex flex-col">
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-gray-100 px-4 shrink-0">
          {(["spots", "report"] as Panel[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActivePanel(tab)}
              className={`flex-1 py-2 text-sm font-medium transition-colors
                ${activePanel === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"}`}
            >
              {tab === "spots" ? "Nearby Spots" : "Report a Spot"}
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activePanel === "spots" && (
            <>
              {reportSuccess && (
                <p className="text-sm text-green-700 bg-green-50 rounded-xl px-3 py-2 mb-3">
                  ✅ Spot reported — thank you!
                </p>
              )}
              {selectedSpot ? (
                <div>
                  <button
                    onClick={() => setSelectedSpot(null)}
                    className="text-xs text-blue-600 mb-2"
                  >
                    ← Back to list
                  </button>
                  <ParkingInfoCard spot={selectedSpot} onVote={handleVote} />
                </div>
              ) : loadingSpots ? (
                <p className="text-sm text-gray-400 text-center py-4 animate-pulse">
                  Loading nearby spots…
                </p>
              ) : spots.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">No spots reported nearby yet.</p>
                  <button
                    onClick={() => setActivePanel("report")}
                    className="mt-2 text-blue-600 text-sm underline"
                  >
                    Be the first to report one!
                  </button>
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {spots.map((spot) => (
                    <li key={spot.id}>
                      <button
                        className="w-full text-left"
                        onClick={() => setSelectedSpot(spot)}
                      >
                        <ParkingInfoCard spot={spot} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {activePanel === "report" && (
            <ReportSpotForm
              latitude={latitude ?? undefined}
              longitude={longitude ?? undefined}
              onSubmit={handleReport}
              onCancel={() => setActivePanel("spots")}
            />
          )}
        </div>
      </div>
    </main>
  );
}
