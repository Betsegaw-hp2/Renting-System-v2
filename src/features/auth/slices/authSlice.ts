import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { AuthState, LoginCredentials, User } from "../../../types/user.types"
import * as authApi from "../api/authApi"
import type { SignupFormData } from "../types/signup.types"

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,
}

export const signupUser = createAsyncThunk(
  "auth/signup",
  async (credentials: Omit<SignupFormData, "confirmPassword">, { rejectWithValue }) => {
    try {
      // Convert the signup form data to the format expected by the API
      const signupCredentials = {
        email: credentials.email,
        password: credentials.password,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        role: credentials.role,
        phoneNumber: credentials.phoneNumber,
        // Include role-specific fields
        ...(credentials.role === "TENANT"
          ? {
              preferredLocation: credentials.preferredLocation,
              budget: credentials.budget,
              moveInDate: credentials.moveInDate,
            }
          : {
              // Location
              address: credentials.address,
              city: credentials.city,
              state: credentials.state,
              zipCode: credentials.zipCode,

              // Property info
              companyName: credentials.companyName,
              businessType: credentials.businessType,
              propertyTypes: credentials.propertyTypes,
              propertiesOwned: credentials.propertiesOwned,

              // KYC
              idType: credentials.idType,
              idNumber: credentials.idNumber,
              dateOfBirth: credentials.dateOfBirth,
            }),
      }

      const response = await authApi.signup(signupCredentials)
      localStorage.setItem("token", response.token)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Signup failed")
    }
  },
)

export interface LoginUserParams extends LoginCredentials {
  rememberMe?: boolean
}

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password, rememberMe }: LoginUserParams, { rejectWithValue }) => {
    try {
      const response = await authApi.login({ email, password })

      // If rememberMe is true, store the token in localStorage, otherwise in sessionStorage
      if (rememberMe) {
        localStorage.setItem("token", response.token)
      } else {
        sessionStorage.setItem("token", response.token)
        // Remove from localStorage if it exists there
        localStorage.removeItem("token")
      }

      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed")
    }
  },
)

export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await authApi.logout()
    localStorage.removeItem("token")
    sessionStorage.removeItem("token")
    return null
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Logout failed")
  }
})

export const fetchCurrentUser = createAsyncThunk("auth/fetchCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const user = await authApi.getCurrentUser()
    return user
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch user")
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Signup
    builder.addCase(signupUser.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(signupUser.fulfilled, (state, action: PayloadAction<authApi.AuthResponse>) => {
      state.isLoading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
    })
    builder.addCase(signupUser.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<authApi.AuthResponse>) => {
      state.isLoading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
    })
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
    })

    // Fetch current user
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
      state.isLoading = false
      state.user = action.payload
      state.isAuthenticated = true
    })
    builder.addCase(fetchCurrentUser.rejected, (state) => {
      state.isLoading = false
      state.user = null
      state.token = null
      state.isAuthenticated = false
    })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
