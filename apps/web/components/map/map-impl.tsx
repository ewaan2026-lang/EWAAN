"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

// مركز افتراضي: الرياض.
const RIYADH: [number, number] = [24.7136, 46.6753];

// دبوس بألوان الهوية (فيروزي + قلب ذهبي).
const pinIcon = L.divIcon({
  className: "ewaan-pin",
  html: `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 1C8.2 1 1 8.2 1 17c0 11.4 16 26 16 26s16-14.6 16-26C33 8.2 25.8 1 17 1z" fill="#00809D" stroke="#ffffff" stroke-width="2"/>
    <circle cx="17" cy="17" r="6.5" fill="#FFD700"/>
  </svg>`,
  iconSize: [34, 44],
  iconAnchor: [17, 44],
});

function ClickCapture({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) {
      map.setView([lat, lng], Math.max(map.getZoom(), 13));
    }
  }, [lat, lng, map]);
  return null;
}

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  href: string;
  sub?: string;
};

function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();
  useEffect(() => {
    const first = markers[0];
    if (!first) return;
    if (markers.length === 1) {
      map.setView([first.lat, first.lng], 14);
      return;
    }
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }, [markers, map]);
  return null;
}

export type MapImplProps = {
  lat: number | null;
  lng: number | null;
  interactive?: boolean;
  zoom?: number;
  onPick?: (lat: number, lng: number) => void;
  markers?: MapMarker[];
};

export default function MapImpl({
  lat,
  lng,
  interactive = false,
  zoom = 13,
  onPick,
  markers,
}: MapImplProps) {
  const hasPoint = lat != null && lng != null;
  const firstMarker = markers && markers.length > 0 ? markers[0] : undefined;
  const hasMarkers = !!firstMarker;
  const center: [number, number] = hasPoint
    ? [lat, lng]
    : firstMarker
      ? [firstMarker.lat, firstMarker.lng]
      : RIYADH;

  return (
    <MapContainer
      center={center}
      zoom={hasPoint || hasMarkers ? zoom : 5}
      scrollWheelZoom={interactive}
      dragging={interactive}
      doubleClickZoom={interactive}
      zoomControl={interactive}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {markers && markers.length > 0
        ? markers.map((m) => (
            <Marker key={m.id} position={[m.lat, m.lng]} icon={pinIcon}>
              <Popup>
                <a
                  href={m.href}
                  className="block text-sm font-bold text-brand-teal-900 underline decoration-brand-gold/60 underline-offset-2"
                >
                  {m.label}
                </a>
                {m.sub ? (
                  <span className="mt-0.5 block text-xs text-brand-teal-900/60">{m.sub}</span>
                ) : null}
              </Popup>
            </Marker>
          ))
        : null}
      {markers && markers.length > 0 ? <FitBounds markers={markers} /> : null}
      {hasPoint ? (
        <Marker
          position={[lat, lng]}
          icon={pinIcon}
          draggable={interactive}
          eventHandlers={
            interactive && onPick
              ? {
                  dragend(e) {
                    const m = (e.target as L.Marker).getLatLng();
                    onPick(m.lat, m.lng);
                  },
                }
              : undefined
          }
        />
      ) : null}
      {interactive && onPick ? <ClickCapture onPick={onPick} /> : null}
      <Recenter lat={lat} lng={lng} />
    </MapContainer>
  );
}
