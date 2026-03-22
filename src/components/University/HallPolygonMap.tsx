// IMPORTANT: This file must only be imported via next/dynamic with ssr: false
"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  CircleMarker,
  Polyline,
  useMapEvents,
  useMap,
} from "react-leaflet";
interface LatLng { lat: number; lng: number; }

// Fix Leaflet default marker icon paths broken by webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Click-to-add-vertex handler ───────────────────────────────────────────────
function ClickHandler({ onAdd }: { onAdd: (pt: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onAdd({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// ── Fly-to controller (responds to external [lat,lng] prop) ──────────────────
function FlyToController({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 19, { animate: true, duration: 1.2 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return null;
}

// ── Public component ──────────────────────────────────────────────────────────
interface HallPolygonMapProps {
  value: LatLng[];
  onChange: (pts: LatLng[]) => void;
  /** Fallback center [lat, lng] if geolocation is denied. Defaults to Abuja, Nigeria. */
  center?: [number, number];
}

export default function HallPolygonMap({
  value,
  onChange,
  center = [9.0578, 7.4951],
}: HallPolygonMapProps) {
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [satellite, setSatellite] = useState(true);
  const positions = value.map((p) => [p.lat, p.lng] as [number, number]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
        { headers: { "Accept-Language": "en" } },
      );
      const data = await res.json();
      if (data.length === 0) {
        setSearchError("Location not found — try a more specific address.");
      } else {
        setFlyTarget([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setSearchQuery("");
      }
    } catch {
      setSearchError("Search failed — check your internet connection.");
    } finally {
      setSearching(false);
    }
  };

  const handleGps = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFlyTarget([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search address or building name…"
          className="flex-1 h-9 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#641BC4]"
        />
        <button
          type="submit"
          disabled={searching || !searchQuery.trim()}
          className="h-9 px-4 rounded-lg bg-[#641BC4] text-white text-sm font-semibold disabled:opacity-50"
        >
          {searching ? "…" : "Go"}
        </button>
        <button
          type="button"
          title="Use my GPS location"
          onClick={handleGps}
          className="h-9 px-3 rounded-lg border border-slate-300 text-sm hover:bg-slate-50"
        >
          📍 My location
        </button>
        <button
          type="button"
          onClick={() => setSatellite((s) => !s)}
          className="h-9 px-3 rounded-lg border border-slate-300 text-sm hover:bg-slate-50 font-medium"
        >
          {satellite ? "🗺 Street" : "🛰 Satellite"}
        </button>
      </form>

      {searchError && (
        <p className="text-xs text-red-500">{searchError}</p>
      )}

      <div className="rounded-xl overflow-hidden border border-slate-200">
        <MapContainer
          center={center}
          zoom={17}
          style={{ height: 380, width: "100%" }}
          scrollWheelZoom
        >
          {satellite ? (
            <>
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics"
                maxZoom={19}
              />
              {/* Labels overlay on top of satellite */}
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                maxZoom={19}
                subdomains="abcd"
              />
            </>
          ) : (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
          )}

          <FlyToController target={flyTarget} />
          <ClickHandler onAdd={(pt) => onChange([...value, pt])} />

          {/* Closed polygon when ≥3 vertices */}
          {value.length >= 3 && (
            <Polygon
              positions={positions}
              pathOptions={{
                color: "#641BC4",
                fillColor: "#641BC4",
                fillOpacity: 0.15,
                weight: 2,
              }}
            />
          )}

          {/* Preview line when <3 */}
          {value.length >= 2 && value.length < 3 && (
            <Polyline
              positions={positions}
              pathOptions={{ color: "#641BC4", weight: 2, dashArray: "6 4" }}
            />
          )}

          {/* Vertex dots */}
          {value.map((pt, i) => (
            <CircleMarker
              key={i}
              center={[pt.lat, pt.lng]}
              radius={6}
              pathOptions={{
                color: "#641BC4",
                fillColor: i === 0 ? "#641BC4" : "#fff",
                fillOpacity: 1,
                weight: 2,
              }}
            />
          ))}
        </MapContainer>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-slate-500 font-medium">
          {value.length === 0
            ? "Search for your building above, then click each corner on the map"
            : value.length < 3
              ? `${value.length} point${value.length === 1 ? "" : "s"} — need at least 3`
              : `${value.length} vertices — polygon ready ✓`}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange(value.slice(0, -1))}
            disabled={value.length === 0}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={() => onChange([])}
            disabled={value.length === 0}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
}
