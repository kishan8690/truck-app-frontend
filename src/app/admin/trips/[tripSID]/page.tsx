"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import GoogleMap from "@/cmp/GoogleMap";
import {useTripService} from "@/api/tripServices";
import { Trip, TripUpdate } from "@/types/tripTypes";
import { TripStatus, TripUpdateStatus } from "@/types/enums";
import Script from "next/script";


export default function AdminTripDetailPage() {
  const params = useParams();
  const tripSID = params.tripSID as string | undefined;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [updates, setUpdates] = useState<TripUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mapRef = useRef<any>(null);
  const currentLocationRef = useRef<{ lat: number; lng: number }>({ lat: 0, lng: 0 });

  const tripService = useTripService();

  useEffect(() => {
    if (!tripSID) {
      setError("Trip ID not found");
      return;
    }

    let interval: NodeJS.Timeout;

    const fetchTrip = async () => {
      try {
        const data = await tripService.getTripBySID(tripSID);

        if (!data) {
          setError("Trip not found");
          setTrip(null);
          return;
        }

        setTrip(data);
        setError(null);

        if (data.tripStatus === TripStatus.InProgress) {
          const locationData = await tripService.getTripCurrentLocation(tripSID);

          const lat = Number(locationData.driverLatitude || 0);
          const lng = Number(locationData.driverLongitude || 0);

          currentLocationRef.current = { lat, lng };

          if (mapRef.current) {
            mapRef.current.updatePosition(lat, lng);
          }
        }

        if (
          data.tripStatus === TripStatus.InProgress ||
          data.tripStatus === TripStatus.Completed
        ) {
          const tripUpdates = await tripService.getTripUpdates(tripSID);
          setUpdates(tripUpdates);
        } else {
          setUpdates([]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch trip");
        setTrip(null);
      }
    };

    fetchTrip();
    interval = setInterval(fetchTrip, 5000);

    return () => clearInterval(interval);
  }, [tripSID]);

  const getStatusColor = (statusName: string | undefined) => {
    const status = statusName?.toLowerCase() || "";
    if (status.includes("pending")) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    if (status.includes("progress")) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    if (status.includes("completed")) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
        <p className="text-red-500">{error}</p>
      </div>
    </div>
  );

  if (!trip) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-indigo-600 rounded-full mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading trip details...</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trip Details</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ID: {trip.tripSID}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Map & Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="font-semibold text-gray-900 dark:text-white">Live Tracking</h2>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(trip.tripStatusName)}`}>
                  {trip.tripStatusName}
                </span>
              </div>
              <div className="h-[500px] w-full relative">
                <GoogleMap
                  ref={mapRef}
                  lat={currentLocationRef.current.lat}
                  lng={currentLocationRef.current.lng}
                  zoom={15}
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Info & History */}
          <div className="space-y-6">
            {/* Trip Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Trip Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Driver</label>
                  <div className="flex items-center mt-1">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-sm mr-3">
                      {trip.driverName?.charAt(0) || "U"}
                    </div>
                    <p className="text-gray-900 dark:text-white font-medium">{trip.driverName ?? "N/A"}</p>
                  </div>
                </div>

                <div className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-6">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Start Location</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{trip.startLocationName ?? "N/A"}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {trip.startLatitude && trip.startLongitude ? `${trip.startLatitude}, ${trip.startLongitude}` : ""}
                    </p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white dark:border-gray-800"></span>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Destination</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{trip.toLocationName ?? "N/A"}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {trip.toLatitude && trip.toLongitude ? `${trip.toLatitude}, ${trip.toLongitude}` : ""}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Last Updated</label>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {trip.lastModifiedDate ? new Date(trip.lastModifiedDate).toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* History Card */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Timeline</h2>
              <div className="flow-root">
                <ul role="list" className="-mb-8">
                  {updates.length > 0 ? (
                    updates.map((u, eventIdx) => (
                      <li key={u.tripUpdatesSID}>
                        <div className="relative pb-8">
                          {eventIdx !== updates.length - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 ${
                                u.tripUpdatesStatus === TripUpdateStatus.Start ? 'bg-green-500' :
                                u.tripUpdatesStatus === TripUpdateStatus.End ? 'bg-blue-500' :
                                'bg-gray-500'
                              }`}>
                                <span className="text-white text-xs font-bold">
                                  {TripUpdateStatus[u.tripUpdatesStatus][0]}
                                </span>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-900 dark:text-white font-medium">
                                  {TripUpdateStatus[u.tripUpdatesStatus]} <span className="text-gray-500 font-normal">by {u.driverName}</span>
                                </p>
                                {u.note && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{u.note}</p>}
                              </div>
                              <div className="text-right text-xs whitespace-nowrap text-gray-500 dark:text-gray-400">
                                {new Date(u.timeStamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                <div className="text-[10px]">{new Date(u.timeStamp).toLocaleDateString()}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      {trip.tripStatus === TripStatus.Pending ? "Trip is pending start." : "No updates recorded."}
                    </li>
                  )}
                </ul>
              </div>
            </div>
        </div>
      </div>

      <Script
  src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`}
  strategy="afterInteractive"
/>

    </div>
  );
}
