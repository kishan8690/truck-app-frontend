import { useState } from "react";
import MapLocationPicker, { LocationData } from "@/cmp/MapLocationPicker";
import { useLocationService } from "@/api/locationServices";

interface AddLocationProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddLocation({ onClose, onSuccess }: AddLocationProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const locationService = useLocationService();

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLocation) {
      try {
        setIsSaving(true);
        await locationService.addLocations({
          locationName: selectedLocation.name,
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
        });
        if (onSuccess) onSuccess();
        else onClose();
      } catch (error) {
        console.error("Failed to add location:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add a New Location</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location Details
              </label>
              <MapLocationPicker onSelectLocation={handleLocationSelect} />
            </div>

            {selectedLocation && (
              <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                <p><span className="font-medium">Selected:</span> {selectedLocation.name}</p>
                <p><span className="font-medium">Latitude:</span> {selectedLocation.lat.toFixed(6)}</p>
                <p><span className="font-medium">Longitude:</span> {selectedLocation.lng.toFixed(6)}</p>
              </div>
            )}
            
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
                disabled={!selectedLocation || isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? "Saving..." : "Save Location"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
