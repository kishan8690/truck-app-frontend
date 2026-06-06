"use client";

import { Trip, TripUpdate, AddTripRequest, TripTileCount } from "@/types/tripTypes";
import { Location } from "@/types/locationTypes";
import { TripStatus, TripUpdateStatus } from "@/types/enums";
import { useFetchWithAuth } from "../auth/fetchWithAuth";
import { createApiCall } from "@/common/createApiCall";

const BaseUrl: string = process.env.NEXT_PUBLIC_BASE_URL!;
const TripUrl = `${BaseUrl.replace(/\/$/, "")}/Trip`;

export function useTripService() {
  const fetchWithAuth = useFetchWithAuth();
  const apiCall = createApiCall(fetchWithAuth);

  // 🚗 1. Get Driver Current Location
  const getTripCurrentLocation = async (tripSID: string): Promise<Trip> => {
    return apiCall({
      endpoint: `Driver/GetCurrentLocation/${tripSID}`,
    });
  };

  // 📍 2. Update Driver’s Current Location
  const updateDriverCurrentLocation = async (currentTripId: string, loc: Location) => {
    return apiCall({
      endpoint: `Driver/UpdateDriverCurrentLocation/${currentTripId}`,
      method: "POST",
      data: {
        latitude: loc.lat,
        longitude: loc.lng,
      },
    });
  };

  // 🧾 3. Get Trips (with filters, pagination, etc.)
  const getDriverTrips = (payload: any) => {
    const filters: any[] = [];

    if (payload.statusFilter)
      filters.push({ key: "tripStatus", value: payload.statusFilter, condition: "=" });

    if (payload.sid)
      filters.push({ key: "UserSID", value: payload.sid, condition: "=" });

    return apiCall<{ result: Trip[]; meta: any }>({
      endpoint: `Driver/GetAllTripsOfDriver`,
      params: {
        SearchText: payload.searchText ?? "",
        Page: payload.page ?? 1,
        PageSize: payload.pageSize ?? 10,
        SortColumn: payload.sortColumn ?? "lastModifiedDate",
        SortOrder: payload.sortOrder ?? "DESC",
        ...(filters.length && { Filters: JSON.stringify(filters) }),
      },
    });
  };


  const getTrips = (payload: any) => {
    const filters: any[] = [];

    if (payload.statusFilter)
      filters.push({ key: "tripStatus", value: payload.statusFilter, condition: "=" });

    if (payload.sid)
      filters.push({ key: "UserSID", value: payload.sid, condition: "=" });

    return apiCall<{ result: Trip[]; meta: any }>({
      endpoint: `Trip`,
      params: {
        SearchText: payload.searchText ?? "",
        Page: payload.page ?? 1,
        PageSize: payload.pageSize ?? 10,
        SortColumn: payload.sortColumn ?? "lastModifiedDate",
        SortOrder: payload.sortOrder ?? "DESC",
        ...(filters.length && { Filters: JSON.stringify(filters) }),
      },
    });
  };

  const getTripTileCount = () => {
    return apiCall({
      endpoint: `Trip/TripTileCount`,
    })
  }

  const getDriverTripTileCount = () => {
    return apiCall({
      endpoint: `Trip/DriverTripTileCount`,
    })
  }


  // 🔍 4. Get Trip by SID
  const getTripBySID = async (tripSID: string): Promise<Trip | null> => {
    const data = await apiCall<{ result: Trip[] }>({
      endpoint: `Trip`,
      params: {
        Filters: JSON.stringify([{ key: "TripSID", value: tripSID, condition: "=" }]),
      },
    });

    return data?.result?.[0] ?? null;
  };


  // 🔍 4. Get Trip by SID
  const getDriverTripBySID = async (tripSID: string): Promise<Trip | null> => {
    const data = await apiCall<{ result: Trip[] }>({
      endpoint: `Driver/GetAllTripsOfDriver`,
      params: {
        Filters: JSON.stringify([{ key: "TripSID", value: tripSID, condition: "=" }]),
      },
    });

    return data?.result?.[0] ?? null;
  };



  // 🔁 5. Get Trip Updates
  const getTripUpdates = (tripSID: string) =>
    apiCall<TripUpdate[]>({
      endpoint: `Trip/GetTripUpdateStatus/${tripSID}`,
    });

  // ▶️ 6. Start Trip
  const startTrip = (tripSID: string) =>
    apiCall({
      endpoint: `Trip/TripStart/${tripSID}`,
      method: "POST",
    });


  // ⏹️ 7. End Trip
  const endTrip = (tripSID: string) =>
    apiCall({
      endpoint: `Trip/TripEnd/${tripSID}`,
      method: "POST",
    });


  // 📝 8. Add Trip Status
  const addTripStatus = (
    tripSID: string,
    status: TripUpdateStatus,
    latitude: number,
    longitude: number,
    note: string
  ) =>
    apiCall({
      endpoint: `Trip/AddTripStatus/${tripSID}`,
      method: "POST",
      data: {
        tripUpdateStatus: status,
        tripUpdatedLatitude: latitude,
        tripUpdatedLongitude: longitude,
        note,
      },
    });


  // ➕ 9. Add New Trip
  const addTrip = (trip: AddTripRequest) =>
    apiCall({
      endpoint: `Trip/AddTrip`,
      method: "POST",
      data: trip,
    });

  const deleteTrip = (tripSID: string) =>
    apiCall({
      endpoint: `Trip/DeleteTrip/${tripSID}`,
      method: "DELETE",
    });


  return {
    getTripCurrentLocation,
    updateDriverCurrentLocation,
    getTrips,
    getTripTileCount,
    getDriverTripTileCount,
    getDriverTrips,
    getTripBySID,
    getDriverTripBySID,
    getTripUpdates,
    startTrip,
    endTrip,
    addTripStatus,
    addTrip,
    deleteTrip,
  };
}
