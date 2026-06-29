"use client";

import dynamic from "next/dynamic";
import type { MapImplProps } from "./map-impl";

// تحميل الخريطة على المتصفح فقط (Leaflet يحتاج window).
const MapImpl = dynamic(() => import("./map-impl"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-brand-teal/5" />,
});

export function LeafletMap(props: MapImplProps) {
  return <MapImpl {...props} />;
}
