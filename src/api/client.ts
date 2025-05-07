import axios from "axios"
import config from "../config/api.config"
import { getAuthToken, removeAuthToken } from "../lib/cookies"


// Create axios instance for real API
const axiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials: true, // becuase the backend has a wildcard (*) fro ACL, we don't need this
})

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
   // Get token from cookie
   const token = getAuthToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

// Add a response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
       // Clear token and redirect to login
       removeAuthToken()
      window.location.href = "/login"
    }

    return Promise.reject(error)
  },
)

// Export the API client
const apiClient = axiosInstance

export default apiClient
