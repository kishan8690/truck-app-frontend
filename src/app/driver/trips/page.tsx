"use client";

import { useEffect, useState } from "react";
import { useTripService } from "@/api/tripServices";
import { Trip,TripTileCount } from "@/types/tripTypes";
import Link from "next/link";
import { TripStatus } from "@/types/enums";

export default function DriverTripListPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [sortColumn, setSortColumn] = useState("lastModifiedDate");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [statusFilter, setStatusFilter] = useState<TripStatus | "" | string>("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tileStats, setTileStats] = useState<TripTileCount | null>(null);

  const tripService = useTripService();

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await tripService.getDriverTrips({
        searchText,
        sortColumn,
        sortOrder,
        page,
        pageSize: 10,
        statusFilter: statusFilter as TripStatus | "",
      });
      setTrips(data.result);
      setTotalPages(data.meta?.total_page_num ?? 1);
      setError(null);
    } catch (err: any) {
      console.error("UI error fetching trips:", err);
      setError(err.message || "Failed to fetch trips");
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTileStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await tripService.getDriverTripTileCount();
      setTileStats(response as TripTileCount);
    } catch (err) {
      console.error("Error fetching tile stats:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTileStats();
  }, [searchText, sortColumn, sortOrder, page, statusFilter]);

  const getStatusColor = (statusName: string | undefined) => {
    const status = statusName?.toLowerCase() || "";
    if (status.includes("pending")) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    if (status.includes("progress")) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    if (status.includes("completed")) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortColumn(column);
      setSortOrder("ASC");
    }
  };

  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) 
    return <span className="ml-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrows-vertical" viewBox="0 0 16 16">
              <path d="M8.354 14.854a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7.5 13.293V2.707L6.354 3.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 2.707v10.586l1.146-1.147a.5.5 0 0 1 .708.708z"/>
            </svg>
    </span>;
    return sortOrder === "ASC" ? 
    <span className="ml-1 ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"/>
      </svg>
    </span> : 
    <span className="ml-1 ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-down" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
      </svg>
    </span>;
  };

  // Shared grid column definition to ensure alignment between header and body
  const gridCols = "grid-cols-[2fr_2.5fr_1fr_1.5fr_120px]";

  const tiles = [
    { 
      title: "Total Trips", 
      value: tileStats?.totalNumberOfTrips, 
      icon: "🚛",
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
      tooltip: "Total number of trips in the system"
    },
    { 
      title: "In Progress", 
      value: tileStats?.inProgressTrips, 
      icon: "⏳",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      tooltip: "Number of trips currently in progress"
    },
    { 
      title: "Completed", 
      value: tileStats?.completedTrips, 
      icon: "✅",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      tooltip: "Number of successfully completed trips"
    },
    { 
      title: "Pending", 
      value: tileStats?.pendingTrips, 
      icon: "🕒",
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      tooltip: "Number of trips waiting to start"
    },
  ];

  return (
    <div className="h-full p-4 sm:p-6 flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto w-full h-full flex flex-col gap-6">
        <div className="flex-none flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Trips</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and manage your assigned trips.</p>
            </div>
          </div>

          {/* Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((tile, index) => (
          <div 
            key={index} 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{tile.title}</p>
                  <div className="relative group">
                    <span className="cursor-default text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-default">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    </span>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                      {tile.tooltip}
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{tile.value ?? 0}</h3>
              </div>
              <div className={`p-3 rounded-lg ${tile.bgColor} ${tile.color}`}>
                <span className="text-xl">{tile.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Search trips..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value ? Number(e.target.value) : "");
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">All Statuses</option>
                <option value={TripStatus.Pending}>Pending</option>
                <option value={TripStatus.InProgress}>In Progress</option>
                <option value={TripStatus.Completed}>Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="flex-1 min-h-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          {loading && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-indigo-600 rounded-full mb-2"></div>
              <p>Loading trips...</p>
            </div>
          )}
          
          {error && (
            <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/20">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Table Header - Fixed */}
              <div className={`grid ${gridCols} gap-4 px-6 py-4 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex-none`}>
                {/* <div 
                  className="cursor-pointer group select-none hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center"
                  onClick={() => handleSort("driverName")}
                >
                  Driver {renderSortIcon("driverName")}
                </div> */}
                <div 
                  className="cursor-pointer group select-none hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center"
                  onClick={() => handleSort("startLocationName")}
                >
                  Route {renderSortIcon("startLocationName")}
                </div>
                <div 
                  className="cursor-pointer group select-none hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center"
                  onClick={() => handleSort("TripStatus")}
                >
                  Status {renderSortIcon("TripStatus")}
                </div>
                <div 
                  className="cursor-pointer group select-none hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center"
                  onClick={() => handleSort("lastModifiedDate")}
                >
                  Last Update {renderSortIcon("lastModifiedDate")}
                </div>
                <div className="text-right">Actions</div>
              </div>

              {/* Table Body - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {trips.map((trip) => (
                    <div key={trip.tripSID} className={`grid ${gridCols} gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors items-center`}>
                      {/* <div className="flex items-center min-w-0">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-sm mr-3 flex-shrink-0">
                          {trip.driverName?.charAt(0) || "U"}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{trip.driverName || "Unknown Driver"}</span>
                      </div> */}
                      
                      <div className="flex flex-col space-y-1 min-w-0">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <span className="w-2 h-2 rounded-full bg-green-500 mr-2 flex-shrink-0"></span>
                          <span className="truncate" title={trip.startLocationName}>{trip.startLocationName}</span>
                        </div>
                        <div className="border-l-2 border-gray-200 dark:border-gray-600 h-3 ml-1"></div>
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <span className="w-2 h-2 rounded-full bg-red-500 mr-2 flex-shrink-0"></span>
                          <span className="truncate" title={trip.toLocationName}>{trip.toLocationName}</span>
                        </div>
                      </div>

                      <div>
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(trip.tripStatusName)}`}>
                          {trip.tripStatusName}
                        </span>
                      </div>

                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {trip.lastModifiedDate ? new Date(trip.lastModifiedDate).toLocaleString() : "-"}
                      </div>

                      <div className="text-right text-sm font-medium">
                        <Link href={`trips/${trip.tripSID}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                  {trips.length === 0 && (
                    <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No trips found matching your criteria.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && (
            <div className="flex-none px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}