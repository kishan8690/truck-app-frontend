// src/api/dashboardServices.ts

"use client";

import { useFetchWithAuth } from "@/auth/fetchWithAuth";
import { createApiCall } from "@/common/createApiCall";
import { DashboardBarChartData, DashboardStats } from "@/types/dashboardTypes";

export function useDashboardService() {
  const fetchWithAuth = useFetchWithAuth();
  const apiCall = createApiCall(fetchWithAuth);

  const getAdminDashboardStats = async (): Promise<DashboardStats> => {
    return apiCall({
      endpoint: `Dashboard/AdminDashboard`,
    });
  };

  const getAdminDashboardBarChart = async (startDate: string, endDate: string): Promise<DashboardBarChartData> => {
    return apiCall({
      endpoint: `Dashboard/AdminDashBoardBarChart?StartDate=${startDate}&EndDate=${endDate}`,
    });
  };

  return {
    getAdminDashboardStats,
    getAdminDashboardBarChart,
  };
}
