import { useEffect, useRef } from 'react';
import type { Itinerary } from '../../types/index.js';

interface Props {
  itinerary: Itinerary;
  activeDay: number;
}

type LeafletMap = {
  setView: (coords: [number, number], zoom: number) => LeafletMap;
  fitBounds: (bounds: unknown, opts: unknown) => void;
  remove: () => void;
};

let leafletCssAdded = false;

export function RouteMap({ itinerary, activeDay }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      if (!leafletCssAdded) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        leafletCssAdded = true;
      }

      const L = (await import('leaflet')).default;
      if (!mounted || !mapRef.current) return;

      const validDays = itinerary.days.filter((d) => d.coordinates);
      if (!validDays.length) return;

      const first = validDays[0]!;
      const { lat, lng } = first.coordinates!;

      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true });
      map.setView([lat, lng], 6);
      mapInstanceRef.current = map as unknown as LeafletMap;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      const routeCoords: [number, number][] = [];

      validDays.forEach((day) => {
        if (!day.coordinates) return;
        const coords: [number, number] = [day.coordinates.lat, day.coordinates.lng];
        routeCoords.push(coords);

        const isActive = day.day === activeDay;
        const color = isActive ? '#f97316' : '#94a3b8';
        const size = isActive ? 28 : 22;

        const icon = L.divIcon({
          html: `<div style="
            width:${size}px;height:${size}px;background:${color};
            border:2px solid white;border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            color:white;font-size:${isActive ? 12 : 10}px;font-weight:bold;
            box-shadow:0 2px 6px rgba(0,0,0,0.3);">${day.day}</div>`,
          className: '',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        L.marker(coords, { icon })
          .bindPopup(`
            <div style="min-width:160px;font-family:system-ui,sans-serif">
              <div style="font-weight:700;color:#1f2937;font-size:13px">Day ${day.day}: ${day.location}</div>
              <div style="color:#6b7280;font-size:11px;margin-top:2px">${day.theme}</div>
              <div style="margin-top:6px;padding-top:6px;border-top:1px solid #e5e7eb;font-size:11px;color:#374151">
                Budget: <strong>₹${day.dailyBudget.total.toLocaleString('en-IN')}</strong>
              </div>
            </div>`, { maxWidth: 200 })
          .addTo(map);
      });

      if (routeCoords.length > 1) {
        L.polyline(routeCoords, {
          color: '#f97316',
          weight: 2.5,
          opacity: 0.7,
          dashArray: '6, 8',
        }).addTo(map);
      }

      if (routeCoords.length > 0) {
        const bounds = L.latLngBounds(routeCoords);
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    };

    init().catch(console.error);

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [itinerary, activeDay]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-100" style={{ height: '260px' }}>
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-sm text-xs text-gray-600 font-medium pointer-events-none z-[1000]">
        {itinerary.trip.destinations.join(' → ')}
      </div>
    </div>
  );
}
