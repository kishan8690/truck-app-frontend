"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useTripService } from "@/api/tripServices";
import { useUserService } from "@/api/userServices";
import { useLocationService } from "@/api/locationServices";
import { AddTripRequest } from "@/types/tripTypes";
import { DriverDropdown } from "@/types/userTypes";
import { LocationDropdown } from "@/types/locationTypes";

interface AddTripFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function AddTripForm({ onSuccess, onClose }: AddTripFormProps) {
  const [formData, setFormData] = useState<AddTripRequest>({
    startLatitude: 0,
    startLongitude: 0,
    toLatitude: 0,
    toLongitude: 0,
    startLocationSID: "",
    toLocationSID: "",
    driverSID: "",
  });

  const [drivers, setDrivers] = useState<DriverDropdown[]>([]);
  const [locations, setLocations] = useState<LocationDropdown[]>([]);
  const [loading, setLoading] = useState(false);

  const tripService = useTripService();
  const userService = useUserService();
  const locationService = useLocationService();

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [driverData, locationData] = await Promise.all([
          userService.getDriversDropDown(),
          locationService.getLocations(),
        ]);

        setDrivers(driverData);
        setLocations(locationData);
      } catch (err) {
        console.error("Error fetching dropdowns:", err);
      }
    };

    const userSID = Cookies.get("userSID");
    if (userSID) {
      setFormData((prev) => ({ ...prev, userSID }));
    }

    fetchDropdowns();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Auto fill start location coordinates
    if (name === "startLocationSID") {
      const selectedLocation = locations.find(
        (loc) => loc.locationSID === value
      );

      setFormData((prev) => ({
        ...prev,
        startLocationSID: value,
        startLatitude: selectedLocation?.latitude ?? 0,
        startLongitude: selectedLocation?.longitude ?? 0,
      }));
      return;
    }

    // Auto fill destination coordinates
    if (name === "toLocationSID") {
      const selectedLocation = locations.find(
        (loc) => loc.locationSID === value
      );

      setFormData((prev) => ({
        ...prev,
        toLocationSID: value,
        toLatitude: selectedLocation?.latitude ?? 0,
        toLongitude: selectedLocation?.longitude ?? 0,
      }));
      return;
    }

    // Normal input handling
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData((prev) => ({
      ...prev,
      startLatitude: 0,
      startLongitude: 0,
      toLatitude: 0,
      toLongitude: 0,
      startLocationSID: "",
      toLocationSID: "",
      driverSID: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await tripService.addTrip(formData);
      resetForm();
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error adding trip:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Trip</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Driver Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assign Driver
              </label>
              <select
                name="driverSID"
                value={formData.driverSID}
                onChange={handleChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a driver...</option>
                {drivers.map((driver) => (
                  <option key={driver.userSID} value={driver.userSID}>
                    {driver.userName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Location */}
              <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Start Point
                </h4>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Location Name</label>
                  <select
                    name="startLocationSID"
                    value={formData.startLocationSID}
                    onChange={handleChange}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select location...</option>
                    {locations
                      .filter((loc) => loc.locationSID !== formData.toLocationSID)
                      .map((loc) => (
                        <option key={loc.locationSID} value={loc.locationSID}>
                          {loc.locationName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Destination Location */}
              <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Destination
                </h4>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Location Name</label>
                  <select
                    name="toLocationSID"
                    value={formData.toLocationSID}
                    onChange={handleChange}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select location...</option>
                    {locations
                      .filter((loc) => loc.locationSID !== formData.startLocationSID)
                      .map((loc) => (
                        <option key={loc.locationSID} value={loc.locationSID}>
                          {loc.locationName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Trip"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
