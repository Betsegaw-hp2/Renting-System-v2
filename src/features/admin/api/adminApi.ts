import apiClient from "../../../api/client"
import type { User } from "../../../types/user.types"
import type { AdminDashboardStats } from "../types"

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
      // In a real app, this would be an API call to get dashboard stats
      // For now, we'll return mock data
      return {
        totalUsers: 1250,
        totalListings: 3456,
        totalCategories: 12,
        totalReports: 78,
        activeListings: 2890,
        pendingReports: 23,
        newUsersThisMonth: 145,
        newListingsThisMonth: 267,
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      throw error
    }
  },

  // Users
  getUsers: async (params: { limit?: number; offset?: number; search?: string; since?: string; sort?: string }) => {
    try {
      const response = await apiClient.get("/users", { params })
      return toCamelCase(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
      throw error
    }
  },

  updateUser: async (id: string, userData: Partial<User>) => {
    try {
      const response = await apiClient.patch(`/users/${id}`, userData)
      return toCamelCase(response.data)
    } catch (error) {
      console.error("Error updating user:", error)
      throw error
    }
  },

  deleteUser: async (id: string) => {
    try {
      await apiClient.delete(`/users/${id}`)
      return true
    } catch (error) {
      console.error("Error deleting user:", error)
      throw error
    }
  },

  // Categories
  getCategories: async (params: { limit?: number; offset?: number; search?: string; sort?: string }) => {
    try {
      const response = await apiClient.get("/categories", { params })
      return toCamelCase(response.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      throw error
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
      throw error
    }
  },

  updateCategory: async (id: string, categoryData: { name?: string; description?: string; slug?: string }) => {
    try {
      const response = await apiClient.patch(`/categories/${id}`, categoryData)
      return toCamelCase(response.data)
    } catch (error) {
      console.error("Error updating category:", error)
      throw error
    }
  },

  deleteCategory: async (id: string) => {
    try {
      await apiClient.delete(`/categories/${id}`)
      return true
    } catch (error) {
      console.error("Error deleting category:", error)
      throw error
    }
  },

  updateCategoryImage: async (id: string, imageFile: File) => {
    try {
      const formData = new FormData()
      formData.append("image", imageFile)

      const response = await apiClient.post(`/category/${id}/media`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      console.error("Error updating category image:", error)
      throw error
    }
  },

  // Reports
  getReports: async (params: { limit?: number; offset?: number; since?: string; sort?: string }) => {
    try {
      const response = await apiClient.get("/reports", { params })
      return toCamelCase(response.data)
    } catch (error) {
      console.error("Error fetching reports:", error)
      throw error
    }
  },

  getReport: async (id: string) => {
    try {
      const response = await apiClient.get(`/reports/${id}`)
      return toCamelCase(response.data)
    } catch (error) {
      console.error("Error fetching report:", error)
      throw error
    }
  },

  dismissReport: async (id: string) => {
    try {
      const response = await apiClient.get(`/reports/${id}/dismiss`)
      return toCamelCase(response.data)
    } catch (error) {
      console.error("Error dismissing report:", error)
      throw error
    }
  },

  resolveReport: async (id: string) => {
    try {
      const response = await apiClient.get(`/reports/${id}/resolve`)
      return toCamelCase(response.data)
    } catch (error) {
      console.error("Error resolving report:", error)
      throw error
    }
  },

  markReportUnderReview: async (id: string) => {
    try {
      const response = await apiClient.get(`/reports/${id}/under-review`)
      return toCamelCase(response.data)
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
