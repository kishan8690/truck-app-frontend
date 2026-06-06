"use client";

import { addLocation, LocationDropdown } from "@/types/locationTypes";
import { useFetchWithAuth } from "@/auth/fetchWithAuth";
import { createApiCall } from "@/common/createApiCall";

const BaseUrl: string = process.env.NEXT_PUBLIC_BASE_URL! ;

export function useLocationService() {
  const fetchWithAuth = useFetchWithAuth();
  const apiCall = createApiCall(fetchWithAuth);

  const getLocations = async (): Promise<LocationDropdown[]> => {
    return apiCall({
      endpoint: `Location`,
    });
  };

  const addLocations = async (location: addLocation) => {
    return apiCall({
      endpoint: `Location`,
      method: "POST",
      data: location,
    })
  }; 

  const deleteLocation = async (locationSid: string) => {
    return apiCall({
      endpoint: `Location/${locationSid}`,
      method: "DELETE",
    })
  };


  return {
    getLocations,
    addLocations,
    deleteLocation
  };
}
