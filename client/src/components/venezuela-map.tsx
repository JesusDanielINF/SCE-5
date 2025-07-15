import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import venezuelaGeoData from "@/data/venezuela-geo.json";

declare global {
  interface Window {
    L: any;
  }
}

export function VenezuelaMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      if (!window.L) {
        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        document.head.appendChild(script);

        return new Promise((resolve) => {
          script.onload = resolve;
        });
      }
    };

    const initializeMap = async () => {
      await loadLeaflet();
      
      if (mapRef.current && window.L && !mapInstanceRef.current) {
        // Initialize map centered on Venezuela
        const map = window.L.map(mapRef.current, {
          center: [6.4238, -66.5897],
          zoom: 6,
          scrollWheelZoom: false,
        });

        // Add tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add Venezuela boundary
        if (venezuelaGeoData && venezuelaGeoData.features) {
          const geoJsonLayer = window.L.geoJSON(venezuelaGeoData, {
            style: {
              color: '#1565C0',
              weight: 2,
              fillColor: '#E3F2FD',
              fillOpacity: 0.3
            },
            onEachFeature: (feature: any, layer: any) => {
              if (feature.properties && feature.properties.name) {
                layer.bindPopup(`
                  <div class="p-2">
                    <h3 class="font-semibold">${feature.properties.name}</h3>
                    <p class="text-sm text-gray-600">Estado de Venezuela</p>
                  </div>
                `);
              }
            }
          }).addTo(map);

          // Fit map to Venezuela bounds
          map.fitBounds(geoJsonLayer.getBounds());
        }

        // Add some sample markers for voting centers
        const sampleCenters = [
          { lat: 10.4806, lng: -66.9036, name: "Centro Caracas" },
          { lat: 10.2518, lng: -67.5958, name: "Centro Valencia" },
          { lat: 10.0647, lng: -69.3136, name: "Centro Barquisimeto" },
          { lat: 8.5937, lng: -71.1561, name: "Centro Maracaibo" },
        ];

        sampleCenters.forEach(center => {
          const marker = window.L.marker([center.lat, center.lng]).addTo(map);
          marker.bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold">${center.name}</h3>
              <p class="text-sm text-gray-600">Centro de Votación</p>
              <p class="text-xs text-gray-500">Activo</p>
            </div>
          `);
        });

        mapInstanceRef.current = map;
      }
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <div 
          ref={mapRef} 
          className="w-full h-96 venezuela-map rounded-lg"
          style={{ minHeight: '400px' }}
        />
      </CardContent>
    </Card>
  );
}
