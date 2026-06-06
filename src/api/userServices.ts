// import { DriverDropdown } from "@/types/userTypes";

// const BaseUrl: string = process.env.NEXT_PUBLIC_BASE_URL! ;

// export const getDrivers = async (): Promise<DriverDropdown[]> => {
//   const res = await fetchWithAuth(`${BaseUrl}Driver/GetDrivers`);
//   if (!res.ok) throw new Error(`Failed to fetch drivers: ${res.status}`);
//   return await res.json();
// };


"use client";

import { DriverDetail, DriverDropdown } from "@/types/userTypes";
import { useFetchWithAuth } from "@/auth/fetchWithAuth";
import { createApiCall } from "@/common/createApiCall";

const BaseUrl: string = process.env.NEXT_PUBLIC_BASE_URL!;

export function useUserService() {
  const fetchWithAuth = useFetchWithAuth();
  const apiCall = createApiCall(fetchWithAuth);

  const getDriversDropDown = async (): Promise<DriverDropdown[]> => {
    return apiCall({
      endpoint: `Driver/GetDriversDropDown`,
    });
  };

  const getDriverList = async (payload: any) => {
    const filters: any[] = [];

    if (payload.statusFilter)
      filters.push({ key: "tripStatus", value: payload.statusFilter, condition: "=" });

    if (payload.sid)
      filters.push({ key: "UserSID", value: payload.sid, condition: "=" });

    return apiCall<{ result: DriverDetail[]; meta: any }>({
      endpoint: `Driver/DriverList`,
      params: {
        SearchText: payload.searchText ?? "",
        Page: payload.page ?? 1,
        PageSize: payload.pageSize ?? 10,
        SortColumn: payload.sortColumn ?? "lastModifiedDate",
        SortOrder: payload.sortOrder ?? "DESC",
        ...(filters.length && { Filters: JSON.stringify(filters) }),
      },
    });
  };

  const getDriversDetail = async (driverSid: string): Promise<DriverDetail> => {
    return apiCall({
      endpoint: `Driver/DriverDetails/${driverSid}`,
    });
  };

  const ActiveInactiveDriver = async (driverSid: string): Promise<boolean> => {
    return apiCall({
      endpoint: `Driver/ActiveInactiveDriver/${driverSid}`,
      method: "POST"
    });
  };

  const DeleteDriver = async (driverSid: string): Promise<boolean> => {
    return apiCall({
      endpoint: `Driver/DeleteDriver/${driverSid}`,
      method: "DELETE"
    });
  };

  return {
    getDriversDropDown,
    getDriverList,
    getDriversDetail,
    ActiveInactiveDriver,
    DeleteDriver
  };
}
