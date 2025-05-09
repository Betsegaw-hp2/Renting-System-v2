import type { Location } from "./location.types";

export type UserRole = "admin" | "renter" | "owner";

export const UserRole = {
	ADMIN: "admin" as "admin",
	TENANT: "renter" as "renter",
	PROPERTY_OWNER: "owner" as "owner",
};
  
  export interface User {
	id: string
	email: string
	first_name: string
	last_name: string
	username: string
	role: UserRole
	profile_picture?: string
	is_verified: boolean
	is_member: boolean
	created_at: string
	updated_at: string
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
	rememberMe?: boolean
  }
  
  export interface AuthState {
	user: User | null
	token: string | null
	isAuthenticated: boolean
	isLoading: boolean
	error: string | null
  }
  