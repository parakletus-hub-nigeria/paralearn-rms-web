// IMPORTANT: This file must only be imported via next/dynamic with ssr: false
"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";

// Fix Leaflet default marker icon paths broken by webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Click to set center ───────────────────────────────────────────────────────
function ClickHandler({
  onSet,
}: {
  onSet: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSet(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ── Fly-to controller ─────────────────────────────────────────────────────────
function FlyToController({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 18, { animate: true, duration: 1.2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return null;
}

// ── Public component ──────────────────────────────────────────────────────────
export interface RadiusGeo {
  lat: number;
  lng: number;
  radiusMeters: number;
}

interface HallRadiusMapProps {
  value: RadiusGeo | null;
  onChange: (geo: RadiusGeo | null) => void;
  /** Fallback center [lat, lng] if geolocation denied. Defaults to Abuja, Nigeria. */
  center?: [number, number];
}

const MIN_RADIUS = 10;
const MAX_RADIUS = 500;

export default function HallRadiusMap({
  value,
  onChange,
  center = [9.0578, 7.4951],
}: HallRadiusMapProps) {
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [satellite, setSatellite] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use current value's radius or a sensible default when first placing center
  const radius = value?.radiusMeters ?? 50;

  const handleMapClick = (lat: number, lng: number) => {
    onChange({ lat, lng, radiusMeters: radius });
  };

  const handleRadiusChange = (r: number) => {
    if (!value) return;
    onChange({ ...value, radiusMeters: r });
  };

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
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setFlyTarget([lat, lng]);
        setSearchQuery("");
        // Also set as center if not yet placed
        if (!value) onChange({ lat, lng, radiusMeters: 50 });
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
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setFlyTarget([lat, lng]);
        if (!value) onChange({ lat, lng, radiusMeters: 50 });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const mapCenter: [number, number] = value
    ? [value.lat, value.lng]
    : center;

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

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-slate-200">
        <MapContainer
          center={mapCenter}
          zoom={17}
          style={{ height: 340, width: "100%" }}
          scrollWheelZoom
        >
          {satellite ? (
            <>
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics"
                maxZoom={20}
              />
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                maxZoom={20}
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
          <ClickHandler onSet={handleMapClick} />

          {value && (
            <>
              {/* Center marker */}
              <Marker position={[value.lat, value.lng]} />
              {/* Radius circle */}
              <Circle
                center={[value.lat, value.lng]}
                radius={value.radiusMeters}
                pathOptions={{
                  color: "#641BC4",
                  fillColor: "#641BC4",
                  fillOpacity: 0.15,
                  weight: 2,
                }}
              />
            </>
          )}
        </MapContainer>
      </div>

      {/* Radius slider */}
      {value && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-700">
              Geofence Radius
            </label>
            <span className="text-sm font-black text-[#641BC4]">
              {value.radiusMeters} m
            </span>
          </div>
          <input
            type="range"
            min={MIN_RADIUS}
            max={MAX_RADIUS}
            step={5}
            value={value.radiusMeters}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            className="w-full accent-[#641BC4]"
          />
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>{MIN_RADIUS} m (min)</span>
            <span>{MAX_RADIUS} m (max)</span>
          </div>
          <p className="text-xs text-slate-500">
            Students must be within{" "}
            <strong className="text-slate-700">{value.radiusMeters} metres</strong>{" "}
            of this point to check in. Typical classroom: 30–80 m. Outdoor
            space: 50–150 m.
          </p>
        </div>
      )}

      {/* Status + controls */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-slate-500 font-medium">
          {!value
            ? "Search for the building, then click the map to set the centre"
            : `Centre set · ${value.radiusMeters} m radius · click map to reposition`}
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          disabled={!value}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
