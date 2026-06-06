"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

interface GoogleMapProps {
  lat: number;
  lng: number;
  zoom?: number;
}

const GoogleMap = forwardRef(({ lat, lng, zoom = 14 }: GoogleMapProps, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom,
      disableDefaultUI: true,
    });

    markerRef.current = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapInstanceRef.current,
      icon: {
        url: "/truck-icon.png",
        scaledSize: new window.google.maps.Size(50, 50),
      },
    });
  };

  useEffect(() => {
    if (!window.google || !window.google.maps) {
      const interval = setInterval(() => {
        if (window.google && window.google.maps) {
          initMap();
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
    
    // Initialize map if script is already loaded
    initMap();
  }, []);

  useImperativeHandle(ref, () => ({
    updatePosition: (newLat: number, newLng: number) => {
      if (mapInstanceRef.current && markerRef.current) {
        const position = new window.google.maps.LatLng(newLat, newLng);
        markerRef.current.setPosition(position);
        mapInstanceRef.current.panTo(position);
      }
    },
  }));

  return <div ref={mapRef} className="w-full h-full rounded-lg shadow-lg" />;
});

GoogleMap.displayName = "GoogleMap";

export default GoogleMap;
