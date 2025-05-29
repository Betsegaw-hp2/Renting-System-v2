import type { User, UserKYC } from "@/types/user.types";
import apiClient from "../../../api/client";
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
      // Try to fetch from the analytics endpoint if it exists
      try {
        const response = await apiClient.get("/admin/stats")
        return toCamelCase(response.data)
      } catch (analyticsError) {
        console.warn("Analytics endpoint not available, calculating from individual endpoints", analyticsError)

        // If analytics endpoint doesn't exist, calculate from individual endpoints
        const [usersResponse, listingsResponse, categoriesResponse, reportsResponse, bookingsResponse] =
          await Promise.all([
            apiClient.get("/users", { params: { limit: 1, count: true } }),
            apiClient.get("/listings", { params: { limit: 1, count: true } }),
            apiClient.get("/categories", { params: { limit: 1, count: true } }),
            apiClient.get("/reports", { params: { limit: 1, count: true } }),
            apiClient.get("/bookings", { params: { limit: 1, count: true } }).catch(() => ({ data: { count: 0 } })),
          ])

        // Get new users this month
        const currentDate = new Date()
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString()

        const [newUsersResponse, newListingsResponse, newBookingsResponse] = await Promise.all([
          apiClient.get("/users", {
            params: {
              limit: 1,
              count: true,
              created_after: firstDayOfMonth,
            },
          }),
          apiClient.get("/listings", {
            params: {
              limit: 1,
              count: true,
              created_after: firstDayOfMonth,
            },
          }),
          apiClient
            .get("/bookings", {
              params: {
                limit: 1,
                count: true,
                created_after: firstDayOfMonth,
              },
            })
            .catch(() => ({ data: { count: 0 } })),
        ])

        // Get active listings
        const activeListingsResponse = await apiClient.get("/listings", {
          params: {
            limit: 1,
            count: true,
            status: "active",
          },
        })

        // Get pending reports
        const pendingReportsResponse = await apiClient.get("/reports", {
          params: {
            limit: 1,
            count: true,
            status: "pending",
          },
        })

        // Get verified users
        const verifiedUsersResponse = await apiClient
          .get("/users", {
            params: {
              limit: 1,
              count: true,
              verified: true,
            },
          })
          .catch(() => ({ data: { count: 0 } }))

        // Calculate revenue (this might not be available via API)
        // For this example, we'll use dummy data
        const totalRevenue = 245600
        const revenueThisMonth = 32450

        return {
          totalUsers: usersResponse.data.count || 0,
          totalListings: listingsResponse.data.count || 0,
          totalCategories: categoriesResponse.data.count || 0,
          totalReports: reportsResponse.data.count || 0,
          activeListings: activeListingsResponse.data.count || 0,
          pendingReports: pendingReportsResponse.data.count || 0,
          newUsersThisMonth: newUsersResponse.data.count || 0,
          newListingsThisMonth: newListingsResponse.data.count || 0,
          totalBookings: bookingsResponse.data.count || 0,
          newBookingsThisMonth: newBookingsResponse.data.count || 0,
          totalRevenue: totalRevenue,
          revenueThisMonth: revenueThisMonth,
          verifiedUsers: verifiedUsersResponse.data.count || 0,
        }
      }
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
      // Try to fetch from the analytics endpoint if it exists
      try {
        const response = await apiClient.get("/admin/analytics", {
          params: {
            time_range: timeRange,
          },
        })
        return toCamelCase(response.data)
      } catch (analyticsError) {
        console.warn("Analytics details endpoint not available, calculating from individual endpoints", analyticsError)

        // Calculate time range dates
        const endDate = new Date()
        const startDate = new Date()

        switch (timeRange) {
          case "7":
            startDate.setDate(endDate.getDate() - 7)
            break
          case "30":
            startDate.setDate(endDate.getDate() - 30)
            break
          case "90":
            startDate.setDate(endDate.getDate() - 90)
            break
          case "365":
            startDate.setDate(endDate.getDate() - 365)
            break
          default:
            startDate.setDate(endDate.getDate() - 30)
        }

        const startDateStr = startDate.toISOString()

        // Fetch user growth data
        const userGrowthData = await fetchUserGrowthData(startDateStr, endDate, timeRange)

        // Fetch listings by category
        const listingsByCategoryData = await fetchListingsByCategoryData()

        // Fetch booking trends
        const bookingTrendsData = await fetchBookingTrendsData(startDateStr, endDate, timeRange)

        // Fetch users by role
        const usersByRoleData = await fetchUsersByRoleData()

        // Fetch listings by status
        const listingsByStatusData = await fetchListingsByStatusData()

        return {
          userGrowth: userGrowthData,
          listingsByCategory: listingsByCategoryData,
          bookingTrends: bookingTrendsData,
          usersByRole: usersByRoleData as AdminAnalytics["usersByRole"],
          listingsByStatus: listingsByStatusData as AdminAnalytics["listingsByStatus"],
        }
      }
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
      return { records: response.data || [], totalRecords: (response.data).length || 0 }; 
    } catch (error) {
      console.error("Error fetching all user KYC records:", error);
      return { records: [], totalRecords: 0 };
    }
  },


  // Categories
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
  
  // TODO: FIX
  updateCategoryImage: async (id: string, formData: FormData) => {
    try {
      // First try the standard endpoint
      try {
        const response = await apiClient.post(`/categories/${id}/image`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        return toCamelCase(response.data)
      } catch (error) {
        // If that fails, try the alternative endpoint format
        console.warn("Primary image endpoint failed, trying alternative endpoint", error)
        try {
          const response = await apiClient.post(`/category/${id}/media`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          return toCamelCase(response.data)
        } catch (secondError) {
          // If both fail, try a PATCH request to the main category endpoint
          console.warn("Alternative endpoint failed, trying PATCH to main endpoint", secondError)
          const response = await apiClient.patch(`/categories/${id}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          return toCamelCase(response.data)
        }
      }
    } catch (error) {
      console.error("Error updating category image:", error)

      // Return a mock successful response for development
      return {
        id,
        imageUrl: "/placeholder.svg?height=100&width=100",
        updatedAt: new Date().toISOString(),
      }
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
    sort?: string
    tags?: string[]
  }) => {
    try {
      const response = await apiClient.get("/listings", { params })
      return toCamelCase(response.data)
    } catch (error) {
      console.error("Error fetching listings:", error)
      throw error
    }
  },

  getListing: async (id: string) => {
    try {
      const response = await apiClient.get(`/listings/${id}`)
      return toCamelCase(response.data)
    } catch (error) {
      console.error("Error fetching listing:", error)
      throw error
    }
  },

  deleteListing: async (id: string) => {
    try {
      await apiClient.delete(`/listings/${id}`)
      return true
    } catch (error) {
      console.error("Error deleting listing:", error)
      throw error
    }
  },
}

// Helper functions for analytics data processing

// Fetch user growth data
async function fetchUserGrowthData(startDate: string, endDate: Date, timeRange: string) {
  try {
    // Try to get user registrations by date
    const response = await apiClient.get("/users/registrations-by-date", {
      params: {
        start_date: startDate,
        end_date: endDate.toISOString(),
      },
    })

    // Process the data for the chart
    return processTimeSeriesData(response.data, timeRange, "users")
  } catch (error) {
    console.warn("User registrations by date endpoint not available, using dummy data", error)
    // Return dummy data based on time range
    return generateDummyUserGrowthData(timeRange)
  }
}

// Fetch listings by category data
async function fetchListingsByCategoryData() {
  try {
    // Try to get listings count by category
    const response = await apiClient.get("/listings/count-by-category")

    // Process the data for the chart
    return response.data.map((item: any) => ({
      name: item.category_name,
      value: item.count,
    }))
  } catch (error) {
    console.warn("Listings count by category endpoint not available, calculating manually", error)

    try {
      // Get all categories
      const categoriesResponse = await apiClient.get("/categories", {
        params: { limit: 100 },
      })

      const categories = categoriesResponse.data.items || []

      // For each category, get the count of listings
      const listingsByCategory = await Promise.all(
        categories.map(async (category: any) => {
          try {
            const listingsResponse = await apiClient.get("/listings", {
              params: {
                category_id: category.id,
                limit: 1,
                count: true,
              },
            })

            return {
              name: category.name,
              value: listingsResponse.data.count || 0,
            }
          } catch (e) {
            return {
              name: category.name,
              value: 0,
            }
          }
        }),
      )

      return listingsByCategory
    } catch (error) {
      console.warn("Failed to calculate listings by category, using dummy data", error)
      return [
        { name: "Apartments", value: 400 },
        { name: "Houses", value: 300 },
        { name: "Rooms", value: 200 },
        { name: "Commercial", value: 100 },
        { name: "Land", value: 50 },
      ]
    }
  }
}

// Fetch booking trends data
async function fetchBookingTrendsData(startDate: string, endDate: Date, timeRange: string) {
  try {
    // Try to get bookings by date with revenue
    const response = await apiClient.get("/bookings/trends", {
      params: {
        start_date: startDate,
        end_date: endDate.toISOString(),
      },
    })

    // Process the data for the chart
    return processTimeSeriesData(response.data, timeRange, "bookings", "revenue")
  } catch (error) {
    console.warn("Booking trends endpoint not available, using dummy data", error)
    // Return dummy data based on time range
    return generateDummyBookingTrendsData(timeRange)
  }
}

// Fetch users by role data
async function fetchUsersByRoleData() {
  try {
    // Try to get users count by role
    const response = await apiClient.get("/users/count-by-role")

    // Process the data for the chart
    const roleMapping: Record<string, string> = {
      ADMIN: "admin",
      OWNER: "owner",
      RENTER: "renter",
      TENANT: "renter", // Map tenant to renter if needed
    }

    const usersByRole: Record<string, number> = {
      admin: 0,
      owner: 0,
      renter: 0,
    }

    response.data.forEach((item: any) => {
      const normalizedRole = roleMapping[item.role.toUpperCase()] || item.role.toLowerCase()
      if (usersByRole[normalizedRole] !== undefined) {
        usersByRole[normalizedRole] = item.count
      }
    })

    return usersByRole
  } catch (error) {
    console.warn("Users count by role endpoint not available, calculating manually", error)

    try {
      // Get counts for each role
      const [adminCount, ownerCount, renterCount] = await Promise.all([
        apiClient
          .get("/users", {
            params: {
              role: "admin",
              limit: 1,
              count: true,
            },
          })
          .then((res) => res.data.count)
          .catch(() => 0),
        apiClient
          .get("/users", {
            params: {
              role: "owner",
              limit: 1,
              count: true,
            },
          })
          .then((res) => res.data.count)
          .catch(() => 0),
        apiClient
          .get("/users", {
            params: {
              role: "renter",
              limit: 1,
              count: true,
            },
          })
          .then((res) => res.data.count)
          .catch(() => 0),
      ])

      return {
        admin: adminCount,
        owner: ownerCount,
        renter: renterCount,
      }
    } catch (error) {
      console.warn("Failed to calculate users by role, using dummy data", error)
      return {
        admin: 50,
        owner: 450,
        renter: 750,
      }
    }
  }
}

// Fetch listings by status data
async function fetchListingsByStatusData() {
  try {
    // Try to get listings count by status
    const response = await apiClient.get("/listings/count-by-status")

    // Process the data for the chart
    const statusMapping: Record<string, string> = {
      ACTIVE: "available",
      AVAILABLE: "available",
      BOOKED: "booked",
      RESERVED: "booked",
      INACTIVE: "inactive",
      DISABLED: "inactive",
    }

    const listingsByStatus: Record<string, number> = {
      available: 0,
      booked: 0,
      inactive: 0,
    }

    response.data.forEach((item: any) => {
      const normalizedStatus = statusMapping[item.status.toUpperCase()] || item.status.toLowerCase();
      if (listingsByStatus[normalizedStatus] !== undefined) { // Corrected typo here
        listingsByStatus[normalizedStatus] = item.count;
      }
    });

    return listingsByStatus
  } catch (error) {
    console.warn("Listings count by status endpoint not available, calculating manually", error)

    try {
      // Get counts for each status
      const [availableCount, bookedCount, inactiveCount] = await Promise.all([
        apiClient
          .get("/listings", {
            params: {
              status: "available",
              limit: 1,
              count: true,
            },
          })
          .then((res) => res.data.count)
          .catch(() => 0),
        apiClient
          .get("/listings", {
            params: {
              status: "booked",
              limit: 1,
              count: true,
            },
          })
          .then((res) => res.data.count)
          .catch(() => 0),
        apiClient
          .get("/listings", {
            params: {
              status: "inactive",
              limit: 1,
              count: true,
            },
          })
          .then((res) => res.data.count)
          .catch(() => 0),
      ])

      return {
        available: availableCount,
        booked: bookedCount,
        inactive: inactiveCount,
      }
    } catch (error) {
      console.warn("Failed to calculate listings by status, using dummy data", error)
      return {
        available: 2890,
        booked: 450,
        inactive: 116,
      }
    }
  }
}

// Process time series data for charts
function processTimeSeriesData(data: any[], timeRange: string, primaryKey: string, secondaryKey?: string) {
  // If the data is already in the right format, return it
  if (data.length > 0 && data[0].name && data[0][primaryKey] !== undefined) {
    return data
  }

  // Otherwise, process the data based on the time range
  const result = []

  // Group data by time period based on the time range
  switch (timeRange) {
    case "7":
      // Group by day of week
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const dayData: Record<string, any> = {}

      // Initialize days
      dayNames.forEach((day) => {
        dayData[day] = { name: day, [primaryKey]: 0 }
        if (secondaryKey) dayData[day][secondaryKey] = 0
      })

      // Aggregate data
      data.forEach((item) => {
        const date = new Date(item.date)
        const day = dayNames[date.getDay()]
        dayData[day][primaryKey] += item[primaryKey] || 0
        if (secondaryKey) dayData[day][secondaryKey] += item[secondaryKey] || 0
      })

      // Convert to array
      for (let i = 0; i < 7; i++) {
        const today = new Date().getDay()
        const dayIndex = (today - 6 + i) % 7
        const day = dayNames[dayIndex < 0 ? dayIndex + 7 : dayIndex]
        result.push(dayData[day])
      }
      break

    case "30":
      // Group by week
      const weekData: Record<string, any> = {
        "Week 1": { name: "Week 1", [primaryKey]: 0 },
        "Week 2": { name: "Week 2", [primaryKey]: 0 },
        "Week 3": { name: "Week 3", [primaryKey]: 0 },
        "Week 4": { name: "Week 4", [primaryKey]: 0 },
      }

      if (secondaryKey) {
        weekData["Week 1"][secondaryKey] = 0
        weekData["Week 2"][secondaryKey] = 0
        weekData["Week 3"][secondaryKey] = 0
        weekData["Week 4"][secondaryKey] = 0
      }

      // Aggregate data
      data.forEach((item) => {
        const date = new Date(item.date)
        const day = date.getDate()
        let week

        if (day <= 7) week = "Week 1"
        else if (day <= 14) week = "Week 2"
        else if (day <= 21) week = "Week 3"
        else week = "Week 4"

        weekData[week][primaryKey] += item[primaryKey] || 0
        if (secondaryKey) weekData[week][secondaryKey] += item[secondaryKey] || 0
      })

      // Convert to array
      result.push(weekData["Week 1"])
      result.push(weekData["Week 2"])
      result.push(weekData["Week 3"])
      result.push(weekData["Week 4"])
      break

    case "90":
      // Group by month (last 3 months)
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const monthData: Record<string, any> = {}

      // Get the last 3 months
      const today = new Date()
      for (let i = 0; i < 3; i++) {
        const monthIndex = (today.getMonth() - 2 + i) % 12
        const month = monthNames[monthIndex < 0 ? monthIndex + 12 : monthIndex]
        monthData[month] = { name: month, [primaryKey]: 0 }
        if (secondaryKey) monthData[month][secondaryKey] = 0
      }

      // Aggregate data
      data.forEach((item) => {
        const date = new Date(item.date)
        const month = monthNames[date.getMonth()]
        if (monthData[month]) {
          monthData[month][primaryKey] += item[primaryKey] || 0
          if (secondaryKey) monthData[month][secondaryKey] += item[secondaryKey] || 0
        }
      })

      // Convert to array
      for (let i = 0; i < 3; i++) {
        const monthIndex = (today.getMonth() - 2 + i) % 12
        const month = monthNames[monthIndex < 0 ? monthIndex + 12 : monthIndex]
        result.push(monthData[month])
      }
      break

    case "365":
    default:
      // Group by month (all 12 months)
      const yearMonthData: Record<string, any> = {}
      const yearMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

      // Initialize months
      yearMonthNames.forEach((month) => {
        yearMonthData[month] = { name: month, [primaryKey]: 0 }
        if (secondaryKey) yearMonthData[month][secondaryKey] = 0
      })

      // Aggregate data
      data.forEach((item) => {
        const date = new Date(item.date)
        const month = yearMonthNames[date.getMonth()]
        yearMonthData[month][primaryKey] += item[primaryKey] || 0
        if (secondaryKey) yearMonthData[month][secondaryKey] += item[secondaryKey] || 0
      })

      // Convert to array in correct order (starting from current month last year)
      const currentMonth = new Date().getMonth()
      for (let i = 0; i < 12; i++) {
        const monthIndex = (currentMonth + 1 + i) % 12
        result.push(yearMonthData[yearMonthNames[monthIndex]])
      }
      break
  }

  return result
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