import apiClient from "../../../api/client"
import type { LoginCredentials, SignupCredentials, User } from "../../../types/user.types"

export interface AuthResponse {
  user: User
  token: string
}

export const signup = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/authentication/register", credentials)
  return response.data
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>("/authentication/login", credentials)
  return response.data
}

export const logout = async (): Promise<void> => {
  await apiClient.post("/authentication/logout")
  localStorage.removeItem("token")
}

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>("/auth/me")
  return response.data
}
