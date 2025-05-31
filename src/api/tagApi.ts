import apiClient from "@/api/client"
import config from "@/config/api.config"
import type { Tag, CreateUserTagsPayload } from "@/types/tag.types"

// Mock data for development since the tags endpoint isn't implemented yet
const mockTags: Tag[] = [
  { id: "1", name: "Electronics" },
  { id: "2", name: "Furniture" },
  { id: "3", name: "Vehicles" },
  { id: "4", name: "Apartments" },
  { id: "5", name: "Houses" },
  { id: "6", name: "Office Space" },
  { id: "7", name: "Tools" },
  { id: "8", name: "Sports Equipment" },
  { id: "9", name: "Clothing" },
  { id: "10", name: "Books" },
  { id: "11", name: "Music Equipment" },
  { id: "12", name: "Photography" },
  { id: "13", name: "Gaming" },
  { id: "14", name: "Garden & Outdoor" },
  { id: "15", name: "Kitchen Appliances" },
]

export const tagApi = {
  // Get all available tags
  getAllTags: async (): Promise<Tag[]> => {
    try {
      if (config.useMockApi) {
        console.log("Using mock API for tags")
        return mockTags
      }

      // Once the backend endpoint is implemented, use this:
      const response = await apiClient.get<Tag[]>("/tags")
      return response.data
    } catch (error) {
      console.error("Error fetching tags:", error)
      // Fallback to mock data if API fails
      return mockTags
    }
  },

  // Get user's selected tags
  getUserTags: async (userId: string): Promise<Tag[]> => {
    try {
      if (config.useMockApi) {
        console.log("Using mock API for user tags")
        // Return empty array for mock since users won't have tags initially
        return []
      }

      const response = await apiClient.get<Tag[]>(`/users/${userId}/tags`)
      return response.data
    } catch (error) {
      console.error("Error fetching user tags:", error)
      return []
    }
  },

  // Update user's selected tags
  updateUserTags: async (userId: string, tagIds: string[]): Promise<void> => {
    try {
      if (config.useMockApi) {
        console.log("Mock API: Updating user tags for user", userId, "with tags:", tagIds)
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        return
      }

      const payload: CreateUserTagsPayload = { tag_ids: tagIds }
      await apiClient.post(`/users/${userId}/tags`, payload)
    } catch (error) {
      console.error("Error updating user tags:", error)
      throw error
    }
  },

  // Remove a specific tag from user
  removeUserTag: async (userId: string, tagId: string): Promise<void> => {
    try {
      if (config.useMockApi) {
        console.log("Mock API: Removing tag", tagId, "from user", userId)
        await new Promise(resolve => setTimeout(resolve, 300))
        return
      }

      await apiClient.delete(`/user/${userId}/tag/${tagId}`)
    } catch (error) {
      console.error("Error removing user tag:", error)
      throw error
    }
  }
}
