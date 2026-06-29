"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
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

export type MapImplProps = {
  lat: number | null;
  lng: number | null;
  interactive?: boolean;
  zoom?: number;
  onPick?: (lat: number, lng: number) => void;
};

export default function MapImpl({
  lat,
  lng,
  interactive = false,
  zoom = 13,
  onPick,
}: MapImplProps) {
  const hasPoint = lat != null && lng != null;
  const center: [number, number] = hasPoint ? [lat, lng] : RIYADH;

  return (
    <MapContainer
      center={center}
      zoom={hasPoint ? zoom : 5}
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
