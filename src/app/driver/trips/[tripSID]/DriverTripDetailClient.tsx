"use client";

import { useDriverLocation } from "@/context/DriverLocationContext";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { TripStatus, TripUpdateStatus } from "@/types/enums";
import {useTripService} from "@/api/tripServices";
import { TripUpdate, Trip } from "@/types/tripTypes";
import GoogleMap from "@/cmp/GoogleMap";

export default function DriverTripDetailPage() {
  const params = useParams();
  const tripSID = params.tripSID as string | undefined;

  const { location, setCurrentTripId } = useDriverLocation();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [updates, setUpdates] = useState<TripUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pauseNote, setPauseNote] = useState("");
  const [showPauseInput, setShowPauseInput] = useState(false);

  const mapRef = useRef<any>(null);
  const currentLocationRef = useRef<{ lat: number; lng: number }>({ lat: 0, lng: 0 });

  const tripService = useTripService();

  useEffect(() => {
    if (!tripSID) {
      setError("Trip ID not found");
      return;
    }

    let interval: NodeJS.Timeout;

    const fetchTripData = async () => {
      try {
        const tripData = await tripService.getDriverTripBySID(tripSID);

        if (!tripData) {
          setError("Trip not found");
          setTrip(null);
          return;
        }

        setTrip(tripData);
        setError(null);

        if (tripData.tripStatus === TripStatus.InProgress) {
          try {
            const locationData = await tripService.getTripCurrentLocation(tripSID);
            const lat = Number(locationData.driverLatitude || 0);
            const lng = Number(locationData.driverLongitude || 0);
            currentLocationRef.current = { lat, lng };

            if (mapRef.current) {
              mapRef.current.updatePosition(lat, lng);
            }
          } catch (e) {
            // Ignore if location fetch fails (e.g. not started yet)
          }
        }

        if (
          tripData.tripStatus === TripStatus.InProgress ||
          tripData.tripStatus === TripStatus.Completed
        ) {
          const tripUpdates = await tripService.getTripUpdates(tripSID);
          setUpdates(tripUpdates);
        } else {
          setUpdates([]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch trip");
      }
    };

    fetchTripData();
    interval = setInterval(fetchTripData, 5000);

    return () => clearInterval(interval);
  }, [tripSID]);

  const handleAction = async (action: TripUpdateStatus) => {
    try {
      if (!tripSID) return;

      if (action === TripUpdateStatus.Start) {
        await tripService.startTrip(tripSID);
        setCurrentTripId(tripSID);
      } else if (action === TripUpdateStatus.End) {
        await tripService.endTrip(tripSID);
        setCurrentTripId(null);
      } else {
        await tripService.addTripStatus(
          tripSID,
          action,
          location?.lat || 0,
          location?.lng || 0,
          action === TripUpdateStatus.Pause ? pauseNote : "Resumed"
        );
        if (action === TripUpdateStatus.Resume) setCurrentTripId(tripSID);
      }

      setPauseNote("");
      setShowPauseInput(false);
      // Refresh data immediately
      const tripData = await tripService.getDriverTripBySID(tripSID);
      if (tripData) setTrip(tripData);
    } catch (err) {
      console.error("handleAction error:", err);
    }
  };

  const getStatusColor = (statusName: string | undefined) => {
    const status = statusName?.toLowerCase() || "";
    if (status.includes("pending")) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    if (status.includes("progress")) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    if (status.includes("completed")) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  const renderButtons = () => {
    if (!trip) return null;

    if (trip.tripStatus === TripStatus.Pending) {
      return (
        <button
          onClick={() => handleAction(TripUpdateStatus.Start)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          Start Trip
        </button>
      );
    }

    if (trip.tripStatus === TripStatus.InProgress) {
      const lastUpdate = updates[0];
      if (lastUpdate?.tripUpdatesStatus === TripUpdateStatus.Pause) {
        return (
          <button
            onClick={() => handleAction(TripUpdateStatus.Resume)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            Resume Trip
          </button>
        );
      }
      return (
        <div className="flex items-center">
          {showPauseInput ? (
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <input
                type="text"
                value={pauseNote}
                onChange={(e) => setPauseNote(e.target.value)}
                placeholder="Enter pause note..."
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(TripUpdateStatus.Pause)}
                  disabled={!pauseNote.trim()}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowPauseInput(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setShowPauseInput(true)}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                Pause Trip
              </button>
              <button
                onClick={() => handleAction(TripUpdateStatus.End)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                End Trip
              </button>
            </div>
          )}
        </div>
      );
    }

    if (trip.tripStatus === TripStatus.Completed) {
      return (
        <div className="flex items-center text-gray-500 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-700/30 px-4 py-2 rounded-lg border border-gray-100 dark:border-gray-700">
          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          Trip completed
        </div>
      );
    }

    return null;
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trip Details</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ID: {trip.tripSID}</p>
          </div>
          <div>
            {renderButtons()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Map & Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="font-semibold text-gray-900 dark:text-white">Live Tracking</h2>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(trip.tripStatusName || (trip.tripStatus !== undefined ? TripStatus[trip.tripStatus] : ''))}`}>
                  {trip.tripStatusName || (trip.tripStatus !== undefined ? TripStatus[trip.tripStatus] : '')}
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

          {/* Sidebar - Info */}
          <div className="space-y-6">
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
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white dark:border-gray-800"></span>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Destination</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{trip.toLocationName ?? "N/A"}</p>
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

          {/* Timeline Card */}
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
    </div>
  );
}
