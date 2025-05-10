// API Configuration
const config = {
  // Set to true to use mock API, false to use real API
  useMockApi: false,

  // Base URL for the real API
  apiBaseUrl: "https://all-in-one-development.up.railway.app/v1",

  // Mock API delay in milliseconds (to simulate network latency)
  mockApiDelay: 500,

  // Auth token key for localStorage
  authTokenKey: "auth_token",

  // Refresh token key for localStorage
  refreshTokenKey: "refresh_token",
}

export default config
