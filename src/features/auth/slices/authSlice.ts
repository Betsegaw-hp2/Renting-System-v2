import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { getAuthToken, removeAuthToken, setAuthToken } from "../../../lib/cookies"
import type { AuthState, LoginCredentials, User } from "../../../types/user.types"
import type { SignupResponse } from "../api/authApi"
import * as authApi from "../api/authApi"
import type { SignupFormData } from "../types/signup.types"

const initialState: AuthState = {
  user: null,
  token: getAuthToken() || null,
  is_authenticated: !!getAuthToken(),
  is_loading: !!getAuthToken(), // Set to true if token exists, indicating an initial load/check will occur
  error: null,
}

// Helper function to extract error message from different error formats
export const getErrorMessage = (error: any): string => {
  if (typeof error === "string") return error

  if (error?.response?.data?.message) {
    const message = error.response.data.message
    const msgStr = typeof message === "string" ? message : JSON.stringify(message)
    return msgStr.replace(/[^a-zA-Z0-9 ]/g, " ")
  }

  if (error?.response?.data?.error) {
    const err = error.response.data.error
    return typeof err === "string" ? err : JSON.stringify(err)
  }

  if (error?.message) return error.message

  // If error is an object but not in expected format, stringify it safely
  if (typeof error === "object" && error !== null) {
    try {
      const errObj = JSON.stringify(error)
      // Avoid overly verbose messages if the stringified object is too simple
      if (errObj === "{}") return "An unknown error occurred"
      return `Request failed: ${errObj}`
    } catch (e) {
      return "An unknown error occurred"
    }
  }

  return "An unknown error occurred"
}

export const signupUser = createAsyncThunk<
  SignupResponse,  
  Omit<SignupFormData, "confirmPassword">, 
  { rejectValue: string }
>(
  "auth/signup",
  async (credentials: Omit<SignupFormData, "confirmPassword">, { rejectWithValue }) => {
    try {
      // Convert the signup form data to the format expected by the API
      const signupCredentials = {
        email: credentials.email,
        password: credentials.password,
        first_name: credentials.first_name,
        last_name: credentials.last_name,
        username: credentials.username,
        role: credentials.role,
      }

      const response = await authApi.signup(signupCredentials)

      // no taken (recent change in the API)
      // setAuthToken(response.token, true)

      return response
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)

export interface LoginUserParams extends LoginCredentials {
  remember_me?: boolean
}

export const loginUser = createAsyncThunk<
  authApi.LoginResponse,
  LoginUserParams,
  { rejectValue: string }
>(
  "auth/login",
  async ({ email, password, remember_me = false }: LoginUserParams, { rejectWithValue }) => {
    try {
      const response = await authApi.login({ email, password })

      // Store token in cookie with remember_me option
      setAuthToken(response.token, remember_me)

      return response
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error))
    }
  },
)


export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await authApi.logout()
    removeAuthToken()
    return null
  } catch (error: any) {
    // Even if the API call fails, we still want to remove the token locally
    removeAuthToken()
    return rejectWithValue(getErrorMessage(error))
  }
})

export const fetchCurrentUser = createAsyncThunk<User,void, { rejectValue: string }>("auth/fetchCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const user = await authApi.getCurrentUser()
    return user
  } catch (error: any) {
    // If we get a 401 Unauthorized, remove the token
    if (error?.response?.status === 401) {
      removeAuthToken()
    }
    return rejectWithValue(getErrorMessage(error))
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateUserProfile: (state, action: PayloadAction<User>) => {
      state.user = action.payload
    }
  },
  extraReducers: (builder) => {
    // Signup
    builder.addCase(signupUser.pending, (state) => {
      state.is_loading = true
      state.error = null
    })
    builder.addCase(signupUser.fulfilled, (state, action: PayloadAction<authApi.SignupResponse>) => {
      state.is_loading = false
      state.is_authenticated = true
      state.user = action.payload.data.user
      state.token = null // Token is not returned in the signup response
    })
    builder.addCase(signupUser.rejected, (state, action) => {
      state.is_loading = false
      state.error = action.payload as string
    })

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.is_loading = true
      state.error = null
    })
    builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<authApi.LoginResponse>) => {
      state.is_loading = false
      state.is_authenticated = true
      const { token, ...userProperties } = action.payload;
      state.user = userProperties;
      state.token = token
    })
    builder.addCase(loginUser.rejected, (state, action) => {
      state.is_loading = false
      state.error = action.payload as string
    })

    // Logout
    builder.addCase(logoutUser.pending, (state) => {
      state.is_loading = true
    })
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null
      state.token = null
      state.is_authenticated = false
      state.is_loading = false
    })
    builder.addCase(logoutUser.rejected, (state) => {
      // Even if the API call fails, we still want to log out locally
      state.user = null
      state.token = null
      state.is_authenticated = false
      state.is_loading = false
    })

    // Fetch current user
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.is_loading = true
      state.error = null // Clear previous errors
    })
    builder.addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
      state.is_loading = false
      state.user = action.payload
      state.is_authenticated = true
    })
    builder.addCase(fetchCurrentUser.rejected, (state, action) => { // Ensure action is typed if you use action.payload
      state.is_loading = false
      state.user = null
      state.token = null // Also clear token on rejection if auth fails
      state.is_authenticated = false
      state.error = action.payload as string // Store the error message
    })
  },
})

export const { clearError, updateUserProfile } = authSlice.actions
export default authSlice.reducer
