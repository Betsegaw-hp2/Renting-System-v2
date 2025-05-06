export interface User {
	id: string
	email: string
	firstName: string
	lastName: string
	role: UserRole
	avatar?: string
	createdAt: string
	isActive: boolean
  }
  
  export const UserRole = {
	ADMIN: "ADMIN",
	TENANT: "TENANT",
	PROPERTY_OWNER: "PROPERTY_OWNER",
  } as const;
  
  export type UserRole = typeof UserRole[keyof typeof UserRole];

  export interface SignupCredentials {
	email: string
	password: string
	firstName: string
	lastName: string
	role: UserRole
	phoneNumber: string
	

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
  