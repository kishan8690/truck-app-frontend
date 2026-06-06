"use client";

import { createContext, useEffect, useState, useContext } from "react";
import { Location, DriverLocationContextValue } from "@/types/locationTypes";
import { useTripService } from "@/api/tripServices";

const DriverLocationContext = createContext<DriverLocationContextValue>({
  location: null,
  setCurrentTripId: () => { },
});

export const DriverLocationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);

  const tripService = useTripService();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const updateLocation = async () => {
      if (!navigator.geolocation || !currentTripId) return;

      navigator.geolocation.getCurrentPosition(async (pos) => {
        const loc = {
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        };
        setLocation(loc);

        try {
          await tripService.updateDriverCurrentLocation(currentTripId, loc);
          console.log("Location updated:", loc);
        } catch (err) {
          console.error("Failed to update location:", err);
        }
      });
    };

    if (currentTripId) {
      updateLocation();
      interval = setInterval(updateLocation, 10000);
    }

    return () => clearInterval(interval);
  }, [currentTripId]);


  return (
    <DriverLocationContext.Provider value={{ location, setCurrentTripId }}>
      {children}
    </DriverLocationContext.Provider>
  );
};

export const useDriverLocation = () => useContext(DriverLocationContext);
