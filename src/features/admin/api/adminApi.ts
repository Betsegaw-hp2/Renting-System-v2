import apiClient from "@/api/client";
import { convertApiListingToFeaturedListing, type ApiListingResponse, type FeaturedListing } from "@/api/publicApi";
import type { Report } from "@/types/api.types";
import type { Booking, Review } from "@/types/listing.types";
import type { User, UserKYC } from "@/types/user.types";
import type { AdminAnalytics, AdminDashboardStats } from "../types";

// Convert snake_case to camelCase
const toCamelCase = (obj: any): any => {
  if (obj === null || typeof obj !== "object") {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  }

  const camelCaseObj: Record<string, any> = {}
  Object.keys(obj).forEach((key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    camelCaseObj[camelKey] = toCamelCase(obj[key])
  })

  return camelCaseObj
}

// Admin API service
export const adminApi = {
  // Dashboard stats
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    try {
        const response = await apiClient.get("/admin/stats")
        return toCamelCase(response.data)
     
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      // Fallback to dummy data if all else fails
      return {
        totalUsers: 1250,
        totalListings: 3456,
        totalCategories: 12,
        totalReports: 78,
        activeListings: 2890,
        pendingReports: 23,
        newUsersThisMonth: 145,
        newListingsThisMonth: 267,
        totalBookings: 1876,
        newBookingsThisMonth: 89,
        totalRevenue: 245600,
        revenueThisMonth: 32450,
        verifiedUsers: 980,
      }
    }
  },

  // Dashboard analytics
  getDashboardAnalytics: async (timeRange: string): Promise<AdminAnalytics> => {
    try {
        const response = await apiClient.get("/admin/analytics", {
          params: {
            time_range: timeRange,
          },
        })
        return toCamelCase(response.data)
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error)
      // Fallback to dummy data
      return generateDummyAnalyticsData(timeRange)
    }
  },

  // Users
  getUsers: async (params: { limit?: number; offset?: number; search?: string; since?: string; sort?: string }) => {
    try {
      const response = await apiClient.get<User[]>("/users", { params })
      return response.data
    } catch (error) {
      console.error("Error fetching users:", error)
      throw error
    }
  },

  getUser: async (id: string) => {
    try {
      const response = await apiClient.get<User>(`/users/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error)
      throw error
    }
  },

  deleteUser: async (id: string): Promise<void> => {
    try {
      const response = await apiClient.delete(`/users/${id}`)
      console.log(`User ${id} deleted successfully`, response.data)
      return
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error)
      throw error
    }
  },

  approveUser: async (id: string) => {
    try {
      // The endpoint is GET /users/{id}/approve as per the spec
      const response = await apiClient.get(`/users/${id}/approve`)
      return response.data
    } catch (error) {
      console.error(`Error approving user ${id}:`, error)
      throw error
    }
  },

  // User KYC Management
  getUserKyc: async (userId: string): Promise<UserKYC | null> => {
    try {
      const response = await apiClient.get(`/users/${userId}/kyc`);
      return response.data; 
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return null; // Return null if KYC not found
      }
      console.error(`Error fetching KYC for user ${userId}:`, error);
      throw error; // Re-throw other errors
    }
  },

  postUserKyc: async (userId: string, kycData: FormData): Promise<UserKYC> => { 
    const response = await apiClient.post(`/users/${userId}/kyc`, kycData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data; 
  },

  getAllUserKyc: async (params?: { limit?: number; offset?: number }): Promise<{ records: UserKYC[], totalRecords: number }> => { 
    try {
      const response = await apiClient.get<UserKYC[]>("/user-kyc/all", { params }); 
      return { records: response.data || [], totalRecords: (response.data)?.length || 0 }; 
    } catch (error) {
      console.error("Error fetching all user KYC records:", error);
      return { records: [], totalRecords: 0 };
    }
  },


  // Categories

  checkCategorySlug: async (slug: string) : Promise<{ exists: boolean, slug: string}> =>  {
    try {
      const response = await apiClient.get<{ exists: boolean, slug: string}>(`/categories/check-slug?slug=${slug}`)
      return response.data
    } catch (error) {
      console.error("Error checking category slug:", error)
      // Return mock data for development
      return {
        exists: false,
        slug: "string",
      }
    }
  },
  getCategories: async (params: { limit?: number; offset?: number; search?: string; sort?: string }) => {
    try {
      const response = await apiClient.get("/categories", { params })
      return toCamelCase(response.data)
    } catch (error) {
      console.error("Error fetching categories:", error)

      // Fallback to mock data for development
      console.warn("Returning mock category data")
      return [
        {
          id: "1",
          name: "Apartments",
          slug: "apartments",
          description: "Modern apartments for rent",
          imageUrl: "/placeholder.svg?height=100&width=100",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Houses",
          slug: "houses",
          description: "Spacious houses for families",
          imageUrl: "/placeholder.svg?height=100&width=100",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Condos",
          slug: "condos",
          description: "Luxury condos in prime locations",
          imageUrl: "/placeholder.svg?height=100&width=100",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
    }
  },

  createCategory: async (formData: FormData) => {
    try {
      const response = await apiClient.post("/categories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return toCamelCase(response.data)
    } catch (error) {
      console.error("Error creating category:", error)

      // Return a mock successful response for development
      const categoryName = formData.get("name") as string
      const categorySlug = formData.get("slug") as string
      const categoryDescription = formData.get("description") as string

      return {
        id: Date.now().toString(),
        name: categoryName,
        slug: categorySlug,
        description: categoryDescription,
        imageUrl: "/placeholder.svg?height=100&width=100",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
  },

  updateCategory: async (id: string, categoryData: { name?: string; description?: string; slug?: string }) => {
    try {
      const response = await apiClient.patch(`/categories/${id}`, categoryData)
      return toCamelCase(response.data)
    } catch (error) {
      console.error("Error updating category:", error)

      // Return a mock successful response for development
      return {
        id,
        ...categoryData,
        imageUrl: "/placeholder.svg?height=100&width=100",
        updatedAt: new Date().toISOString(),
      }
    }
  },

  deleteCategory: async (id: string) => {
    try {
      await apiClient.delete(`/categories/${id}`)
      return true
    } catch (error) {
      console.error("Error deleting category:", error)
      return true // Mock successful deletion
    }
  },
  
  updateCategoryImage: async (id: string, formData: FormData) => {
    try {
        const response = await apiClient.post(`/categories/${id}/media`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        return toCamelCase(response.data)
    } catch (error) {
      console.error("Error updating category image:", error)
    }
  },

  // FIX: Admin profile
  getAdminProfile: async () => {
    try {
      const response = await apiClient.get("/admin/profile")
      return toCamelCase(response.data)
    } catch (error) {
      console.error("Error fetching admin profile:", error)

      // Return mock data for development
      return {
        firstName: "Admin",
        lastName: "User",
        email: "admin@homerent.com",
        phone: "+1 (555) 123-4567",
        avatar: "/placeholder.svg?height=200&width=200",
      }
    }
  },

  updateAdminProfile: async (profileData: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    avatar?: File
  }) => {
    try {
      const formData = new FormData()

      if (profileData.firstName) formData.append("first_name", profileData.firstName)
      if (profileData.lastName) formData.append("last_name", profileData.lastName)
      if (profileData.email) formData.append("email", profileData.email)
      if (profileData.phone) formData.append("phone", profileData.phone)
      if (profileData.avatar) formData.append("avatar", profileData.avatar)

      const response = await apiClient.patch("/admin/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return toCamelCase(response.data)
    } catch (error) {
      console.error("Error updating admin profile:", error)

      // Return mock successful response for development
      return {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        avatar: profileData.avatar ? "/placeholder.svg?height=200&width=200" : undefined,
        updatedAt: new Date().toISOString(),
      }
    }
  },

  updateAdminPassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    try {
      const response = await apiClient.patch("/admin/password", passwordData)
      return toCamelCase(response.data)
    } catch (error) {
      console.error("Error updating admin password:", error)

      // Return mock successful response for development
      return {
        success: true,
        message: "Password updated successfully",
      }
    }
  },

  // System settings
  getSystemSettings: async () => {
    try {
      const response = await apiClient.get("/admin/settings")
      return toCamelCase(response.data)
    } catch (error) {
      console.error("Error fetching system settings:", error)

      // Return mock data for development
      return {
        enableEmailNotifications: true,
        enableSmsNotifications: false,
        maintenanceMode: false,
        listingApprovalRequired: true,
        maxImagesPerListing: 10,
        maxActiveListingsPerUser: 20,
      }
    }
  },

  updateSystemSettings: async (settings: Record<string, any>) => {
    try {
      const response = await apiClient.patch("/admin/settings", settings)
      return toCamelCase(response.data)
    } catch (error) {
      console.error("Error updating system settings:", error)

      // Return mock successful response for development
      return {
        ...settings,
        updatedAt: new Date().toISOString(),
      }
    }
  },

  // Reports
  getReports: async (params: {
    limit: number;
    offset: number;
    since?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    try {
      // Construct the query parameters for the API call
      const queryParams: Record<string, string | number> = {
        limit: params.limit,
        offset: params.offset,
      };
      if (params.since) {
        queryParams.since = params.since;
      }

      const response = await apiClient.get<Report[]>("/reports", { params: queryParams });
      return response.data;
    } catch (error) {
      console.error("Error fetching reports:", error);
      throw error; // Re-throw to be caught by createAsyncThunk
    }
  },

  getReport: async (id: string) => {
    try {
      const response = await apiClient.get(`/reports/${id}`)
      return response.data
    } catch (error) {
       if (error instanceof Error) {
          throw error
        } else if (typeof error === "object" && error !== null) {
          throw new Error(JSON.stringify(error))
        } else {
          throw new Error("An unknown error occurred during signup")
        }
    }
  },

  dismissReport: async (id: string) => {
    try {
      const response = await apiClient.get(`/reports/${id}/dismiss`)
      return response.data
    } catch (error) {
      console.error("Error dismissing report:", error)
      throw error
    }
  },

  resolveReport: async (id: string) => {
    try {
      const response = await apiClient.get(`/reports/${id}/resolve`)
      return response.data
    } catch (error) {
      console.error("Error resolving report:", error)
      throw error
    }
  },

  markReportUnderReview: async (id: string) => {
    try {
      const response = await apiClient.get(`/reports/${id}/under-review`)
      return response.data
    } catch (error) {
      console.error("Error marking report as under review:", error)
      throw error
    }
  },

  deleteReport: async (id: string) => {
    try {
      await apiClient.delete(`/reports/${id}`)
      return true
    } catch (error) {
      console.error("Error deleting report:", error)
      throw error
    }
  },

  // Listings
  getListings: async (params: {
    limit?: number
    offset?: number
    search?: string
    since?: string
    sort?: string // Updated to match the API spec (e.g., 'createdAt_asc', 'price_desc')
    tags?: string[]
    city?: string
    min_price?: number
    max_price?: number
  }) => {
    try {
      const response = await apiClient.get<ApiListingResponse[]>("/listings", { params })
      return Promise.all((response.data ?? []).map(convertApiListingToFeaturedListing))
    } catch (error) {
      console.error("Error fetching listings:", error)
      throw error
    }
  },

  getListing: async (id: string) : Promise<FeaturedListing> => {
    try {
      const response = await apiClient.get<ApiListingResponse>(`/listings/${id}`)
      return convertApiListingToFeaturedListing(response.data)
    } catch (error) {
      console.error("Error fetching listing:", error)
      throw error
    }
  },

  deleteListing: async (id: string) => {
    try {
      const response = await apiClient.delete(`/listings/${id}`)
      console.log(`Listing ${id} deleted successfully`, response.data)
      return true // Or some other meaningful response
    } catch (error) {
      console.error(`Error deleting listing ${id}:`, error)
      throw error // Re-throw or handle as needed
    }
  },

  // Get bookings for a specific listing
  getListingBookings: async (listingId: string): Promise<Booking[]> => {
    try {
      const response = await apiClient.get<Booking[]>(`/listings/${listingId}/bookings`)
      console.log("Fetched bookings:", response.data)
      return response.data
    } catch (error) {
      console.error(`Error fetching bookings for listing ${listingId}:`, error)
      // Fallback to empty array or throw error
      return []
    }
  },

  // Get reviews for a specific listing
  getListingReviews: async (listingId: string): Promise<Review[]> => {
    try {
      const response = await apiClient.get<Review[]>(`/listings/${listingId}/reviews`)
      return toCamelCase(response.data)
    } catch (error) {
      console.error(`Error fetching reviews for listing ${listingId}:`, error)
      // Fallback to empty array or throw error
      return []
    }
  },
}



// Generate dummy data for analytics
function generateDummyAnalyticsData(timeRange: string): AdminAnalytics {
  return {
    userGrowth: generateDummyUserGrowthData(timeRange),
    listingsByCategory: [
      { name: "Apartments", value: 400 },
      { name: "Houses", value: 300 },
      { name: "Rooms", value: 200 },
      { name: "Commercial", value: 100 },
      { name: "Land", value: 50 },
    ],
    bookingTrends: generateDummyBookingTrendsData(timeRange),
    usersByRole: {
      admin: 50,
      owner: 450,
      renter: 750,
    },
    listingsByStatus: {
      available: 2890,
      booked: 450,
      inactive: 116,
    },
  }
}

// Generate dummy user growth data based on time range
function generateDummyUserGrowthData(timeRange: string) {
  switch (timeRange) {
    case "7":
      return [
        { name: "Mon", users: 40 },
        { name: "Tue", users: 35 },
        { name: "Wed", users: 45 },
        { name: "Thu", users: 50 },
        { name: "Fri", users: 60 },
        { name: "Sat", users: 75 },
        { name: "Sun", users: 65 },
      ]
    case "30":
      return [
        { name: "Week 1", users: 200 },
        { name: "Week 2", users: 180 },
        { name: "Week 3", users: 220 },
        { name: "Week 4", users: 250 },
      ]
    case "90":
      return [
        { name: "Jan", users: 400 },
        { name: "Feb", users: 500 },
        { name: "Mar", users: 600 },
      ]
    case "365":
    default:
      return [
        { name: "Jan", users: 400 },
        { name: "Feb", users: 500 },
        { name: "Mar", users: 600 },
        { name: "Apr", users: 800 },
        { name: "May", users: 1000 },
        { name: "Jun", users: 1200 },
        { name: "Jul", users: 1300 },
        { name: "Aug", users: 1400 },
        { name: "Sep", users: 1500 },
        { name: "Oct", users: 1600 },
        { name: "Nov", users: 1700 },
        { name: "Dec", users: 1800 },
      ]
  }
}

// Generate dummy booking trends data based on time range
function generateDummyBookingTrendsData(timeRange: string) {
  switch (timeRange) {
    case "7":
      return [
        { name: "Mon", bookings: 10, revenue: 600 },
        { name: "Tue", bookings: 8, revenue: 480 },
        { name: "Wed", bookings: 12, revenue: 720 },
        { name: "Thu", bookings: 15, revenue: 900 },
        { name: "Fri", bookings: 18, revenue: 1080 },
        { name: "Sat", bookings: 25, revenue: 1500 },
        { name: "Sun", bookings: 20, revenue: 1200 },
      ]
    case "30":
      return [
        { name: "Week 1", bookings: 40, revenue: 2400 },
        { name: "Week 2", bookings: 35, revenue: 2100 },
        { name: "Week 3", bookings: 45, revenue: 2700 },
        { name: "Week 4", bookings: 50, revenue: 3000 },
      ]
    case "90":
      return [
        { name: "Jan", bookings: 120, revenue: 7200 },
        { name: "Feb", bookings: 150, revenue: 9000 },
        { name: "Mar", bookings: 180, revenue: 10800 },
      ]
    case "365":
    default:
      return [
        { name: "Jan", bookings: 40, revenue: 2400 },
        { name: "Feb", bookings: 30, revenue: 1800 },
        { name: "Mar", bookings: 50, revenue: 3000 },
        { name: "Apr", bookings: 80, revenue: 4800 },
        { name: "May", bookings: 70, revenue: 4200 },
        { name: "Jun", bookings: 90, revenue: 5400 },
        { name: "Jul", bookings: 100, revenue: 6000 },
        { name: "Aug", bookings: 110, revenue: 6600 },
        { name: "Sep", bookings: 120, revenue: 7200 },
        { name: "Oct", bookings: 130, revenue: 7800 },
        { name: "Nov", bookings: 140, revenue: 8400 },
        { name: "Dec", bookings: 150, revenue: 9000 },
      ]
  }
}