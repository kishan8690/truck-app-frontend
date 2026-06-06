import { TripUpdateStatus } from "./enums";

export interface Trip {
  tripSID: string;
  startLocationName?: string;
  driverName?: string | null;
  toLocationName?: string;
  startLatitude?: number;
  startLongitude?: number;
  toLatitude?: number;
  toLongitude?: number;
  driverLatitude: number;
  driverLongitude: number;
  tripStatus?: number;
  tripStatusName: string;
  createdByName?: string;
  lastModifiedDate?: string;
}


export interface TripUpdate {
  tripUpdatesSID: string;
  driverName: string;
  tripUpdatesStatus: TripUpdateStatus;
  tripUpdatedLatitude: number;
  tripUpdatedLongitude: number;
  note: string;
  timeStamp: string;
};

export interface AddTripRequest {
  startLatitude: number;
  startLongitude: number;
  toLatitude: number;
  toLongitude: number;
  startLocationSID: string;
  toLocationSID: string;
  driverSID: string;
  // userSID: string;
}


export interface TripTileCount {
  totalNumberOfTrips: number;
  inProgressTrips: number;
  completedTrips: number;
  pendingTrips: number;
}