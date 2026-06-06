"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUserService } from "@/api/userServices";
import { DriverDetail } from "@/types/userTypes";

export default function DriverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userService = useUserService();
  const driverSID = params.driverSID as string;
  const [driver, setDriver] = useState<DriverDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!driverSID) return;

    const fetchDriver = async () => {
      try {
        setLoading(true);
        const driversDetail = await userService.getDriversDetail(driverSID);
          setDriver(driversDetail);
        } catch (err: any) {
        setError(err.message || "Failed to load driver details");
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, [driverSID]);

  if (loading) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading driver details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900 p-6 flex flex-col items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 text-indigo-600 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!driver) return null;

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Driver Details</h1>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{driver.userName}</p>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{driver.userEmail}</p>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone Number</label>
              <p className="text-lg font-medium text-gray-900 dark:text-white">{driver.phoneNumber || "N/A"}</p>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account Status</label>
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    driver.statusName === 'Active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                    {driver.statusName}
                </span>
              </div>
            </div>
            
            <div className="space-y-1 border-t border-gray-200 dark:border-gray-800 pt-4 md:border-0 md:pt-0">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created Date</label>
              <p className="text-base text-gray-700 dark:text-gray-300">
                {driver.createdDate ? new Date(driver.createdDate).toLocaleString() : 'N/A'}
              </p>
            </div>
            
            <div className="space-y-1 border-t border-gray-200 dark:border-gray-800 pt-4 md:border-0 md:pt-0">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Modified</label>
              <p className="text-base text-gray-700 dark:text-gray-300">
                {driver.lastModifiedDate ? new Date(driver.lastModifiedDate).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
