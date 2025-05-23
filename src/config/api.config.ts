// API Configuration
const config = {
	// Set to true to use mock API, false to use real API
	useMockApi: false,
  
	// Base URL for the real API
	apiBaseUrl: import.meta.env.VITE_API_PROD_BASE_URL,
  
	// Mock API delay in milliseconds (to simulate network latency)
	mockApiDelay: 500,
  }
  
  export default config
  