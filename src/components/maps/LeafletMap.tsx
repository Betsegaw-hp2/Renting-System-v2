import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Clock, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

// Helper to fetch coordinates from address using OpenStreetMap Nominatim
async function geocodeAddress(address: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data && data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      display_name: data[0].display_name,
    };
  }
  return null;
}

export interface LeafletMapProps {
  city?: string;
  region?: string;
  country?: string;
  address?: string;
  className?: string;
}

export function LeafletMap({ city, region, country, address, className }: LeafletMapProps) {
  const [coords, setCoords] = useState<{ lat: number; lon: number; display_name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const query = [address, city, region, country].filter(Boolean).join(', ');
    if (!query) return;
    setLoading(true);
    geocodeAddress(query).then((result) => {
      setCoords(result);
      setLoading(false);
    }).catch(() => {
      setCoords(null);
      setLoading(false);
    });
  }, [address, city, region, country]);

  // Loading placeholder
  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 border rounded-lg`}>
        <div className="flex flex-col items-center justify-center space-y-3 p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span className="text-sm">Loading map...</span>
          </div>
        </div>
      </div>
    );
  }

  // Location not found placeholder
  if (!coords) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-50 border rounded-lg`}>
        <div className="flex flex-col items-center justify-center space-y-3 p-8 text-center">
          <MapPin className="h-12 w-12 text-gray-400" />
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-900">Location not found</h3>
            <p className="text-xs text-gray-500">Unable to display map for this location</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={[coords.lat, coords.lon]}
      zoom={15}
      scrollWheelZoom={false}
      className={className}
      style={{ height: '200px', width: '100%', borderRadius: '12px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[coords.lat, coords.lon]} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] })}>
        <Popup>
          {coords.display_name}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
