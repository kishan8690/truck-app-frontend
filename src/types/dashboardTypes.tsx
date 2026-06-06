
export interface DashboardStats {
  totalNumberOfTrips: number;
  inProgressTrips: number;
  completedTrips: number;
  pendingTrips: number;
  numberOfDriver: number;
}

export interface TripsPerDay {
  date: string;
  totalTrips: number;
}

export interface TripsPerDriver {
  driverName: string;
  assignedTrips: number;
}

export interface DashboardBarChartData {
  tripsPerDayData: TripsPerDay[];
  tripsPerDriverData: TripsPerDriver[];
}
