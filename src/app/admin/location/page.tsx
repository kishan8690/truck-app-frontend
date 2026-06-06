"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ConfirmationModal from "@/cmp/ConfirmationModal";
import AddLocation from "@/cmp/form/AddLocation";
import { LocationDetail } from "@/types/locationTypes";
import { useLocationService } from "@/api/locationServices"; 

export default function LocationListPage() {
  const locationService = useLocationService();
  const [locations, setLocations] = useState<LocationDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isLoading?: boolean;
    isDanger?: boolean;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await locationService.getLocations();
      
      if ((data as any).result && Array.isArray((data as any).result)) {
          setLocations((data as any).result);
      } else if (Array.isArray(data)) {
          setLocations(data as unknown as LocationDetail[]);
      } else {
          setLocations([]);
      }
    } catch (error) {
      console.error("Failed to fetch locations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenActionId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleAction = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    setOpenActionId(prev => prev === id ? null : id);
  };

  const handleDelete = async (id: string) => {
    setOpenActionId(null);
    setConfirmModal({
      isOpen: true,
      title: "Delete Location",
      message: "Are you sure you want to delete this location? This action cannot be undone.",
      isDanger: true,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        try {
          await locationService.deleteLocation(id);
          fetchLocations();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error("Failed to delete location", error);
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Locations</h1>
          <button
            type="button"
            onClick={() => setShowAddLocation(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Add Location
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-visible">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3">Location Name</th>
                <th className="px-6 py-3">Latitude</th>
                <th className="px-6 py-3">Longitude</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading locations...</td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No locations found.</td>
                </tr>
              ) : (
                locations.map((loc) => {
                  const locationId = loc.locationSID;
                  return (
                  <tr key={locationId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{loc.locationName}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{loc.latitude}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{loc.longitude}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="relative inline-flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => toggleAction(e, locationId)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                        >
                          <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {openActionId === locationId && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[100] py-1">
                            <button
                              type="button"
                              onClick={() => handleDelete(locationId)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        isLoading={confirmModal.isLoading}
        isDanger={confirmModal.isDanger}
      />

      {showAddLocation && (
        <AddLocation 
          onClose={() => setShowAddLocation(false)} 
          onSuccess={() => {
            setShowAddLocation(false);
            fetchLocations();
          }} 
        />
      )}
    </div>
  );
}