"use client";

import React, { useEffect, useRef, useState } from "react";

export interface LocationData {
  name: string;
  lat: number;
  lng: number;
}

interface MapLocationPickerProps {
  onSelectLocation: (location: LocationData) => void;
  defaultLat?: number;
  defaultLng?: number;
}

export default function MapLocationPicker({
  onSelectLocation,
  defaultLat = 40.7128, // Default latitude (e.g., New York)
  defaultLng = -74.0060, // Default longitude
}: MapLocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const initialized = useRef(false);

  // Use a ref to always call the latest onSelectLocation without re-running effects
  const onSelectLocationRef = useRef(onSelectLocation);
  useEffect(() => {
    onSelectLocationRef.current = onSelectLocation;
  }, [onSelectLocation]);

  useEffect(() => {
    if (!mapRef.current || initialized.current) return;

    const initMap = () => {
      // Ensure both the core map script and the map container are ready
      if (!window.google || !window.google.maps) return false;
      
      initialized.current = true;
      const initialMap = new window.google.maps.Map(mapRef.current!, {
        center: { lat: defaultLat, lng: defaultLng },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
      });

      const initialMarker = new window.google.maps.Marker({
        map: initialMap,
        position: { lat: defaultLat, lng: defaultLng },
        draggable: true,
      });

      setMap(initialMap);
      setMarker(initialMarker);

      // Update location when the marker is dragged and dropped
      initialMarker.addListener("dragend", () => {
        const position = initialMarker.getPosition();
        if (position) reverseGeocode(position.lat(), position.lng());
      });

      // Move marker and update location when clicking on the map
      initialMap.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          initialMarker.setPosition(e.latLng);
          reverseGeocode(e.latLng.lat(), e.latLng.lng());
        }
      });

      // Automatically get the address for the default location on initial load
      reverseGeocode(defaultLat, defaultLng);
      return true;
    };

    if (!initMap()) {
      // Retry until script is loaded
      const interval = setInterval(() => {
        if (initMap()) clearInterval(interval);
      }, 300);
      return () => clearInterval(interval);
    }
  }, [defaultLat, defaultLng]);

  // Setup Places Autocomplete for the search input
  useEffect(() => {
    if (!searchInputRef.current || !map || !window.google || !window.google.maps.places) return;

    const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current);
    autocomplete.bindTo("bounds", map);

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const name = place.name || place.formatted_address || "Selected Location";

      if (marker) marker.setPosition(place.geometry.location);
      
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
      }

      onSelectLocationRef.current({ name, lat, lng });
    });
  }, [map, marker]);

  // Get human-readable address from coordinates
  const reverseGeocode = (lat: number, lng: number) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      let name = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      
      if (status === "OK" && results && results[0]) {
        name = results[0].formatted_address;
      }
      
      if (searchInputRef.current) searchInputRef.current.value = name;
      onSelectLocationRef.current({ name, lat, lng });
    });
  };

  return (
    <div className="relative w-full h-[400px] rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden shadow-inner">
      <div className="absolute top-3 left-3 right-3 sm:left-1/2 sm:right-auto sm:w-11/12 sm:max-w-md sm:-translate-x-1/2 z-10">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search for a location..."
          className="w-full px-4 py-3 bg-white text-gray-900 border-0 rounded-lg shadow-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all sm:text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
        />
      </div>
      <div ref={mapRef} className="w-full h-full"></div>
    </div>
  );
}