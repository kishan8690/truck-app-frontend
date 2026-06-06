import { Role } from "../types/enums";

export interface DriverDropdown {
  userSID: string;
  userName: string;
}

export interface DriverDetail{
  userSID: string;
  UserSID?: string;
  userName: string;
  phoneNumber: string;
  userEmail: string;
  status: number;
  statusName: string;
  createdDate?: string;
  lastModifiedDate?: string;
}
export interface AuthUser {
  token: string;
  role: Role;
}
