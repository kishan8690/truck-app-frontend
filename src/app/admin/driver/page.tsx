"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUserService } from "@/api/userServices";
import { DriverDetail } from "@/types/userTypes";
import ConfirmationModal from "@/cmp/ConfirmationModal";

export default function DriverListPage() {
  const userService = useUserService();
  const [drivers, setDrivers] = useState<DriverDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState("UserName");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [totalCount, setTotalCount] = useState(0);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isLoading?: boolean;
    isDanger?: boolean;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const data = await userService.getDriverList({
        searchText,
        page,
        pageSize,
        sortColumn,
        sortOrder,
      });
      
      // Handle different API response structures
      if (data.result && Array.isArray(data.result)) {
          setDrivers(data.result);
          setTotalCount(data.meta?.totalCount || 0);
      } else if (Array.isArray(data)) {
          setDrivers(data);
          setTotalCount(data.length);
      } else {
          setDrivers([]);
      }
    } catch (error) {
      console.error("Failed to fetch drivers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setDebouncedSearchText(searchText);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    fetchDrivers();
  }, [page, pageSize, sortColumn, sortOrder, debouncedSearchText]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenActionId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleAction = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.nativeEvent.stopImmediatePropagation();
    // If clicking the same one, close it. If clicking a different one, open that one.
    setOpenActionId(prev => prev === id ? null : id);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortColumn(column);
      setSortOrder("ASC");
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    setOpenActionId(null);
    const action = currentStatus === 'Active' ? 'deactivate' : 'activate';
    setConfirmModal({
      isOpen: true,
      title: `${action === 'activate' ? 'Activate' : 'Deactivate'} Driver`,
      message: `Are you sure you want to ${action} this driver?`,
      isDanger: action === 'deactivate',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        try {
          await userService.ActiveInactiveDriver(id);
          fetchDrivers(); // Refresh list
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error("Failed to update status", error);
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  const handleDelete = async (id: string) => {
    setOpenActionId(null);
    setConfirmModal({
      isOpen: true,
      title: "Delete Driver",
      message: "Are you sure you want to delete this driver? This action cannot be undone.",
      isDanger: true,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        try {
          await userService.DeleteDriver(id);
          fetchDrivers();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error("Failed to delete driver", error);
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Drivers</h1>
          {/* <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Add Driver
          </button> */}
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-visible">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th
                  className="px-6 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                  onClick={() => handleSort("UserName")}
                >
                  Name {sortColumn === "UserName" && (sortOrder === "ASC" ? "↑" : "↓")}
                </th>
                {/* <th
                  className="px-6 py-3 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none"
                  onClick={() => handleSort("UserEmail")}
                >
                  Email {sortColumn === "UserEmail" && (sortOrder === "ASC" ? "↑" : "↓")}
                </th> */}
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading drivers...</td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No drivers found.</td>
                </tr>
              ) : (
                drivers.map((driver) => {
                  const driverId = driver.userSID || driver.UserSID || "";
                  return (
                  <tr key={driverId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{driver.userName}</td>
                    {/* <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{driver.userEmail}</td> */}
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{driver.phoneNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        driver.statusName === 'Active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {driver.statusName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="relative inline-flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/driver/${driverId}`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                        >
                          View
                        </Link>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <button
                          type="button"
                          onClick={(e) => toggleAction(e, driverId)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                        >
                          <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {openActionId === driverId && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[100] py-1">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(driverId, driver.statusName)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              {driver.statusName === 'Active' ? (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                  Inactive
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                  Active
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(driverId)}
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

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <button
              disabled={page === 1 || loading}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
          >
              Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {page}
          </span>
          <button
              disabled={drivers.length < pageSize || loading}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
          >
              Next
          </button>
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
    </div>
  );
}
