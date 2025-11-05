'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from './button';
import { Navigation } from 'lucide-react';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface LeafletMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLat?: number;
  selectedLng?: number;
  height?: string;
  className?: string;
}

export function LeafletMap({ 
  onLocationSelect, 
  selectedLat, 
  selectedLng, 
  height = '300px',
  className = ''
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [findingLocation, setFindingLocation] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Default location: Jakarta, Indonesia
  const defaultLat = -6.2088;
  const defaultLng = 106.8456;

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current || mapInitialized) return;

    // Initialize map with Indonesia default location
    const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 10);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add click listener
    map.on('click', function(e) {
      const { lat, lng } = e.latlng;
      
      // Remove existing marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
      
      // Add new marker
      markerRef.current = L.marker([lat, lng]).addTo(map);
      
      // Call callback
      onLocationSelect(lat, lng);
    });

    mapInstanceRef.current = map;
    setMapInitialized(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapInitialized(false);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]); // Only depend on isClient to prevent reinitialization

  // Update marker when coordinates change externally
  useEffect(() => {
    if (mapInstanceRef.current && selectedLat && selectedLng) {
      // Remove existing marker
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
      }
      
      // Add new marker
      markerRef.current = L.marker([selectedLat, selectedLng]).addTo(mapInstanceRef.current);
      
      // Center map on new coordinates
      mapInstanceRef.current.setView([selectedLat, selectedLng], 13);
    }
  }, [selectedLat, selectedLng]);

  // Find user's current location
  const findMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setFindingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (mapInstanceRef.current) {
          // Remove existing marker
          if (markerRef.current) {
            mapInstanceRef.current.removeLayer(markerRef.current);
          }
          
          // Add new marker
          markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
          
          // Center map on user location
          mapInstanceRef.current.setView([lat, lng], 15);
          
          // Call callback
          onLocationSelect(lat, lng);
        }
        
        setFindingLocation(false);
      },
      (error) => {
        console.error('Error finding location:', error);
        alert('Unable to find your location. Please check your browser permissions.');
        setFindingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Show loading while SSR
  if (!isClient) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex justify-end">
          <div className="w-10 h-10 bg-muted animate-pulse rounded-md" />
        </div>
        <div 
          style={{ height, width: '100%' }}
          className="rounded-lg border bg-muted animate-pulse flex items-center justify-center"
        >
          <span className="text-muted-foreground">Loading map...</span>
        </div>
        <div className="h-4 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Find My Location Control */}
      <div className="flex justify-end">
        <Button 
          onClick={findMyLocation}
          disabled={findingLocation}
          size="sm"
          variant="outline"
          className="px-3"
        >
          {findingLocation ? (
            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }}
        className="rounded-lg border shadow-sm"
      />
      
      {/* Instructions */}
      <p className="text-xs text-muted-foreground">
        📍 Click on the map to set location or use &quot;Find My Location&quot; button
      </p>
    </div>
  );
}
