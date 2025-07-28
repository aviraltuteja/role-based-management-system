export enum Locations {
  EUROPE = "EUROPE",
  INDIA = "INDIA",
  NORTH_AMERICA = "NORTH_AMERICA",
}

export enum Roles {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  USER = "USER",
}

export interface User {
  username: string;
  full_name: string;
  role: Roles;
  location: Locations;
  team: string;
  disabled: boolean;
}
export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  user_id?: string | null;
}
export interface UserTableRow {
  id: string;
  username: string;
  full_name?: string;
  role?: string;
  location?: string;
  team?: string;
  disabled: boolean;
  created_at: string;
}
