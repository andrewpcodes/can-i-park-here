"use client";

import { useEffect, useRef } from "react";
import type { ParkingSpot } from "@/lib/types";

interface ParkingMapProps {
  userLat: number | null;
  userLng: number | null;
  spots: ParkingSpot[];
  onSpotClick: (spot: ParkingSpot) => void;
}

export default function ParkingMap({
  userLat,
  userLng,
  spots,
  onSpotClick,
}: ParkingMapProps) {
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<import("leaflet").Marker[]>([]);
  const userMarkerRef = useRef<import("leaflet").CircleMarker | null>(null);

  // Initialise map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    import("leaflet").then((L) => {
      // Fix default icon paths broken by webpack
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center: [userLat ?? 40.7128, userLng ?? -74.006],
        zoom: 16,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update user location marker
  useEffect(() => {
    if (!mapRef.current || userLat == null || userLng == null) return;

    import("leaflet").then((L) => {
      const map = mapRef.current!;

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLat, userLng]);
      } else {
        userMarkerRef.current = L.circleMarker([userLat, userLng], {
          radius: 10,
          color: "#2563EB",
          fillColor: "#3B82F6",
          fillOpacity: 0.8,
          weight: 2,
        })
          .bindTooltip("You are here", { permanent: false })
          .addTo(map);
      }

      map.setView([userLat, userLng], 16);
    });
  }, [userLat, userLng]);

  // Sync spot markers
  useEffect(() => {
    if (!mapRef.current) return;

    import("leaflet").then((L) => {
      const map = mapRef.current!;

      // Remove stale markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      spots.forEach((spot) => {
        const color = spot.is_free ? "#16A34A" : "#DC2626";
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            background:${color};
            width:28px;height:28px;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:2px solid white;
            box-shadow:0 2px 6px rgba(0,0,0,0.3);
          "></div>`,
          iconAnchor: [14, 28],
          popupAnchor: [0, -30],
        });

        const marker = L.marker([spot.latitude, spot.longitude], { icon })
          .bindTooltip(spot.is_free ? "Free" : `$${spot.cost_per_hour ?? "?"}/hr`, {
            permanent: false,
          })
          .on("click", () => onSpotClick(spot))
          .addTo(map);

        markersRef.current.push(marker);
      });
    });
  }, [spots, onSpotClick]);

  return (
    <div
      ref={containerRef}
      data-testid="parking-map"
      className="w-full h-full"
      style={{ minHeight: "300px" }}
    />
  );
}
