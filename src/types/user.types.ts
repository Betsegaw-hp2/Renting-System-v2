import type { Location } from "./location.types";

export const UserRole = {
  ADMIN: "admin",
  TENANT: "renter",
  PROPERTY_OWNER: "owner",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/*
database.UserKYC{
backside	string
created_at	string
face	string
frontside	string
id	string
updated_at	string
user_id	string
}
*/

export interface UserKYC {
  id: string;
  user_id: string;
  frontside: string;
  backside: string;
  face: string; 
  created_at: string; 
  updated_at: string; 
}

// Role-based permissions
export const ROLE_PERMISSIONS = {
  [UserRole.TENANT]: {
    can_book_properties: true,
    can_list_properties: false,
    can_access_admin_panel: false,
    can_manage_users: false,
    can_manage_categories: false,
  },
  [UserRole.PROPERTY_OWNER]: {
    can_book_properties: false, // Owners cannot book properties
    can_list_properties: true, // Only owners can list properties
    can_access_admin_panel: false,
    can_manage_users: false,
    can_manage_categories: false,
  },
  [UserRole.ADMIN]: {
    can_book_properties: false, // Admins cannot book properties
    can_list_properties: false,
    can_access_admin_panel: true,
    can_manage_users: true,
    can_manage_categories: true,
  },
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  role: UserRole;
  profile_picture: string | null; 
  is_verified: boolean;
  is_member: boolean;
  kyc_verified: boolean;
  created_at: string;
  updated_at: string;
  location: Location | null;
  // Business-related fields
  company_name?: string;
  business_address?: string;
  tax_id?: string;
  phone_number?: string;
  tags?: Array<{ id: string; name: string }>;
}

export interface UserWithLocation extends User {
  location: Location | null
}

export interface SignupCredentials {
  email: string
  password: string
  first_name: string
  last_name: string
  role: UserRole
  username: string
}

export interface LoginCredentials {
  email: string
  password: string
  remember_me?: boolean
}

export interface AuthState {
  user: User | null
  token: string | null
  is_authenticated: boolean
  is_loading: boolean
  error: string | null
}
