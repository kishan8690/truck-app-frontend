export interface Location {
  lat: number;
  lng: number;
}

export interface DriverLocationContextValue {
  location: Location | null;
  setCurrentTripId: (tripId: string | null) => void;
}

export interface GoogleMapProps {
  lat: number;
  lng: number;
  zoom?: number;
}

export interface LocationDropdown {
  locationSID: string;
  locationName: string;
}

export interface addLocation{
  locationName: string;
  latitude: number;
  longitude: number;
}

export interface LocationDetail {
  locationSID: string;
  locationName: string;
  latitude: number;
  longitude: number;
  status?: number;
  statusName?: string;
}
